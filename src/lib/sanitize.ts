import sanitize from 'sanitize-html';

/**
 * Allowlist sanitizer for alert bodies. Publishers can add formatting, links and
 * photos, so bodies are HTML; anything not listed here is stripped before it is
 * stored and again when it is rendered, which blocks script injection (XSS).
 */

/** Photos must be uploaded through the portal or served over HTTPS. */
const IMAGE_SRC = /^(https:\/\/|\/api\/images\/[a-z0-9]+$)/i;

const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'h2',
    'h3',
    'ul',
    'ol',
    'li',
    'blockquote',
    'hr',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { href: attribs.href ?? '', target: '_blank', rel: 'noopener noreferrer nofollow' },
    }),
  },
  exclusiveFilter: (frame) => frame.tag === 'img' && !IMAGE_SRC.test(frame.attribs.src ?? ''),
};

export function sanitizeAlertHtml(dirty: string): string {
  return sanitize(dirty, OPTIONS);
}

/** Plain-text version of an alert body, for previews, search and SMS. */
export function alertHtmlToText(html: string): string {
  return decodeEntities(
    sanitize(html.replace(/<\/(p|li|h2|h3|blockquote)>|<br\s*\/?>/gi, ' $&'), {
      allowedTags: [],
      allowedAttributes: {},
    }),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/**
 * Decode the entities sanitize-html emits, in a single pass. Decoding one entity at a time
 * would decode twice: text containing a literal "&lt;" is escaped to "&amp;lt;", and
 * replacing "&amp;" first would turn that back into "&lt;" and then into "<".
 */
function decodeEntities(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity]);
}
