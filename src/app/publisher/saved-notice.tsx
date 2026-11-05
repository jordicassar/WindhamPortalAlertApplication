'use client';

import { useEffect } from 'react';
import { Notice } from '@/components/ui';

/**
 * "Submitted for approval." / "Draft saved." after the editor redirects here. Shown once:
 * it removes ?saved= from the address, so reloading the page doesn't show it again.
 */
export function SavedNotice({ saved }: { saved: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('saved');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, []);

  return (
    <Notice kind="ok">{saved === 'submitted' ? 'Submitted for approval.' : 'Draft saved.'}</Notice>
  );
}
