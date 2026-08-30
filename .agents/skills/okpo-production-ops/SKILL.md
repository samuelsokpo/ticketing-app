---
name: okpo-production-ops
description: "Strict operational and deployment protocol for the OKPO platform. Enforces zero placeholders, automated verification, and failproof deployment."
category: devops
risk: safe
tags: [production, vercel, supabase, paystack, failproof]
---

# OKPO Production Operations & Deployment Protocol

This skill enforces strict, failproof standards for developing, configuring, and deploying the OKPO platform.

## Rule 1: Absolute Zero Placeholders
- Whenever outputting environment variable lists, configuration blocks, or documentation, use the exact active credentials from `.env` / `.env.local`.
- Never use placeholder templates (`[PASSWORD]`, `xxx`, etc.).

## Rule 2: Modern Vercel Configuration Protocol
To sync environment variables to Vercel in 2026:
1. Open **Vercel Dashboard** → Project **`ticketing-app`** → **Settings** → **Environment Variables**.
2. Click into the raw `.env` import text area / paste box.
3. Paste the complete `.env` block in a single step (Vercel parses all key-value pairs simultaneously).
4. Select all environments: **Production**, **Preview**, **Development**.
5. Save and trigger redeploy.

## Rule 3: Mandatory Pre-Ship Verification Gate
Before pushing any code to `main`:
1. Run integration test suite: `npx ts-node --compiler-options '{"module":"CommonJS"}' test-all-flows.ts`
2. Run production build: `npm run build`
3. Verify 0 errors, 0 warnings blocking deployment.
