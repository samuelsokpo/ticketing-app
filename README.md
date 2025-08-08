# Ticketing App — Minimalist Futuristic Scaffold

A starter scaffold for a minimalist, futuristic ticketing web app (Next.js + TypeScript + Prisma + PostgreSQL).
This initial deliverable includes the landing page, signup page, database schema, and basic API endpoints for signup, purchase creation, and Paystack webhook handling.

## Quick start (local)

1. **Unzip** the archive and `cd ticketing-app`.
2. Create a `.env` from `.env.example` and fill values.
3. Install dependencies:

```bash
npm install
# or
yarn
```

4. Generate Prisma client & run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
# If using the TS seed script:
node prisma/seed.js
```

5. Start dev server:

```bash
npm run dev
```

Open http://localhost:3000 — you should see the landing page with the hero: **\"The Future of Events Has Arrived\"** and CTA **\"Explore Events Near You\"**.

## Environment variables

Copy `.env.example` -> `.env` and set the real values.

- `DATABASE_URL` — Postgres connection string.
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `JWT_SECRET`

