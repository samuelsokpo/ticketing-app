# MEMORY & OPERATIONAL DIRECTIVES

## Core Project Context: OKPO Ticketing App
- **Domain**: okpogroup.com
- **Stack**: Next.js (Pages router), Supabase (Auth & Postgres), Prisma ORM, Paystack Payment Gateway, TailwindCSS, Framer Motion.
- **Database Host**: AWS EU West 1 Supabase Pooler (`aws-1-eu-west-1.pooler.supabase.com`)
- **Supabase Project Ref**: `douqqlwazrbnvnzpngmt`
- **Main Event**: "King Jfly Live In Concert" (Slug: `king-jfly-live`, CUID: `cm6d2524d000109mg202h6374`)

---

## Strict Operating Rules

### 1. Zero-Placeholder Policy (MANDATORY)
- **NEVER** replace user credentials or environment variables with placeholder strings like `[YOUR_PASSWORD]`, `[YOUR_API_KEY]`, or `xxx`.
- Always read, reference, and use the exact, active environment values from `.env` and `.env.local`.
- If providing documentation or copy-paste payloads, provide the actual working strings directly so the user can copy-paste in one click without manual substitution.

### 2. Modern Vercel Deployment Workflow
- Use bulk `.env` raw-text import syntax for Vercel rather than individual manual input instructions.
- Ensure `prisma generate` always precedes `next build` in `package.json`.
- All runtime API routes must automatically handle missing Prisma user/wallet/event records gracefully on the fly.

### 3. Verification Before Shipping (Failproof Protocol)
- Every code change must be validated against:
  1. `npx ts-node test-all-flows.ts` (100% pass required)
  2. `npm run build` (0 TypeScript / lint errors required)
- Never assume a fix works until the automated verification suite passes.

### 4. Direct Authentication & Token Propagation
- Client-side uses `authFetch` to pass Supabase Bearer JWT tokens in `Authorization` header.
- Server-side validates tokens via `supabaseServer.auth.getUser(token)` and automatically provisions `User` and `Wallet` in PostgreSQL.
