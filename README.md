# TaskFlow

A mini project and task management platform, built as a full-stack web development
internship project at Compu-Vision.

The platform is built around three core entities — **Users**, **Projects**, and **Tasks** —
and is developed one layer of the stack per week.

## Repository layout

This is a monorepo. Each part of the stack lives in its own folder so the pieces can be
developed and run independently.

| Folder | Stack | Status |
| --- | --- | --- |
| `backend/` | Node.js + Express + MongoDB | Week 1 |
| `web/` | Next.js public front end | Week 2 |
| `cms/` | React SPA admin CMS | Week 3 |
| `docs/` | Schema diagrams, API notes, Postman collection | ongoing |

## Tech stack

- **Backend:** Node.js, Express, JWT authentication
- **Database:** MongoDB with Mongoose
- **Front end:** Next.js (public site), React SPA (admin CMS)
- **Tools:** Git & GitHub, Postman, npm

## Getting started

Each folder has its own README with setup instructions. To run the backend:

```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
npm run dev
```

## Prerequisites

- Node.js 20+ (developed on 24.19.0)
- MongoDB Community Server running locally on port 27017

## Weekly progress

- **Week 1 — Foundations, Database & Backend API:** repo setup, data model for Users /
  Projects / Tasks, REST CRUD endpoints, JWT authentication, Postman collection.
- **Week 2 — Public front end (Next.js):** landing page and dashboard listing projects
  and their tasks.
- **Week 3 — Admin CMS (React):** protected area to manage users, projects, and tasks.
- **Week 4 — Integration & deployment:** everything wired together and deployed.
