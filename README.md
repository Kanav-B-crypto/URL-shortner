# LinkForge

A full-stack URL shortener built with the MERN stack. Shorten links anonymously, or
sign in to keep them in a personal dashboard and track how often each one is clicked.

## Features

- Shorten any URL into a short code
- Works without an account — anonymous links are created instantly
- Register / login with JWT authentication delivered via an httpOnly cookie
- Passwords hashed with bcrypt; never stored or returned in plaintext
- Personal dashboard listing the links you own
- Click counter incremented on every redirect
- Copy-to-clipboard on generated links

## Tech stack

**Frontend** — React 19, Vite, Redux Toolkit, TanStack Router, TanStack Query, Tailwind CSS, Axios

**Backend** — Node.js, Express 5, MongoDB, Mongoose, JSON Web Tokens, bcryptjs

## Project structure

```
LinkForge/
├── BACKEND/
│   ├── app.js                  # Express entry point, middleware, route mounting
│   └── src/
│       ├── config/             # DB connection, cookie options
│       ├── controller/         # Request/response handling
│       ├── dao/                # Database queries
│       ├── middleware/         # authMiddleware (required auth)
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Route definitions
│       ├── services/           # Business logic
│       └── utils/              # Helpers, validation, error classes, attachUser
└── FRONTEND/
    └── src/
        ├── api/                # Axios calls to the backend
        ├── components/         # Forms, navbar, URL list
        ├── pages/              # Home, Auth, Dashboard
        ├── routing/            # TanStack Router route tree
        ├── store/              # Redux store and auth slice
        └── utils/              # Axios instance, auth guards
```

## Getting started

### Prerequisites

Node.js 18+ and a MongoDB database (local or Atlas).

### 1. Clone

```bash
git clone <your-repo-url>
cd LinkForge
```

### 2. Backend

```bash
cd BACKEND
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `APP_URL` | yes | Base URL prefixed to short codes, e.g. `http://localhost:3000/` |
| `JWT_SECRET` | yes | Secret used to sign JWTs. Use a long random string. |
| `NODE_ENV` | no | Set to `production` to mark cookies `Secure` |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then start the API:

```bash
npm run dev     # nodemon, http://localhost:3000
```

### 3. Frontend

```bash
cd FRONTEND
npm install
npm run dev     # http://localhost:5173
```

Open http://localhost:5173.

> `.env` is git-ignored and must never be committed. Only `.env.example`, which holds
> placeholders, is tracked.

## API reference

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Create an account. Body: `name`, `email`, `password` (min 6). Returns `201`. Does not sign the user in. |
| POST | `/api/auth/login` | public | Body: `email`, `password`. Sets the `accessToken` cookie. |
| POST | `/api/auth/logout` | public | Clears the cookie. |
| GET | `/api/auth/me` | required | Returns the authenticated user. |
| POST | `/api/user/urls` | required | Lists the URLs owned by the caller. |
| POST | `/api/create` | optional | Shortens a URL. Attributed to the user when signed in. |
| GET | `/:code` | public | Redirects to the original URL and increments its click count. |

Status codes: `400` invalid input, `401` bad credentials or missing/invalid/expired
token, `409` duplicate email or short code.

## How authentication works

1. On register, the password is hashed with bcrypt (cost 10) in a Mongoose `pre("save")`
   hook, so plaintext is never written to the database.
2. On login, the submitted password is compared against the stored hash with
   `bcrypt.compare`. Invalid email and wrong password return the same generic message,
   so the API does not reveal which emails are registered.
3. A JWT containing only the user id is signed with `JWT_SECRET` and returned as an
   httpOnly cookie with a 1 hour expiry. Because the cookie is httpOnly, browser
   JavaScript cannot read it.
4. `attachUser` runs globally and sets `req.user` when a valid cookie is present, which
   is what allows anonymous shortening to keep working. `authMiddleware` is applied per
   route and rejects unauthenticated requests with `401`.

The `password` field is `select: false` and is additionally stripped by a `toJSON`
transform, so it is never included in an API response.

## Notes

CORS is configured for `http://localhost:5173` with credentials enabled. If you run the
frontend on a different port, update the `origin` in `BACKEND/app.js`.

## License

ISC
