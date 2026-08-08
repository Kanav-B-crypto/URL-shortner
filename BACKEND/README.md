# URL Shortener — Backend

Express 5 + Mongoose API for the URL shortener.

## Setup

```bash
cd BACKEND
npm install
cp .env.example .env   # then fill in real values
npm run dev            # nodemon, http://localhost:3000
```

`npm start` runs it without nodemon.

### Environment variables

All are read from `BACKEND/.env`, which is git-ignored. See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `APP_URL` | yes | Base URL prefixed to generated short codes |
| `JWT_SECRET` | yes | Signing key for JWTs. The server throws on token sign/verify if unset. |
| `NODE_ENV` | no | Set to `production` to mark cookies `Secure` |

## Authentication

A JWT is issued **on login** and delivered as an **httpOnly cookie** named
`accessToken` (1 hour expiry). The token payload carries only the user id.
Registration creates the account only and does not sign the user in — they are
sent to the sign-in form afterwards.

Because the cookie is httpOnly, browser JS cannot read it — the frontend just needs
`withCredentials: true`, which `FRONTEND/src/utils/axiosInstance.js` already sets.
CORS in `app.js` is restricted to `http://localhost:5173` with credentials enabled.

Passwords are hashed with bcrypt (cost 10) in a `pre("save")` hook. The `password`
field is `select: false` and additionally stripped by a `toJSON` transform, so it is
never included in an API response.

### Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Create an account. Body: `name`, `email`, `password` (min 6). Returns `201` + user. Does **not** set a cookie. |
| POST | `/api/auth/login` | public | Body: `email`, `password`. Returns `200` + user, sets cookie. |
| POST | `/api/auth/logout` | public | Clears the cookie. |
| GET | `/api/auth/me` | **required** | Returns the current user. |
| POST | `/api/user/urls` | **required** | Lists the short URLs owned by the caller. |
| POST | `/api/create` | optional | Shortens a URL. Anonymous callers get an unowned link; authenticated callers have the link attributed to them. |
| GET | `/:id` | public | Redirects a short code to its target. |

Status codes: `400` invalid input, `401` bad credentials or missing/invalid/expired
token, `409` duplicate email.

### Two middlewares, on purpose

- `attachUser` (`src/utils/attachUser.js`) runs globally and is **optional** — it sets
  `req.user` when a valid cookie is present and otherwise calls `next()`. This is what
  keeps anonymous URL shortening working.
- `authMiddleware` (`src/middleware/auth.middleware.js`) is **mandatory** and applied
  per-route; it rejects with `401` when there is no valid token.

## Manual API verification

With the server running:

```bash
# register
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"secret123"}' -c cookie.txt

# login
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"secret123"}' -c cookie.txt

# protected route, with and without the cookie
curl -i -X POST http://localhost:3000/api/user/urls -b cookie.txt   # 200
curl -i -X POST http://localhost:3000/api/user/urls                 # 401
```
