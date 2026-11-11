# SEENIT — Lost and Found

SEENIT is a community lost-and-found platform organized as React/Vite client and Express/MySQL API npm workspaces.

## Requirements and local setup

- Node.js 20+ and npm
- MySQL 8+ only for database-backed features
- Cloudinary credentials only for photo uploads

```bash
npm install
cp server/.env.example server/.env
# Set a unique JWT_SECRET in server/.env.
# To enable database features, uncomment and configure the DB_* settings there,
# then initialize MySQL using the command in server/database/README.md.
npm run dev
```

Frontend: <http://localhost:5173>. API health: <http://localhost:5000/api/health>.

The site and API can start without MySQL. Without database settings, the health endpoint reports `database: not_configured`; database-backed features return HTTP 503 with setup guidance. If you already have a `server/.env` with `DB_HOST` and `DB_NAME` set but no MySQL server is running, comment out or remove those settings to run without MySQL.

## Tests

```bash
npm test --workspace server
npm run build
```

Backend setup and report-upload details are in [server/database/README.md](server/database/README.md) and [server/database/reports.md](server/database/reports.md).
