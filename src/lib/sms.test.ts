import { describe, expect, it } from 'vitest';
import { SMS_MAX_SEGMENTS, smsLength, smsText } from './sms';

const link = 'https://windhamportalalertapplication.vercel.app/alerts/cmabc123def456ghi789jkl0m';

describe('smsLength', () => {
  it('fits 160 plain characters in one text and splits longer ones into 153-character parts', () => {
    expect(smsLength('a'.repeat(160))).toEqual({ encoding: 'GSM', length: 160, segments: 1 });
    expect(smsLength('a'.repeat(161)).segments).toBe(2);
    expect(smsLength('a'.repeat(306)).segments).toBe(2);
    expect(smsLength('a'.repeat(307)).segments).toBe(3);
  });

  it('counts GSM extension characters as two', () => {
    expect(smsLength('€[]').length).toBe(6);
  });

  it('sends the whole message as Unicode if one character needs it', () => {
    // A curly apostrophe, as word processors type it.
    expect(smsLength('Don’t park on Main St')).toEqual({
      encoding: 'Unicode',
      length: 21,
      segments: 1,
    });
    expect(smsLength('’' + 'a'.repeat(70)).segments).toBe(2);
    expect(smsLength('🚨').length).toBe(2);
  });

  it('is empty for no text', () => {
    expect(smsLength('').segments).toBe(0);
  });
});

describe('smsText', () => {
  it('has the severity, title, body, link and opt-out', () => {
    expect(
      smsText({
        severity: 'EMERGENCY',
        title: ' Boil water advisory ',
        bodyText: 'Boil tap water\n before   drinking.',
        link,
      }),
    ).toBe(
      `Windham Emergency: Boil water advisory\nBoil tap water before drinking.\n${link}\nReply STOP to opt out.`,
    );
  });

  it('leaves out an empty body', () => {
    expect(smsText({ severity: 'INFO', title: 'Hi', bodyText: ' ', link })).toBe(
      `Windham Information: Hi\n${link}\nReply STOP to opt out.`,
    );
  });

  it('shortens a long body on a word boundary to fit', () => {
    const bodyText = 'Crews are repairing the water main on Route 6. '.repeat(30);
    const text = smsText({ severity: 'ADVISORY', title: 'Road work', bodyText, link });
    const length = smsLength(text);
    expect(length.segments).toBe(SMS_MAX_SEGMENTS);
    expect(length.encoding).toBe('GSM');
    expect(length.length).toBeGreaterThan(280);
    expect(text).toMatch(/\w\.\.\.\n/);
    expect(text.endsWith(`${link}\nReply STOP to opt out.`)).toBe(true);
  });

  it('replaces curly quotes, dashes and ellipses so the message stays GSM', () => {
    const text = smsText({
      severity: 'INFO',
      title: '“Fall Festival” – Saturday',
      bodyText: 'Don’t miss it…',
      link,
    });
    expect(text).toContain('"Fall Festival" - Saturday\nDon\'t miss it...\n');
    expect(smsLength(text).encoding).toBe('GSM');
  });

  it('shortens Unicode messages to the same number of texts', () => {
    const bodyText = '🚨 Flooding on Route 6. '.repeat(20);
    // A short link: with a full one, Unicode leaves no room for the body at all.
    const text = smsText({ severity: 'EMERGENCY', title: '🚨', bodyText, link: 'https://x.co/a' });
    expect(smsLength(text)).toMatchObject({ encoding: 'Unicode', segments: SMS_MAX_SEGMENTS });
    expect(text).toContain('Flooding');
  });

  it('drops the body if even the title and link need more texts', () => {
    const text = smsText({ severity: 'INFO', title: '🚨'.repeat(60), bodyText: 'Body', link });
    expect(text).not.toContain('Body');
  });
});
