# SEENIT — Lost and Found

SEENIT is a community lost-and-found platform. The project is organized as a React/Vite client and an Express API in npm workspaces.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)
- MySQL 8+ for database-backed API endpoints

## Install and run

From the repository root:

```bash
npm install
npm run dev
```

The development client is available at <http://localhost:5173> and the API at <http://localhost:5000>. The client uses Vite's `/api` proxy to reach Express.

The API can run without MySQL configuration for frontend development, but database-backed endpoints require a running MySQL server and initialized schema. Follow [the backend setup guide](server/database/README.md) to configure the database.

To run either part by itself:

```bash
npm run dev:client
npm run dev:server
```

Build the frontend and start the API with:

```bash
npm run build
npm start
```

## Project structure

```text
.
├── client/                 # React + Vite frontend
├── server/                 # Express API and MySQL schema
│   ├── database/           # Schema and setup guide
│   └── src/                # Routes, validation, and database pool
├── package.json            # npm workspaces and root scripts
└── README.md
```

## Test

```bash
npm test --workspace server
npm run build
```

The backend smoke-test steps and available routes are documented in [server/database/README.md](server/database/README.md).
