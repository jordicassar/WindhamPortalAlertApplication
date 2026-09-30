import Link from 'next/link';
import { Suspense } from 'react';
import { logout } from '@/app/actions/auth';
import { getCurrentUser } from '@/lib/dal';
import { BellIcon, UserIcon } from './icons';

const navLink =
  'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white';

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-header text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-xl">
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-white to-[#cfe0f5] text-[#0e2b4b] shadow-md"
          >
            <BellIcon className="size-6" />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight sm:text-xl">Windham</span>
            <span className="block text-sm leading-tight text-white/80">
              Community Notifications
            </span>
          </span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
          <Link href="/" className={navLink}>
            Alerts
          </Link>
          {/* Reads the session cookie, so it streams in without making the page dynamic. */}
          <Suspense fallback={null}>
            <StaffNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function StaffNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" className={navLink}>
        <UserIcon className="size-5" />
        Staff sign in
      </Link>
    );
  }
  return (
    <>
      <Link href="/publisher" className={navLink}>
        Publisher
      </Link>
      {user.role === 'ADMIN' && (
        <Link href="/admin" className={navLink}>
          Admin
        </Link>
      )}
      <form action={logout} className="flex items-center">
        <span className="hidden px-2 text-sm text-white/80 md:inline">{user.name}</span>
        <button type="submit" className={navLink}>
          Sign out
        </button>
      </form>
    </>
  );
}
