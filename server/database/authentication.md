# SEENIT User Authentication

Authentication uses bcrypt-hashed passwords and an 8-hour signed JWT stored only in an HTTP-only cookie. The browser does not receive a password hash or a token it can read with JavaScript. New signups always receive the `user` role; never accept an administrator role from the public registration form.

## Configure

Run the Phase 3 MySQL schema, copy `server/.env.example` to `server/.env`, and set database details plus a unique `JWT_SECRET` of at least 32 characters. Generate a secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Install packages and run the app from the repository root:

```bash
npm install
npm run dev
```

The browser frontend and API should share the same origin in production. The development Vite proxy forwards `/api` requests to Express.

## Authentication API

- `POST /api/auth/register` with `{ "name", "email", "password" }` creates a regular account and sets the session cookie.
- `POST /api/auth/login` with `{ "email", "password" }` sets the session cookie.
- `GET /api/auth/me` returns the signed-in user's public profile; requires the cookie.
- `POST /api/auth/logout` clears the cookie.

Passwords must be 12–72 characters. Authentication attempts are rate limited. Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production. The API never returns password hashes or authentication tokens in JSON.

To promote a trusted account to administrator, do so manually after verifying the user; for example:

```sql
UPDATE users SET role = 'admin' WHERE email = 'verified-admin@example.com';
```

Do not expose database access publicly. Protecting API writes and admin APIs with the authentication middleware is required as those endpoints are added.

## Tests

Run the validation unit tests:

```bash
npm test --workspace server
```

For browser smoke testing, register with a new email and a password of at least 12 characters, verify redirect to `/dashboard`, then log out. Direct access to `/dashboard` requires a session. `/admin` additionally requires the admin role; regular accounts are redirected to the user dashboard.
