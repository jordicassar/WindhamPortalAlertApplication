import Link from 'next/link';
import { Suspense } from 'react';
import { logout } from '@/app/actions/auth';
import { getCurrentUser } from '@/lib/dal';

const navLink =
  'rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/90 hover:bg-white/15 hover:text-white';

export function SiteHeader() {
  return (
    <header className="bg-header text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-full bg-white text-lg font-extrabold text-[#1f4e79]"
          >
            W
          </span>
          <span>
            <span className="block text-base font-bold leading-tight sm:text-lg">
              Windham Community Notifications
            </span>
            <span className="block text-[0.7rem] uppercase tracking-widest text-white/75">
              Town alerts &amp; news
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
        <span className="hidden px-2 text-xs text-white/75 md:inline">{user.name}</span>
        <button type="submit" className={navLink}>
          Sign out
        </button>
      </form>
    </>
  );
}
