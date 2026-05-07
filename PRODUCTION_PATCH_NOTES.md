# Maitri Production Patch Notes

## Completed in this patch

1. Fixed two build-blocking TSX syntax/import issues
   - `src/components/booking/booking-engine.tsx`
   - `src/components/layout/sidebar.tsx`

2. Added PWA support
   - `public/manifest.webmanifest`
   - `public/icons/icon-192.svg`
   - `public/icons/icon-512.svg`
   - metadata manifest/apple web app links in `src/app/layout.tsx`

3. Added OpenGraph preview image
   - `src/app/opengraph-image.tsx`
   - metadata OG image wired in root layout

4. Added PDPA guest data export
   - `src/app/api/guest/privacy/export/route.ts`
   - export button in guest portal profile preferences
   - privacy request ledger migration

5. Hardened dashboard onboarding guard
   - dashboard now redirects authenticated staff users with no profile/org/hotel to `/onboarding`

6. Fixed reservation API production bug
   - removed undefined `ctx`/`hotel` references
   - imported booking email helpers
   - kept guest/hotel notification emails non-blocking

7. Added production DB migration
   - `supabase/migrations/00006_production_readiness_core.sql`
   - billing identifiers on organizations
   - dashboard/availability/inbox/ops indexes
   - privacy request ledger

8. Package hygiene
   - added missing runtime dependencies referenced by source: `clsx`, `axios`
   - added Node types in `tsconfig.json`

## Notes

Dependency installation could not be completed inside this sandbox, so run these locally/Vercel after applying:

```bash
npm install
npm run type-check
npm run build
```

Apply migration:

```bash
supabase db push
```

## Next production tasks

1. Subscription billing checkout + webhook
2. Delete/rectify PDPA request workflow
3. Sentry instrumentation
4. Staff role-permission guard per API route
5. F&B POS and Spa booking UI wired to real tables
