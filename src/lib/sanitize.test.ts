import { describe, expect, it } from 'vitest';
import { alertHtmlToText, sanitizeAlertHtml } from './sanitize';

describe('sanitizeAlertHtml', () => {
  it('keeps the formatting publishers are allowed to use', () => {
    const html =
      '<h2>Road closed</h2><p><strong>Main St</strong> is <em>closed</em>.</p><ul><li>Detour</li></ul>';
    expect(sanitizeAlertHtml(html)).toBe(html);
  });

  it('removes scripts and their contents', () => {
    expect(sanitizeAlertHtml('<p>Hi</p><script>alert(1)</script>')).toBe('<p>Hi</p>');
  });

  it('removes event-handler attributes', () => {
    expect(sanitizeAlertHtml('<p onclick="alert(1)">Hi</p>')).toBe('<p>Hi</p>');
  });

  it('removes javascript: links but keeps the link text', () => {
    expect(sanitizeAlertHtml('<a href="javascript:alert(1)">Click</a>')).not.toContain(
      'javascript',
    );
    expect(sanitizeAlertHtml('<a href="javascript:alert(1)">Click</a>')).toContain('Click');
  });

  it('forces safe link attributes on allowed links', () => {
    const out = sanitizeAlertHtml('<a href="https://example.org" target="_self">Info</a>');
    expect(out).toContain('href="https://example.org"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it('allows mailto: and tel: links', () => {
    expect(sanitizeAlertHtml('<a href="tel:+18605550123">Call</a>')).toContain(
      'href="tel:+18605550123"',
    );
    expect(sanitizeAlertHtml('<a href="mailto:clerk@example.org">Email</a>')).toContain(
      'href="mailto:clerk@example.org"',
    );
  });

  it('keeps uploaded and https images', () => {
    expect(sanitizeAlertHtml('<img src="/api/images/abc123" alt="Map">')).toContain(
      'src="/api/images/abc123"',
    );
    expect(sanitizeAlertHtml('<img src="https://example.org/a.jpg" alt="">')).toContain(
      'src="https://example.org/a.jpg"',
    );
  });

  it('drops images from other sources', () => {
    expect(sanitizeAlertHtml('<img src="http://example.org/a.jpg">')).toBe('');
    expect(sanitizeAlertHtml('<img src="data:image/png;base64,AAAA">')).toBe('');
    expect(sanitizeAlertHtml('<img src="/api/images/../../etc/passwd">')).toBe('');
  });

  it('strips tags that are not on the allowlist', () => {
    expect(sanitizeAlertHtml('<iframe src="https://example.org"></iframe><p>ok</p>')).toBe(
      '<p>ok</p>',
    );
  });
});

describe('alertHtmlToText', () => {
  it('separates paragraphs and list items with spaces', () => {
    expect(alertHtmlToText('<p>Schools closed.</p><p>Buses delayed.</p>')).toBe(
      'Schools closed. Buses delayed.',
    );
    expect(alertHtmlToText('<ul><li>One</li><li>Two</li></ul>')).toBe('One Two');
  });

  it('decodes entities back to plain characters', () => {
    expect(alertHtmlToText('<p>Fish &amp; Chips &lt;3 &quot;quoted&quot;</p>')).toBe(
      'Fish & Chips <3 "quoted"',
    );
  });

  it('decodes each entity only once (CodeQL js/double-escaping)', () => {
    // The alert literally says "&lt;" (escaped once in the HTML); it must stay "&lt;", not become "<".
    expect(alertHtmlToText('<p>Type &amp;lt; for less-than</p>')).toBe('Type &lt; for less-than');
    expect(alertHtmlToText('<p>&amp;amp;</p>')).toBe('&amp;');
  });

  it('drops markup entirely', () => {
    expect(alertHtmlToText('<p>Hi<script>alert(1)</script></p>')).toBe('Hi');
  });
});
