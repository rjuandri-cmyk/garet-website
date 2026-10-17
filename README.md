# GARET Website — Draft v1.0

Responsive GARET landing page plus a small Node.js admin backend for **manually tracking** airdrop recipients.

## What's included
- Responsive black/green landing page
- Whitepaper summary and risk disclosure
- Planned tokenomics for 1,000,000,000 GARET
- User-provided BNB Smart Chain contract address display
- Admin login and recipient tracking (add recipient, set status, record transaction hash)
- SQLite database for local/demo use
- No private keys are collected or stored

## Important limitations
- This is a starter package, not a deployed website.
- Tokenomics are the project's stated plan, not independently verified.
- The supplied contract address is displayed as provided; this package does not verify contract ownership, source code, token supply, or audit status.
- Marking a recipient as "Paid" records an admin statement and transaction hash. It does **not** send tokens or independently verify the transaction on-chain.
- Airdrop transfers must be made separately from the project's wallet by an authorized operator.
- SQLite data on ephemeral/free hosting may be lost on redeploy/restart. For production, configure persistent storage or replace SQLite with a managed database such as Supabase/Postgres.
- Use HTTPS in production. Set strong secrets and an admin password. Do not use the example values.

## Run locally
Requirements: Node.js 20+ and npm.

1. Extract this ZIP.
2. Copy `.env.example` to `.env`.
3. Set `ADMIN_PASSWORD` and `SESSION_SECRET` to strong, unique values.
4. Run:
   ```bash
   npm install
   npm start
   ```
5. Open `http://localhost:3000`.
6. Admin panel: `http://localhost:3000/admin`

## Deploying for free (example)
### Frontend
For the simplest deployment, deploy the whole app to a Node host such as Render. The public landing page is served from `public/`.

### Render
- Create a new Web Service from your Git repository.
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env.example`.
- Set `NODE_ENV=production` and `COOKIE_SECURE=true` when HTTPS is enabled.
- **Do not rely on ephemeral disk for the SQLite database.** Configure a persistent disk mounted at `/var/data`, then set `DB_PATH=/var/data/garet.sqlite`, or use a managed PostgreSQL/Supabase database in a production implementation.
- Free hosting plans and policies can change; check the host's current pricing and limits.

## Admin workflow
1. Log in at `/admin`.
2. Add a recipient's wallet address and planned amount.
3. Make the actual token transfer separately using the authorized wallet.
4. Enter the transaction hash and mark the record Paid only after the transfer is made.
5. Never enter a seed phrase or private key into this website.

## Planned tokenomics
- Total supply: 1,000,000,000 GARET
- Airdrop: 30% (300,000,000)
- Community rewards: 20% (200,000,000)
- Ecosystem: 20% (200,000,000)
- Team: 15% (150,000,000)
- Liquidity: 15% (150,000,000)

These are configured as the project's plan and must be updated if official tokenomics change.
