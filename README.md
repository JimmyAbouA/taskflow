# TaskFlow

A mini project and task management platform, built as a full-stack web development
internship project at Compu-Vision.

The platform is built around three core entities — **Users**, **Projects**, and **Tasks** —
and is developed one layer of the stack per week.

## Repository layout

This is a monorepo. Each part of the stack lives in its own folder so the pieces can be
developed and run independently.

| Folder | Stack | Week |
| --- | --- | --- |
| `backend/` | Node.js + Express + MongoDB REST API | Week 1 |
| `admin/` | React SPA admin CMS | Week 2 |
| `frontend/` | Next.js public site | Week 3 |
| `docs/` | Schema diagrams, API notes, Postman collection | ongoing |

## Tech stack

- **Backend:** Node.js, Express, JWT authentication
- **Database:** MongoDB with Mongoose
- **Front end:** React SPA (admin CMS), Next.js (public site)
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
- **Week 2 — Admin CMS (React):** single-page admin panel consuming the Week 1 API —
  login screen, protected dashboard, and full CRUD for projects and tasks.
- **Week 3 — Public front end (Next.js):** responsive landing page, a dashboard listing
  projects and their tasks from the API, and dynamic project-detail pages.
- **Week 4 — Integration, deployment & final delivery:** all three layers connected,
  security review, deployed to a live URL, final demo and code walkthrough.
