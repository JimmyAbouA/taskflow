# TaskFlow Admin (Week 2)

React single-page admin CMS. It consumes the Week 1 API: login with JWT, then
create / read / update / delete projects and tasks.

## Run it

The backend must already be running on port 5000.

```bash
cd admin
npm install
npm run dev
```

Open http://localhost:5173

## What is here

| Route | Purpose |
| --- | --- |
| `/login` | Register or log in; stores the JWT in `localStorage` |
| `/` | Dashboard: current user + API health |
| `/projects` | Project CRUD |
| `/tasks` | Task CRUD, filtered by status and priority |

Protected routes redirect to `/login` when no token is present.

## Week 2 deliverable checklist

- [x] Login screen and protected dashboard
- [x] List / create / edit / delete projects and tasks via the API
- [x] JWT attached to every request
- [x] Form validation plus loading, empty, and error states
- [x] Code in `/admin`
