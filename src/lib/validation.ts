import { z } from 'zod';
import { fromEasternInput } from './format';
import { inLocationBounds } from './map';

const trimmed = (max: number) => z.string().trim().max(max);
const emailField = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.'));

const easternDateTime = (message: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || fromEasternInput(v) !== null, message)
    .transform((v) => (v ? fromEasternInput(v) : null));

const coordinate = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .refine((v) => v === null || Number.isFinite(v), 'The map location is not valid.');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Enter your password.').max(200),
});

export const alertSchema = z
  .object({
    id: z
      .cuid()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    title: trimmed(120).min(1, 'Add a title.'),
    bodyHtml: z.string().max(200_000, 'The message is too long.'),
    categoryId: z.cuid('Choose a category.'),
    severity: z.enum(['INFO', 'ADVISORY', 'EMERGENCY']),
    publishAt: easternDateTime('Enter a valid publish time.'),
    expiresAt: easternDateTime('Enter a valid expiry time.'),
    latitude: coordinate,
    longitude: coordinate,
    locationName: trimmed(120)
      .optional()
      .transform((v) => v || null),
    intent: z.enum(['draft', 'submit']),
  })
  .superRefine((a, ctx) => {
    if ((a.latitude === null) !== (a.longitude === null))
      ctx.addIssue({ code: 'custom', message: 'The map location is not valid.' });
    else if (a.latitude !== null && a.longitude !== null) {
      if (!inLocationBounds(a.latitude, a.longitude))
        ctx.addIssue({ code: 'custom', message: 'Pick a location in or near Windham.' });
      // The name is what screen reader users and the list view get instead of the map.
      if (!a.locationName)
        ctx.addIssue({
          code: 'custom',
          message: 'Describe the location in words, e.g. "Main St at Route 6".',
        });
    }
  });

export const staffSchema = z.object({
  name: trimmed(80).min(1, 'Enter a name.'),
  email: emailField,
  department: trimmed(80).min(1, 'Enter a department.'),
  role: z.enum(['PUBLISHER', 'ADMIN']),
  password: z.string().min(12, 'Temporary passwords must be at least 12 characters.').max(200),
});

export const categorySchema = z.object({
  name: trimmed(40).min(1, 'Enter a category name.'),
});

export const subscribeSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .optional()
      .transform((v) => v || undefined),
    phone: z
      .string()
      .optional()
      .transform((v) => {
        const digits = (v ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
        return digits || undefined;
      }),
    viaEmail: z.boolean(),
    viaSms: z.boolean(),
    emergencyOnly: z.boolean(),
    categoryIds: z.array(z.cuid()).max(50),
  })
  .superRefine((s, ctx) => {
    if (!s.viaEmail && !s.viaSms)
      ctx.addIssue({ code: 'custom', message: 'Choose email, text message, or both.' });
    if (s.viaEmail && !z.email().safeParse(s.email).success)
      ctx.addIssue({ code: 'custom', message: 'Enter a valid email address.' });
    if (s.viaSms && s.phone?.length !== 10)
      ctx.addIssue({ code: 'custom', message: 'Enter a 10-digit mobile number.' });
    if (!s.emergencyOnly && s.categoryIds.length === 0)
      ctx.addIssue({
        code: 'custom',
        message: 'Pick at least one topic, or choose emergency alerts only.',
      });
  });

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Please check the form and try again.';
}

export type ActionState = { error?: string; message?: string };
