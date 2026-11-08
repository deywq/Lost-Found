# SEENIT — Lost and Found

SEENIT is a community lost-and-found platform organized as React/Vite client and Express/MySQL API npm workspaces.

## Requirements and local setup

- Node.js 20+ and npm
- MySQL 8+ for database features
- Cloudinary credentials for photo uploads

```bash
npm install
cp server/.env.example server/.env
# Edit server/.env with database, JWT, and optional Cloudinary credentials.
mysql -u root -p < server/database/schema.sql
npm run dev
```

Frontend: <http://localhost:5173>. API health: <http://localhost:5000/api/health>.

## Tests

```bash
npm test --workspace server
npm run build
```

Backend setup and report-upload details are in [server/database/README.md](server/database/README.md) and [server/database/reports.md](server/database/reports.md).
