# Liahona Ledger

Liahona Ledger is a SvelteKit MVP for managing **Deacon Bucks**, a pretend activity-points currency for a youth quorum.

> Deacon Bucks are pretend activity points. No real money. No cash value. Not a financial institution.

This app avoids official Church logos, official Church branding, email addresses, phone numbers, birth dates, photos, addresses, payment processors, and Node-only backend services. It runs on Cloudflare Pages/Workers with Cloudflare D1 and direct prepared SQL statements.

## Stack

- SvelteKit + TypeScript
- `@sveltejs/adapter-cloudflare`
- Cloudflare Pages / Workers runtime
- Cloudflare D1 via `event.platform.env.DB.prepare(...)`
- No Prisma and no paid services

## Local setup

```bash
npm install
npm run db:migrate:local
npm run dev
```

Open the app, visit `/setup`, and create the first adult leader/admin. The setup page is only available while the database has no users.

## Cloudflare setup

1. Create a D1 database:

   ```bash
   npx wrangler d1 create liahona-ledger
   ```

2. Replace the placeholder `database_id` in `wrangler.toml` with the generated ID.

3. Apply migrations:

   ```bash
   npm run db:migrate:remote
   ```

4. In Cloudflare Pages, use:

   - Build command: `npm run build`
   - Build output directory: `.svelte-kit/cloudflare`
   - D1 binding name: `DB`

## GitHub Actions deploy

This repo includes `.github/workflows/cloudflare-pages.yml` for Cloudflare Pages Direct Upload.

Required GitHub repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The API token needs Cloudflare Pages edit access and D1 edit access for migrations. The workflow runs `npm ci`, `npm run build`, applies D1 migrations, and deploys `.svelte-kit/cloudflare` to the `liahona-ledger` Pages project.

Before the first workflow run, create the Pages project and D1 database:

```bash
npx wrangler pages project create liahona-ledger --production-branch main
npx wrangler d1 create liahona-ledger
```

Then update `wrangler.toml` with the D1 `database_id`.

## Product glossary

- App: Liahona Ledger
- Currency: Deacon Bucks
- Payment system: QuorumPay
- Account: Quorum Wallet
- Deposit: Storehouse Deposit
- Payment: QuorumPay Transfer
- History: Small Plates Ledger
- Admin portal: Bishopric Vault
- Audit log: Brass Plates Audit
- Store: Mite Market
- Merchant account: Bishop's Storehouse
- Receipt: Record of Stewardship
- Admin adjustment: Clerk Correction
- Savings goal placeholder: Liahona Goal
