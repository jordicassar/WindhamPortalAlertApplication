import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // Staging and previews are public but hold test data: keep them out of search results so
  // residents only ever find the production site. VERCEL_ENV is set by Vercel at build time.
  ...(process.env.VERCEL_ENV === 'production'
    ? []
    : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
];

const nextConfig: NextConfig = {
  // Enables 'use cache' so the public pages are prerendered and served from cache.
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
