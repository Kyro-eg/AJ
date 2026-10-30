# A-J Wears It — Vercel hosting

This repository contains the full React/Vite storefront, Express/tRPC API, Drizzle schema and seeded product catalog.

## Deploy

1. Upload the ZIP to GitHub or extract it into a repository.
2. Import the repository into Vercel.
3. Vercel will use `pnpm install --frozen-lockfile` and `pnpm build` from `vercel.json`.
4. Add the variables from `.env.example` in Vercel Project Settings → Environment Variables.
5. Set `DATABASE_URL` to a reachable MySQL database. The `products` migration is in `drizzle/0001_fuzzy_carlie_cooper.sql`; apply the migrations before using production CRUD.
6. Set a strong `ADMIN_PASSWORD` for production and optionally set a random `ADMIN_SESSION_SECRET`.
7. Redeploy and open `/` for the storefront or `/admin` for catalog management.

The public storefront requires no visitor login. Product cards append `utm_source=ajwearsit`, `utm_medium=affiliate`, and `utm_campaign=curated_fit` to outbound affiliate URLs.

## Local verification

```bash
pnpm install
pnpm check
pnpm build
pnpm dev
```

The default local admin password is `ajwears2026` only when `ADMIN_PASSWORD` is not set. Change it before production deployment.
