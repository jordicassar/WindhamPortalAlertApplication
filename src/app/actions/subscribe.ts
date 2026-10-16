'use server';

import { redirect } from 'next/navigation';
import { isHoneypotFilled } from '@/components/honeypot-field';
import { logAudit } from '@/lib/audit';
import { db } from '@/lib/db';
import { clientIp, LIMITS, rateLimit, retryMessage } from '@/lib/rate-limit';
import { verifyTurnstile } from '@/lib/turnstile';
import { firstError, subscribeSchema, type ActionState } from '@/lib/validation';

export type SubscribeState = ActionState & { unsubscribeToken?: string };

const HUMAN_CHECK_FAILED =
  "We couldn't confirm you're not a robot. Please complete the check above the Subscribe button and try again.";

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Bot defences, cheapest first. A filled honeypot gets a normal-looking reply so
  // the bot has no signal that it was caught; nothing is saved.
  if (isHoneypotFilled(formData)) return { message: "You're subscribed to Windham alerts." };

  const ip = await clientIp();
  const ipLimit = await rateLimit('subscribe-ip', ip, LIMITS.subscribeIp);
  if (!ipLimit.ok) return { error: retryMessage(ipLimit.retryAfterSeconds) };

  if (!(await verifyTurnstile(formData.get('cf-turnstile-response'), ip))) {
    return { error: HUMAN_CHECK_FAILED };
  }

  const parsed = subscribeSchema.safeParse({
    email: formData.get('email') ?? undefined,
    phone: formData.get('phone') ?? undefined,
    viaEmail: formData.get('viaEmail') === 'on',
    viaSms: formData.get('viaSms') === 'on',
    emergencyOnly: formData.get('emergencyOnly') === 'on',
    categoryIds: formData.getAll('categoryIds').map(String),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const s = parsed.data;

  const email = s.viaEmail ? s.email : undefined;
  const phone = s.viaSms ? s.phone : undefined;

  // Stop anyone repeatedly changing one person's subscription, even from many IPs.
  for (const contact of [email, phone]) {
    if (!contact) continue;
    const contactLimit = await rateLimit('subscribe-contact', contact, LIMITS.subscribeContact);
    if (!contactLimit.ok) return { error: retryMessage(contactLimit.retryAfterSeconds) };
  }

  const data = {
    email: email ?? null,
    phone: phone ?? null,
    viaEmail: s.viaEmail,
    viaSms: s.viaSms,
    emergencyOnly: s.emergencyOnly,
    categories: { set: s.categoryIds.map((id) => ({ id })) },
  };

  // Update an existing subscription with the same email or phone rather than duplicating it.
  const existing = await db.subscriber.findFirst({
    where: { OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] },
  });
  try {
    const saved = existing
      ? await db.subscriber.update({ where: { id: existing.id }, data })
      : await db.subscriber.create({
          data: { ...data, categories: { connect: s.categoryIds.map((id) => ({ id })) } },
        });
    await logAudit('resident', existing ? 'Updated subscription' : 'Subscribed', '');
    // TODO before production: confirm ownership of the email/phone (double opt-in) before
    // saving changes, and deliver the unsubscribe link in that confirmation message.
    // The link is only shown on first sign-up so it can't be obtained by typing
    // someone else's email.
    return existing
      ? { message: 'Your preferences were updated.' }
      : {
          message: "You're subscribed to Windham alerts.",
          unsubscribeToken: saved.unsubscribeToken,
        };
  } catch {
    return { error: 'That email or phone number is already used by another subscription.' };
  }
}

export async function unsubscribe(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '');
  const result = await db.subscriber.deleteMany({ where: { unsubscribeToken: token } });
  if (result.count) await logAudit('resident', 'Unsubscribed', '');
  redirect('/unsubscribed');
}
