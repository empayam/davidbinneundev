# David Bin Neun Portfolio Migration

This repo migrates the original Base44 export into a self-hosted app:

- `Vite + React` frontend
- `Express` backend
- `SQLite` database with CSV import from the Base44 export
- Cookie-based auth for `/admin`
- Local file uploads for images/certificates
- Optional SMTP delivery for the contact form

The visual structure stays close to the original site, but the Base44 SDK/auth/database/file integrations are replaced with local services under `/api`.

## What changed

- Replaced the Base44 client with a compatibility layer backed by the local API.
- Added a real database under `data/app.db`.
- Added automatic import from the provided CSV exports.
- Added `/admin/login` so any registered user can access the admin area, per the assignment requirement.
- Added upload storage under `uploads/`.
- Added deployment docs for Google Cloud + Secret Manager.

## Local setup

```bash
npm install
npm run db:reset
npm run dev
```

The dev command starts:

- frontend on `http://localhost:5173`
- backend on `http://localhost:3001`

Vite proxies `/api` and `/uploads` to the backend automatically.

## Admin access

1. Open `/admin/login`
2. Create an account or log in
3. Edit the site from:
   - `/admin`
   - `/admin/projects`
   - `/admin/ctfs`
   - `/admin/education`
   - `/admin/contact`
   - `/admin/technologies`

Any registered user is treated as an admin for this assignment build.

## Data import

The server auto-imports the Base44 CSV export on first boot when the database is empty.

Manual commands:

```bash
npm run db:import
npm run db:reset
```

The repo includes the CSV export under [database](./database).

## Asset migration

The imported records initially keep the original Base44 image URLs. If you want to copy those files into this repo's own upload storage, run:

```bash
npm run assets:sync
```

That script downloads remote assets and rewrites the database to use local `/uploads/...` paths.

## Environment variables

See [.env.example](./.env.example).

Important values:

- `APP_SESSION_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `DATABASE_PATH`
- `UPLOADS_DIR`

If SMTP is not configured, contact messages are still stored in the database, but they are not delivered by email.

## Build

```bash
npm run build
npm start
```

## GCP deployment

Recommended for this repo: `Compute Engine VM + Secret Manager`

Why this path:

- the assignment asks for GCP + Secret Manager
- this repo persists both SQLite data and uploaded files on disk
- a small VM keeps that behavior intact without rewriting the storage layer

Deployment guide:

- [docs/gcp-deployment.md](/Users/payam/- Sample Project/davidbinneundev/docs/gcp-deployment.md)

The repo also includes:

- [infra/gce/deploy.sh](/Users/payam/- Sample Project/davidbinneundev/infra/gce/deploy.sh)
- [Dockerfile](/Users/payam/- Sample Project/davidbinneundev/Dockerfile)

## Verification

Verified locally in this workspace:

- `npm run db:reset`
- `npm run build`
- `npm run lint`

The sandbox here does not keep a listening local server process alive, so I could not do a full browser-through-the-stack runtime pass inside this environment.
