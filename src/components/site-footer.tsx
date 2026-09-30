import { BellIcon, PhoneIcon } from './icons';

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"
          >
            <BellIcon className="size-5" />
          </span>
          <div>
            <p className="font-bold">Windham Community Notification Portal</p>
            <p className="mt-0.5 text-muted">
              Official alerts and news from the Town of Windham. Prototype build for the sandbox
              environment.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-emergency-soft px-4 py-3 text-emergency">
          <PhoneIcon className="size-5 shrink-0" />
          <p className="font-semibold">
            In an emergency, always call <span className="font-extrabold">911</span>.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-muted sm:px-6">
          All times are Eastern.
        </p>
      </div>
    </footer>
  );
}
