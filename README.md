# Windham Community Notification Portal

[![CI on main](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml?query=branch%3Amain+event%3Apush)
[![CI on latest pull request](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml/badge.svg?event=pull_request)](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml?query=event%3Apull_request)

The first badge shows whether `main` is healthy; the second shows the checks on the most recently
updated pull request. Click either one to see the individual runs.

Town alerts for Windham residents: emergency notices, closures and community news, written by
town staff, approved by an administrator, and published to the public site and subscribers.

**Status:** prototype for the sandbox environment (December 2026 milestone).

**Production:** [windhamportalalertapplication.vercel.app](https://windhamportalalertapplication.vercel.app)
(public, deployed from `main`; see [Deploying](#deploying-sandbox))

## What it does

| Who                                | Can                                                                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Residents** (no account)         | Read current and past alerts, filter by topic and severity, search, open a shareable link for any alert, subscribe by email or text, unsubscribe      |
| **Publishers** (town staff)        | Write alerts with a rich-text editor (bold, headings, lists, **hyperlinks, photos**), preview, save drafts, submit for approval, fix alerts sent back |
| **Admins** (Town Manager's office) | Approve or send back alerts, archive alerts, manage staff accounts and categories, view the audit log                                                 |

Emergency alerts appear as a red banner on every resident page and go to every subscriber.
All times are shown and entered in Eastern time (America/New_York).

## Tech stack

- **Next.js 16** (React 19, TypeScript, App Router, Server Actions)
- **Tailwind CSS 4** for styling
- **PostgreSQL** with **Prisma 7**
- **Tiptap** rich-text editor
- Signed-cookie staff sessions (`jose`) with bcrypt-hashed passwords
- `sanitize-html` allowlist for alert HTML; `zod` for validating every form

## Running it locally

Prerequisites: Node 22+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL, SESSION_SECRET, SEED_STAFF_PASSWORD
npm run db:migrate          # create the tables
npm run db:seed             # sample categories, staff accounts and alerts
npm run dev                 # http://localhost:3000
```

Demo staff accounts (password is your `SEED_STAFF_PASSWORD`):

| Email                         | Role      |
| ----------------------------- | --------- |
| `admin@windham.example`       | Admin     |
| `boe@windham.example`         | Publisher |
| `publicworks@windham.example` | Publisher |

Useful scripts: `npm run lint`, `npm run typecheck`, `npm run format`, `npm run build`.

## Deploying (sandbox)

**Production:** [windhamportalalertapplication.vercel.app](https://windhamportalalertapplication.vercel.app)

| Piece    | Where                                                                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting  | Vercel project [`windham_portal_alert_application`](https://vercel.com/jordicassars-projects/windham_portal_alert_application) (team `jordicassars-projects`)                                              |
| Database | Neon Postgres [`windham-portal-db`](https://vercel.com/d/dashboard/integrations/neon/icfg_oJkNMdaN3SPpTrUh8L6yhOA2/resources/store_sSeUS6j5QOszj9GE) (free plan, `iad1`), added via the Vercel Marketplace |
| Source   | GitHub [`jordicassar/WindhamPortalAlertApplication`](https://github.com/jordicassar/WindhamPortalAlertApplication), connected to the Vercel project                                                        |

The production address above is **public**: anyone with the link can open it. Preview URLs and
per-deployment URLs (the ones ending in `-jordicassars-projects.vercel.app`) are behind **Vercel
Authentication** (Settings → Deployment Protection), so only people signed in to the Vercel team
can open those.

### How a deploy works

Pushes to `main` deploy to production, and every pull request gets its own preview URL. Vercel
runs `npm run vercel-build`, which:

1. generates the Prisma client,
2. applies any pending migrations to Neon (`prisma migrate deploy`), and
3. runs `next build`, which prerenders the residents' page from the database.

If the build fails, the previous deployment stays live. To deploy without a push, run
`vercel --prod` from a linked checkout (`vercel link`), or use **Redeploy** in the dashboard on a
deployment of the latest commit.

Preview builds use the Preview environment variables. If **preview branching** is enabled on the
Neon resource, each preview gets its own copy of the database; otherwise a pull request's
migration is applied to the shared sandbox database when its preview builds.

### Environment variables

| Variable                | Value                                                                   |
| ----------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`          | Set by the Neon integration: **pooled** connection (host has `-pooler`) |
| `DATABASE_URL_UNPOOLED` | Set by the Neon integration: direct connection, used by migrations      |
| `SESSION_SECRET`        | Random 32+ character string: `openssl rand -base64 32`                  |
| `SEED_STAFF_PASSWORD`   | Password for the demo staff accounts; share it privately with the team  |

The Neon integration also adds `POSTGRES_*`, `PG*` and `NEON_PROJECT_ID`; the app doesn't use
them.

### Seeding the sandbox (once)

Deploys create the tables but not the demo data. Seed from your machine with the production
variables; the seed is safe to re-run and only adds what's missing:

```bash
vercel env pull /tmp/windham-prod.env --environment=production --yes
(set -a; . /tmp/windham-prod.env; set +a; DATABASE_URL="$DATABASE_URL_UNPOOLED" npx prisma db seed)
rm -f /tmp/windham-prod.env
```

The residents' page picks up the new data within a minute; no redeploy is needed. Don't pull
production variables into `.env.local`: Next.js would load them for `npm run dev` ahead of your
local `.env`.

## Built to handle traffic spikes

A storm or emergency sends many residents to the site at once. The design keeps that load off
the database:

- **Public pages are cached.** The residents' page is prerendered and served from the CDN. It is
  regenerated the moment an admin publishes or archives an alert (`updateTag`), and at least every
  minute so expired alerts drop off. Filtering and search run in the browser on the cached list.
- **Photos are cached forever.** Each image URL is immutable, so after the first view the CDN
  serves it without touching the server.
- **Connection pooling.** The app connects through Neon's pooler with a small per-instance pool,
  so many serverless instances don't exhaust Postgres connections.
- **Stateless sessions.** Staff sessions are signed cookies, so any instance can serve any request.
- **Notification outbox.** Approving an alert writes a `Dispatch` row instead of sending messages
  inline. A background worker (next step) fans it out in batches, so publishing stays instant
  whether there are 10 subscribers or 10,000.

## Before production

These are known gaps, tracked for the Requirements group's security and hosting work:

- [ ] **Send notifications:** a worker that processes `Dispatch` rows via an email and SMS provider
      (e.g. Postmark or SendGrid for email, Twilio for SMS), with retries and rate limiting
- [ ] **Subscriber verification:** double opt-in (confirm by email or text) before a subscription
      is saved or changed
- [ ] **Rate limiting** on sign-in and subscribe (needs a shared store such as Redis)
- [ ] **Staff sign-in hardening:** password reset, forced change of temporary passwords, and ideally
      town single sign-on (e.g. Microsoft Entra ID) with MFA
- [ ] **Image storage:** move photos from Postgres to object storage (Vercel Blob or S3)
- [ ] **Content Security Policy** header
- [ ] **Load test** the public page (e.g. k6) against the sandbox
- [ ] **Accessibility audit** (WCAG 2.1 AA) and automated tests

## Project layout

```
prisma/               Database schema, migrations and seed data
src/app/              Pages and server actions
  page.tsx            Residents' home (cached)
  alerts/[id]/        Shareable alert page
  publisher/          Publisher workspace and editor
  admin/              Approval queue, staff, categories, audit log
  actions/            Server actions (each checks permissions itself)
  api/images/         Photo upload and delivery
src/components/       Shared UI, alert editor
src/lib/              Database client, auth, sanitizer, validation, cached queries
src/proxy.ts          Redirects signed-out or non-admin users away from staff pages
```
