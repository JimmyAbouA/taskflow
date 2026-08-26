# TaskFlow — Backend API

Express + MongoDB REST API for the TaskFlow platform. This is the Week 1 deliverable of
the Compu-Vision full-stack internship.

## Setup

```bash
cd backend
npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run dev
```

The server listens on `http://localhost:5000` by default. MongoDB Community Server must be
running locally — check with `mongosh --eval "db.runCommand({ping:1})"`.

Confirm everything is wired up:

```bash
curl http://localhost:5000/api/health
```

## Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | Port Express listens on | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/taskflow` |
| `JWT_SECRET` | Secret used to sign tokens | a long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |

`.env` is git-ignored. `.env.example` is committed so the required shape is documented
without any secret being published.

## Project structure

```
src/
├── app.js              Express app: middleware, routes, error handling
├── server.js           Entry point: loads env, connects to Mongo, starts listening
├── constants.js        Shared enum values (statuses, priorities, roles)
├── config/
│   └── db.js           Mongoose connection and disconnection
├── models/             Mongoose schemas: User, Project, Task
├── controllers/        Request handling and business logic
├── routes/             URL definitions and per-route validation rules
├── middleware/
│   ├── auth.js         JWT verification (protect) and role checks (authorize)
│   ├── validate.js     Turns express-validator results into 400 responses
│   └── errorHandler.js Single place where every error becomes JSON
└── utils/
    ├── ApiError.js     Error class that carries an HTTP status code
    └── token.js        Signing and verifying JWTs
```

Routes declare *what* a URL accepts, controllers decide *what it does*, and models own
*what is valid*. Keeping those separate is why the controllers stay short.

## Response format

Success:

```json
{ "success": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }
```

Errors:

```json
{ "success": false, "error": { "message": "Validation failed", "details": [ { "field": "name", "message": "Name must be 2-120 characters" } ] } }
```

`meta` appears only on list endpoints. `details` appears only when a specific field failed.

## Endpoints

`Auth` = requires an `Authorization: Bearer <token>` header.

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Server and database status. 503 if Mongo is down. |

### Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create an account, returns user + JWT |
| POST | `/api/auth/login` | — | Exchange credentials for a JWT |
| GET | `/api/auth/me` | yes | The user the current token belongs to |

### Projects

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/projects` | yes | Projects you own or belong to. `?page`, `?limit`, `?status` |
| POST | `/api/projects` | yes | Create a project; you become the owner |
| GET | `/api/projects/:id` | yes | One project, with owner, members and tasks |
| PATCH | `/api/projects/:id` | yes | Update — owner only |
| DELETE | `/api/projects/:id` | yes | Delete project and its tasks — owner only |

### Tasks

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks` | yes | Tasks across your projects. `?project`, `?status`, `?priority`, `?assignee`, `?page`, `?limit` |
| POST | `/api/tasks` | yes | Create a task (project id in the body) |
| GET | `/api/projects/:projectId/tasks` | yes | Tasks in one project |
| POST | `/api/projects/:projectId/tasks` | yes | Create a task in that project |
| GET | `/api/tasks/:id` | yes | One task |
| PATCH | `/api/tasks/:id` | yes | Update a task |
| DELETE | `/api/tasks/:id` | yes | Delete a task |

## Status codes

| Code | When |
| --- | --- |
| 200 | Successful read, update or delete |
| 201 | Resource created |
| 400 | Validation failed, or a malformed id |
| 401 | Missing, malformed, invalid or expired token; bad credentials |
| 403 | Authenticated, but not allowed to touch this resource |
| 404 | Resource or route does not exist |
| 409 | Email already registered |
| 503 | Database unreachable |

## Security notes

- Passwords are hashed with bcrypt (10 salt rounds) in a Mongoose `pre('save')` hook, so
  a plain-text password is never stored even if a controller forgets to hash.
- The `password` field is `select: false`, so it is left out of query results unless
  explicitly requested. A hash cannot leak through a response by accident.
- `role` cannot be set through `/register`; every new account is a `member`. Otherwise
  anyone could make themselves an admin.
- Login answers identically for an unknown email and a wrong password, so the endpoint
  cannot be used to enumerate which emails have accounts.
- Update handlers whitelist the fields they accept, so a caller cannot reassign a
  project's `owner` by adding it to the request body.
- Tasks inherit their permissions from their project — there is one access check, in one
  place, rather than a separate rule per task route.

## Testing

A Postman collection covering every endpoint, including failure cases, lives at
[`../docs/TaskFlow.postman_collection.json`](../docs/TaskFlow.postman_collection.json).
Import it into Postman and run the folders in order — the requests pass their JWT and ids
to each other through collection variables, so nothing needs copying by hand.

To run it from the command line:

```bash
npx newman run ../docs/TaskFlow.postman_collection.json
```

## Data model

See [`../docs/data-model.md`](../docs/data-model.md) for the ER diagram, the field-level
schema for all three collections, and the reasoning behind referencing documents rather
than embedding them.
