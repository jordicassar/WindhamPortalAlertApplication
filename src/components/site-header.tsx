import Link from 'next/link';
import { Suspense } from 'react';
import { logout } from '@/app/actions/auth';
import { getCurrentUser } from '@/lib/dal';
import { UserIcon } from './icons';
import { SiteHeaderContent } from './site-header-content';

const navLink =
  'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white';

export function SiteHeader() {
  return (
    <SiteHeaderContent>
      <Suspense fallback={null}>
        <StaffNav />
      </Suspense>
    </SiteHeaderContent>
  );
}

async function StaffNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" className={navLink}>
        <UserIcon className="size-5" />
        <LanguageLabel english="Staff sign in" spanish="Acceso del personal" />
      </Link>
    );
  }
  return (
    <>
      <Link href="/publisher" className={navLink}>
        <LanguageLabel english="Publisher" spanish="Publicador" />
      </Link>
      {user.role === 'ADMIN' && (
        <Link href="/admin" className={navLink}>
          <LanguageLabel english="Admin" spanish="Administración" />
        </Link>
      )}
      <form action={logout} className="flex items-center">
        <span className="hidden px-2 text-sm text-white/80 md:inline">{user.name}</span>
        <button type="submit" className={navLink}>
          <LanguageLabel english="Sign out" spanish="Cerrar sesión" />
        </button>
      </form>
    </>
  );
}

function LanguageLabel({ english, spanish }: { english: string; spanish: string }) {
  return (
    <>
      <span className="language-en" lang="en">
        {english}
      </span>
      <span className="language-es" lang="es">
        {spanish}
      </span>
    </>
  );
}
