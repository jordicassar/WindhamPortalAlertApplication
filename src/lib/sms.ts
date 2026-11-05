import type { Severity } from '@/generated/prisma/enums';
import { SEVERITY_LABEL } from './format';

/**
 * The text message version of an alert. Shared by the publisher's live preview and the
 * notification sender, so publishers see exactly what subscribers will receive.
 */

/** Longer bodies are shortened so the whole message fits in this many texts. */
export const SMS_MAX_SEGMENTS = 2;

const OPT_OUT = 'Reply STOP to opt out.';

/** Public address residents open from a text; Vercel sets the variable on its deployments. */
export const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://windhamportalalertapplication.vercel.app';

export function alertLink(id: string): string {
  return `${PUBLIC_SITE_URL}/alerts/${id}`;
}

export function smsText({
  severity,
  title,
  bodyText,
  link,
}: {
  severity: Severity;
  title: string;
  /** Plain text of the body (see alertHtmlToText). */
  bodyText: string;
  link: string;
}): string {
  const build = (body: string) =>
    [`Windham ${SEVERITY_LABEL[severity]}: ${plain(title).trim()}`, body, link, OPT_OUT]
      .filter(Boolean)
      .join('\n');
  const body = plain(bodyText).replace(/\s+/g, ' ').trim();
  if (smsLength(build(body)).segments <= SMS_MAX_SEGMENTS) return build(body);

  // Find the longest cut of the body that still fits, then end it on a whole word.
  // "..." rather than "…": the ellipsis character isn't in the GSM alphabet and would
  // make the whole message Unicode, which fits less than half as much per text.
  const shortened = (end: number) => {
    const cut = body.slice(0, end);
    const space = cut.lastIndexOf(' ');
    return `${(space > end - 20 ? cut.slice(0, space) : cut).trimEnd()}...`;
  };
  let lo = 0;
  let hi = body.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (smsLength(build(shortened(mid))).segments <= SMS_MAX_SEGMENTS) lo = mid;
    else hi = mid - 1;
  }
  return build(lo > 0 ? shortened(lo) : '');
}

// Typographic characters that word processors insert, and their GSM equivalents. One of them
// left in would send the whole message as Unicode.
const TYPOGRAPHIC: Record<string, string> = {
  '‘': "'",
  '’': "'",
  '‚': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '–': '-',
  '—': '-',
  '…': '...',
  '\u00a0': ' ',
};

function plain(text: string): string {
  return text.replace(/[‘’‚“”„–—…\u00a0]/g, (ch) => TYPOGRAPHIC[ch]);
}

// The GSM 03.38 alphabet. Messages using only these characters fit 160 per text; the
// extension characters take two places each. Anything else (curly quotes, emoji, "…")
// sends the whole message as Unicode (UCS-2), which fits 70 per text.
const GSM_BASIC = new Set(
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà',
);
const GSM_EXTENSION = new Set('^{}\\[~]|€\f');

export type SmsLength = {
  encoding: 'GSM' | 'Unicode';
  /** Characters as the network counts them. */
  length: number;
  segments: number;
};

export function smsLength(text: string): SmsLength {
  let gsm = 0;
  for (const ch of text) {
    if (GSM_BASIC.has(ch)) gsm += 1;
    else if (GSM_EXTENSION.has(ch)) gsm += 2;
    else {
      // UCS-2 counts UTF-16 code units, so an emoji takes two.
      const length = text.length;
      return { encoding: 'Unicode', length, segments: segmentsFor(length, 70, 67) };
    }
  }
  return { encoding: 'GSM', length: gsm, segments: segmentsFor(gsm, 160, 153) };
}

/** Texts longer than one segment are split, and each part loses room to a joining header. */
function segmentsFor(length: number, single: number, multipart: number): number {
  if (length === 0) return 0;
  return length <= single ? 1 : Math.ceil(length / multipart);
}
