import { db } from '@/lib/db';

export async function GET(_request: Request, ctx: RouteContext<'/api/images/[id]'>) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{20,40}$/i.test(id)) return new Response('Not found', { status: 404 });

  const image = await db.image.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });
  if (!image) return new Response('Not found', { status: 404 });

  return new Response(Buffer.from(image.data), {
    headers: {
      'Content-Type': image.mimeType,
      // Image ids never change content, so browsers and the CDN can keep them forever.
      // After the first view the CDN serves them without touching the database.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}
