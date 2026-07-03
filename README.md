# Casements Africa Limited — Website

A Next.js 14 (App Router) rebuild of [casements.co.ug](https://casements.co.ug) with a built-in,
CRM-connected lead-capture system. Built from the internal Developer Documentation v1.0.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| ORM / DB | Prisma + PostgreSQL |
| Auth | NextAuth.js (credentials) for the `/crm` dashboard |
| Email | Resend (falls back to console logging in dev) |
| Analytics | Google Analytics 4 via `@next/third-parties` |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your secrets

# Database (requires a PostgreSQL instance in DATABASE_URL)
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed              # creates gm@ and sales@ users (password: ChangeMe!2026)

npm run dev                  # http://localhost:3000  ·  CRM: /crm
```

> The public marketing site runs without a database. The `/crm` dashboard, `/api/quote`
> and `/api/crm/*` routes require `DATABASE_URL` to be reachable.

## Structure

- `app/` — routes (public pages, `/crm` dashboard, `/api/*` routes)
- `components/` — `layout/`, `home/`, `products/`, `crm/`, `ui/`
- `lib/` — `db`, `crm`, `email`, `whatsapp`, `auth`, `products`, `projects`, `site`
- `prisma/` — schema + seed

## Routes

Public: `/`, `/about-us`, `/products`, `/products/[slug]` (9 categories), `/projects`, `/csr`,
`/testimonials`. Auth-protected CRM: `/crm`, `/crm/leads`, `/crm/leads/[id]`, `/crm/login`.

## Deployment

Deploy to Vercel: connect the repo, add all `.env.local` variables in project settings,
run `prisma migrate deploy` against the production database, and point `casements.co.ug` at Vercel.
See §16 of the developer documentation for the full checklist.
# casements
