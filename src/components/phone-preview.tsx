import { smsLength, SMS_MAX_SEGMENTS } from '@/lib/sms';
import { AlertArticle, type AlertView } from './alert-article';
import { cx } from './ui';

/**
 * Live preview of an alert on a resident's phone: the alert page in a phone-width frame,
 * and the text message subscribers receive, with its length.
 */
export function PhonePreview({ alert, sms }: { alert: AlertView; sms: string }) {
  const { encoding, length, segments } = smsLength(sms);
  const perText = encoding === 'GSM' ? 160 : 70;

  return (
    <aside aria-label="Phone preview" className="grid gap-5">
      <section className="grid gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">On a phone</h2>
        {/* Decorative frame; the screen is about the width of a typical phone (375px). */}
        <div className="mx-auto w-full max-w-[24rem] rounded-[2.25rem] border-[10px] border-text bg-text shadow-raised">
          <div className="h-[34rem] overflow-y-auto rounded-[1.6rem] bg-bg p-3">
            <AlertArticle mode="full" alert={alert} />
          </div>
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Text message (SMS)
        </h2>
        <p className="w-fit max-w-full whitespace-pre-wrap wrap-anywhere rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-3 text-sm">
          {sms}
        </p>
        <p
          className={cx(
            'text-sm',
            segments > SMS_MAX_SEGMENTS ? 'font-semibold text-emergency' : 'text-muted',
          )}
          aria-live="polite"
        >
          {length} characters · {segments} {segments === 1 ? 'text' : 'texts'}
          {encoding === 'Unicode' &&
            ` · Contains emoji or special characters, so each text holds ${perText} instead of 160.`}
        </p>
        <p className="text-sm text-muted">
          Long messages are shortened to fit {SMS_MAX_SEGMENTS} texts and link to the full alert.
        </p>
      </section>
    </aside>
  );
}
