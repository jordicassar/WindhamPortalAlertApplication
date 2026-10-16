# Windham Community Notification Portal

[![CI on main](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml?query=branch%3Amain+event%3Apush)
[![CI on latest pull request](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml/badge.svg?event=pull_request)](https://github.com/jordicassar/WindhamPortalAlertApplication/actions/workflows/ci.yml?query=event%3Apull_request)

The first badge shows whether `main` is healthy; the second shows the checks on the most recently
updated pull request. Click either one to see the individual runs.

Town alerts for Windham residents: emergency notices, closures and community news, written by
town staff, approved by an administrator, and published to the public site and subscribers.

**Status:** prototype for the sandbox environment (December 2026 milestone).

**Production:** [windhamportalalertapplication.vercel.app](https://windhamportalalertapplication.vercel.app)
(public, deployed from `release`; see [Environments and releases](#environments-and-releases))

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

Instead of a local Postgres you can use the shared **development** database on Neon, if you have
access to the owner's Vercel account (free plan): run `vercel link`, then
`vercel env pull .env --environment=development --yes`, and skip `db:migrate` and `db:seed`.
`.env.example` describes both options. Never point a local `.env` at production.

Demo staff accounts (password is your `SEED_STAFF_PASSWORD`):

| Email                         | Role      |
| ----------------------------- | --------- |
| `admin@windham.example`       | Admin     |
| `boe@windham.example`         | Publisher |
| `publicworks@windham.example` | Publisher |

Useful scripts: `npm run lint`, `npm run typecheck`, `npm run format`, `npm run build`.

## Environments and releases

Changes are tested before residents see them. Each environment has its own Neon database branch,
so pull request previews never touch production data.

| Environment     | Used for                                        | Code             | Database (Neon branch) | URL                                                                                          |
| --------------- | ----------------------------------------------- | ---------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| **Development** | Local work and every pull request preview       | feature branches | `development`          | `localhost:3000` and each pull request's preview link                                        |
| **Staging**     | Requirements group testing and acceptance (UAT) | `main`           | `staging`              | stable staging domain on Vercel (to be added, e.g. `windham-alerts-staging.vercel.app`)      |
| **Production**  | Residents                                       | `release`        | `main`                 | [windhamportalalertapplication.vercel.app](https://windhamportalalertapplication.vercel.app) |

### Release flow

1. **Feature branch → pull request into `main`.** CI runs, and Vercel builds a preview that uses
   the development database. Review the change on the preview link.
2. **Merge into `main`.** Vercel deploys it to staging, with the staging database. Test it there,
   and have the Requirements group check it if needed.
3. **Promote: pull request from `main` into `release`.** Title it e.g. `Release 2026-10-15` and
   list what's included. Once CI passes and it is merged, Vercel deploys `release` to production.
   Production data is never reset or seeded.

Never commit straight to `release`, and never merge a feature branch into it: everything reaches
production through `main`, so production only ever runs code that was on staging first.

**If a release breaks production,** use **Instant Rollback** in Vercel (project → Deployments →
⋯ on the last good production deployment), then fix forward through `main` as usual.

### Who can promote `main` → `release`

`main` and `release` are both protected: changes only arrive by pull request, CI must pass, and
the branches can't be force-pushed or deleted. Any collaborator with write access can open the
`main` → `release` pull request. The repository owner (@jordicassar) merges it, after the change
has been checked on staging; they can name other people to do this.

## Deploying

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

Pushes to `release` deploy to production, pushes to `main` deploy to staging, and every pull
request gets its own preview URL. Vercel runs `npm run vercel-build`, which:

1. generates the Prisma client,
2. applies any pending migrations to that environment's Neon database (`prisma migrate deploy`),
   and
3. runs `next build`, which prerenders the residents' page from the database.

If the build fails, the previous deployment stays live. A migration in a pull request is first
applied to the development database (preview), then staging (merge to `main`), and only reaches
production when it is released.

### Environment variables

Each environment has its own values in Vercel:

| Variable                | Value                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | **Pooled** connection (host has `-pooler`) to that environment's Neon branch                      |
| `DATABASE_URL_UNPOOLED` | Direct connection to the same branch, used by migrations                                          |
| `SESSION_SECRET`        | Random 32+ character string, different per environment: `openssl rand -base64 32`                 |
| `SEED_STAFF_PASSWORD`   | Password for the demo staff accounts in development and staging; share it privately with the team |

Production's database variables come from the Neon integration. Development and all preview
branches use the `development` branch; previews of `main` (staging) use the `staging` branch.
The Neon integration also adds `POSTGRES_*`, `PG*` and `NEON_PROJECT_ID`; the app doesn't use
them.

### Seeding development and staging

Deploys create the tables but not the demo data. Seed development and staging from your machine
with their direct connection strings (kept in `.env.environments`, which git ignores; ask the
owner for them). The seed is safe to re-run and only adds what's missing:

```bash
(set -a; . ./.env.environments; set +a
 for url in "$DEV_DATABASE_URL_UNPOOLED" "$STAGING_DATABASE_URL_UNPOOLED"; do
   DIRECT_URL="$url" DATABASE_URL="$url" npx prisma migrate deploy &&
   DIRECT_URL="$url" DATABASE_URL="$url" npx prisma db seed
 done)
```

Setting `DIRECT_URL` matters: it takes precedence over anything in your local `.env`.

**Never seed production.** It holds real alerts and staff accounts; the demo accounts and their
shared password must not exist there. Don't pull production variables into `.env` or
`.env.local`.

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
