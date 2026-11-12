import type { Metadata } from 'next';
import { UnsubscribedContent } from '@/components/resident-pages';

export const metadata: Metadata = { title: 'Unsubscribed', robots: { index: false } };

export default function UnsubscribedPage() {
  return <UnsubscribedContent />;
}
