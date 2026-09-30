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
  return sanitize(html.replace(/<\/(p|li|h2|h3|blockquote)>|<br\s*\/?>/gi, ' $&'), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
