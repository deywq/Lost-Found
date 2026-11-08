# SEENIT backend and MySQL setup

The API uses MySQL 8+ and `mysql2`. The app can start without database credentials so the frontend and health endpoint remain available, but database-backed endpoints require a configured and initialized MySQL database.

## 1. Create the database and tables

Run the schema with a MySQL user that can create a database:

```bash
mysql -u root -p < server/database/schema.sql
```

This creates the `seenit` database, required tables, and starter categories. If your MySQL service uses another port or credentials, use those in the environment file below.

## 2. Configure the API

Copy `server/.env.example` to `server/.env`, then set the MySQL connection values:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=seenit_app
DB_PASSWORD=replace-with-your-local-password
DB_NAME=seenit
```

Use a database account with only the permissions needed by the app in production. Keep `.env` private and never commit real credentials.

## 3. Install and start

From the repository root:

```bash
npm install
npm run dev
```

API health: <http://localhost:5000/api/health>. Once configured, it reports `database: connected`; a configured but unreachable database returns HTTP 503. With no database environment configured, the API reports `database: not_configured`.

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

`contactMethod` can be included in the create body but is deliberately not returned by the public listing/detail endpoints. Authentication and authorization will be added in Phase 4; until then, this API is a development foundation and must not be exposed as a public production service.

## Manual smoke tests

1. Start MySQL and run the schema script.
2. Configure `server/.env` and run `npm run dev` from the repository root.
3. Check `GET /api/health` reports a connected database.
4. Check `GET /api/categories` returns starter categories.
5. Create an item with `POST /api/items`, then retrieve it via `GET /api/items` and `GET /api/items/:id`.
6. Try an invalid `type`, date, coordinate, or category and confirm the API returns HTTP 400.
7. Stop MySQL and confirm health reports 503 while the API process remains available.
