# SEENIT backend and MySQL setup

The API uses MySQL 8+ and `mysql2`. You can start the frontend, API, and health endpoint without MySQL; database-backed endpoints return HTTP 503 with a setup message until a database is configured and reachable. To use those features, follow the steps below.

## 1. Create the database and tables

Run the schema with a MySQL user that can create a database:

```bash
mysql -u root -p < server/database/schema.sql
```

This creates the `seenit` database, required tables, and starter categories. If your MySQL service uses another port or credentials, use those in the environment file below.

## 2. Configure the API

Copy `server/.env.example` to `server/.env`, then uncomment and set the MySQL connection values:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=seenit_app
DB_PASSWORD=replace-with-your-local-password
DB_NAME=seenit
```

Use a database account with only the permissions needed by the app in production. Keep `.env` private and never commit real credentials. If you only want to run the website without MySQL, leave the `DB_*` settings unset. If a previous setup already has those values in `server/.env`, remove or comment out at least `DB_HOST` and `DB_NAME`.

## 3. Install and start

From the repository root:

```bash
npm install
npm run dev
```

API health: <http://localhost:5000/api/health>. With no database environment configured, it reports `database: not_configured`; with a configured database it reports `database: connected`, or HTTP 503 if the configured database cannot be reached.

## API endpoints

- `GET /api/health` — API and database connection status.
- `GET /api/categories` — seeded categories.
- `GET /api/items` — item listings; optional query parameters: `type=lost|found`, `categoryId`, `search`, and `limit` (1–100).
- `GET /api/items/:id` — item details and image URLs.
- `POST /api/items` — create an item and optional location/image records.

Example create body (use a category ID returned by `/api/categories`):

```json
{
  "type": "lost",
  "name": "Black wallet",
  "description": "Small black leather wallet.",
  "categoryId": 7,
  "itemDate": "2026-11-08",
  "location": {
    "address": "Davao City",
    "latitude": 7.0731,
    "longitude": 125.6128
  },
  "images": [
    { "url": "https://example.com/wallet.jpg", "altText": "Black wallet" }
  ]
}
```

`contactMethod` can be included in the create body but is deliberately not returned by the public listing/detail endpoints. Authentication and authorization will be added in Phase 4; until then, the current security scope is documented in [reports.md](reports.md).

## Manual smoke tests

1. Start MySQL and run the schema script.
2. Configure `server/.env` and run `npm run dev` from the repository root.
3. Check `GET /api/health` reports a connected database.
4. Check `GET /api/categories` returns starter categories.
5. Create an item with `POST /api/items`, then retrieve it via `GET /api/items` and `GET /api/items/:id`.
6. Try an invalid `type`, date, coordinate, or category and confirm the API returns HTTP 400.
7. Stop MySQL and confirm health reports 503 while the API process remains available.
