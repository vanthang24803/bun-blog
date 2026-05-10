# API

A fast REST API built with **Bun**, **Drizzle ORM**, and **PostgreSQL**. Features JWT authentication with token rotation, avatar uploads via S3, request validation with Zod, and structured JSON logging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Database | PostgreSQL (Supabase) + [Drizzle ORM](https://orm.drizzle.team) |
| Auth | Custom JWT via [jose](https://github.com/panva/jose) |
| Validation | [Zod](https://zod.dev) |
| Storage | S3-compatible (Supabase Storage) |
| Logging | [Pino](https://getpino.io) |
| Linting | [Biome](https://biomejs.dev) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- PostgreSQL database (Supabase recommended)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
|---|---|
| `PORT` | Server port (default `8888`) |
| `HOSTNAME` | Bind address (default `0.0.0.0`) |
| `NODE_ENV` | `development` or `production` |
| `API_VERSION` | API version prefix (default `1`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase publishable key |
| `S3_ENDPOINT` | S3-compatible endpoint |
| `S3_ACCESS_KEY_ID` | S3 access key |
| `S3_SECRET_ACCESS_KEY` | S3 secret key |
| `S3_REGION` | S3 region |
| `S3_BUCKET` | S3 bucket name |
| `CORS_ALLOW_ORIGIN` | Allowed origins (default `*`) |

### Run

```bash
# development with hot reload
bun run dev

# compile to a standalone binary
bun run build
./server
```

---

## API Reference

Base URL: `http://localhost:8888/api/v1`

All API responses are wrapped in a standard envelope:

```json
{
  "err": false,
  "message": "OK",
  "data": { ... },
  "metadata": {
    "requestAt": "2026-01-01T00:00:00.000Z",
    "path": "/api/v1/auth/login"
  }
}
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create a new account |
| `POST` | `/auth/login` | No | Login and receive token pair |
| `POST` | `/auth/refresh` | No | Rotate refresh token |
| `POST` | `/auth/logout` | Yes | Revoke all refresh tokens |

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

Access tokens expire in **15 minutes**. Refresh tokens expire in **7 days**.

#### Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<jwt>"
}
```

Each call rotates the token pair — the old refresh token is immediately invalidated.

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

---

### Users

All user endpoints require `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/me/profile` | Get current user profile |
| `PUT` | `/me/profile/update` | Update profile fields |
| `POST` | `/me/avatar` | Upload avatar image |

#### Update Profile

```http
PUT /api/v1/me/profile/update
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "bio": "Hello world",
  "phone": "+1234567890"
}
```

At least one field must be provided.

#### Upload Avatar

```http
POST /api/v1/me/avatar
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

avatar: <file>
```

Accepted types: `jpeg`, `png`, `webp`, `gif` — max **5 MB**.

---

## Database

```bash
# generate migration files from schema changes
bun run db:generate

# apply migrations
bun run db:migrate

# open Drizzle Studio (visual DB browser)
bun run db:studio
```

---

## Testing

```bash
# run all tests
bun run test

# watch mode
bun run test:watch
```

---

## Linting & Formatting

```bash
# check and auto-fix everything
bun run check

# format only
bun run format

# lint only
bun run lint
```

---

## Docker

```bash
# build image
docker build -t api .

# run container
docker run -p 8888:8888 --env-file .env api
```

---

## CI

GitHub Actions runs two jobs on every push and pull request to `main`:

| Job | What it checks |
|---|---|
| **Lint & Format** | Biome reports zero issues |
| **Docker Build** | `Dockerfile` builds successfully |
