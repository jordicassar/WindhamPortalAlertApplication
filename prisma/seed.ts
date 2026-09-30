import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Demo data for local development and the sandbox. Safe to re-run: it only
 * creates records that don't exist yet. Staff passwords come from
 * SEED_STAFF_PASSWORD, so the sandbox never ships with a password in the repo.
 */

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  }),
});

const CATEGORIES = [
  'Roads & Traffic',
  'Weather',
  'Schools (BOE)',
  'Public Safety',
  'Water & Utilities',
  'Community Events',
  'Town Government',
];

const STAFF = [
  {
    email: 'admin@windham.example',
    name: 'Town Manager Office',
    department: 'Administration',
    role: 'ADMIN',
  },
  {
    email: 'boe@windham.example',
    name: 'BOE Communications',
    department: 'Board of Education',
    role: 'PUBLISHER',
  },
  {
    email: 'publicworks@windham.example',
    name: 'Public Works Dispatch',
    department: 'Public Works',
    role: 'PUBLISHER',
  },
] as const;

async function main() {
  const password = process.env.SEED_STAFF_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error('Set SEED_STAFF_PASSWORD (12+ characters) before seeding.');
  }
  const passwordHash = await bcrypt.hash(password, 12);

  for (const name of CATEGORIES) {
    await db.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const s of STAFF) {
    await db.user.upsert({ where: { email: s.email }, update: {}, create: { ...s, passwordHash } });
  }

  if ((await db.alert.count()) > 0) {
    console.log('Alerts already exist; skipping sample alerts.');
    return;
  }

  const cat = Object.fromEntries(
    (await db.category.findMany()).map((c) => [c.name, c.id]),
  ) as Record<string, string>;
  const user = Object.fromEntries((await db.user.findMany()).map((u) => [u.email, u.id])) as Record<
    string,
    string
  >;
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
  const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000);

  await db.alert.createMany({
    data: [
      {
        title: 'Winter storm warning: parking ban in effect tonight',
        bodyHtml:
          '<p>A <strong>parking ban</strong> is in effect on all town roads from <strong>10 PM tonight until 6 AM</strong> so plow crews can clear the streets.</p><p>Vehicles left on the road may be towed. Check the <a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer nofollow">National Weather Service forecast</a> for updates.</p>',
        categoryId: cat['Weather'],
        severity: 'EMERGENCY',
        status: 'PUBLISHED',
        authorId: user['publicworks@windham.example'],
        reviewedById: user['admin@windham.example'],
        publishedAt: hoursAgo(2),
        expiresAt: hoursFromNow(14),
      },
      {
        title: 'Schools open on a two-hour delay tomorrow',
        bodyHtml:
          '<p>All Windham public schools will open on a <strong>two-hour delay</strong>. Morning pre-K is cancelled.</p><ul><li><p>Buses run two hours later than normal</p></li><li><p>Breakfast will not be served</p></li></ul>',
        categoryId: cat['Schools (BOE)'],
        severity: 'ADVISORY',
        status: 'PUBLISHED',
        authorId: user['boe@windham.example'],
        reviewedById: user['admin@windham.example'],
        publishedAt: hoursAgo(4),
      },
      {
        title: 'Road work on Main Street next week',
        bodyHtml:
          '<p>Expect lane closures on Main Street between 9 AM and 3 PM, Monday through Thursday, for drainage repairs. Please use alternate routes where possible.</p>',
        categoryId: cat['Roads & Traffic'],
        severity: 'INFO',
        status: 'PUBLISHED',
        authorId: user['publicworks@windham.example'],
        reviewedById: user['admin@windham.example'],
        publishedAt: hoursAgo(28),
      },
      {
        title: 'Fall Festival on the Town Green this Saturday',
        bodyHtml:
          '<p>Join us for food trucks, live music and a pumpkin carving contest from <strong>11 AM to 4 PM</strong>. Free admission for all residents.</p>',
        categoryId: cat['Community Events'],
        severity: 'INFO',
        status: 'PUBLISHED',
        authorId: user['admin@windham.example'],
        reviewedById: user['admin@windham.example'],
        publishedAt: hoursAgo(48),
      },
      {
        title: 'Boil water advisory for North End residents',
        bodyHtml:
          '<p>Because of a water main break, residents on the affected streets should <strong>boil tap water for one minute</strong> before drinking or cooking until further notice.</p>',
        categoryId: cat['Water & Utilities'],
        severity: 'ADVISORY',
        status: 'PENDING',
        authorId: user['publicworks@windham.example'],
      },
      {
        title: 'Parent-teacher conference schedule',
        bodyHtml: '<p>Conference sign-ups open next Monday. More details to follow.</p>',
        categoryId: cat['Schools (BOE)'],
        severity: 'INFO',
        status: 'DRAFT',
        authorId: user['boe@windham.example'],
      },
    ],
  });
  await db.auditEntry.create({
    data: { actorLabel: 'System', action: 'Demo data loaded', detail: 'Seeded sample alerts' },
  });
  console.log('Seeded demo data.');
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
