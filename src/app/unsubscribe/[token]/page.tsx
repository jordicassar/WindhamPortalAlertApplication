import type { Metadata } from 'next';
import { UnsubscribeContent } from '@/components/resident-pages';

export const metadata: Metadata = { title: 'Unsubscribe', robots: { index: false } };

export default async function UnsubscribePage({ params }: PageProps<'/unsubscribe/[token]'>) {
  const { token } = await params;
  return <UnsubscribeContent token={token} />;
}
