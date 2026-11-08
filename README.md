# SEENIT — Lost and Found

SEENIT is a community lost-and-found platform. This repository currently contains the Phase 1 project foundation: a React/Vite client and an Express API, configured to run together from the repository root.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)

## Install and run

From the repository root:

```bash
npm install
npm run dev
```

The development client is available at <http://localhost:5173> and the API at <http://localhost:5000>. The client uses Vite's `/api` proxy to reach the Express server.

To run either part by itself:

```bash
npm run dev:client
npm run dev:server
```

To create a production client build and start the API:

```bash
npm run build
npm start
```

Copy `server/.env.example` to `server/.env` to override the API port. No environment file is required for the default development setup.

## Health check

With the server running, open <http://localhost:5000/api/health>. The client also checks this endpoint and shows the connection status.

## Project structure

```text
.
├── client/       # React + Vite frontend
├── server/       # Express API
├── package.json  # npm workspaces and root scripts
└── README.md
```

This setup intentionally stays within Phase 1; product pages, database integration, and feature work are left for their respective phases.
