## NextEd – Full‑Stack E‑Learning Platform

Modern MERN application for managing courses, enrollments, and role‑based dashboards for students, teachers, and admins. This repo contains a Node/Express/MongoDB backend and a React frontend.

### Monorepo Layout

```
nextEd-master/
  backend/   # Node.js + Express + Mongoose API
  frontend/  # React app (Create React App)
```

### Tech Stack

- Backend: Node.js, Express, Mongoose, JWT (auth), bcrypt, CORS, Morgan
- Database: MongoDB (Atlas or local)
- Frontend: React, React Router, Axios
- Deployment: Vercel configs present for both apps

---

## Features

- Authentication with JWT (login, register)
- Role‑based authorization: student, teacher, admin
- User moderation: admins must approve teachers/students before login succeeds
- Course lifecycle: create (teacher), review/approve (admin), enroll (student)
- Enrollment tracking with paid/free flag derived from course price
- Teacher dashboard: create, edit (re‑approval required), delete own courses
- Student dashboard: browse approved courses, enroll/unenroll, view enrolled
- Admin panel: approve/reject users and courses, update users/courses, reset passwords
- Simple live‑class session flags (start/stop) on courses

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB connection string (Atlas or local)

### 1) Clone and install

```bash
git clone <this-repo-url>
cd nextEd-master

# Backend deps
cd backend
npm install

# Frontend deps
cd ../frontend
npm install
```

### 2) Environment variables

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWTPRIVATEKEY=change_this_secret

# Optional admin seeding (created at backend startup if missing)
ADMIN_EMAIL=admin@nexted.local
ADMIN_PASSWORD=Admin123!

# CORS
DOMAIN_LOCAL=http://localhost:3000
DOMAIN_REMOTE=https://your-frontend.example.com
```

Create a `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3) Run locally

In one terminal (backend):

```bash
cd backend
npm start
# Server on http://localhost:5000 (API base: /api)
```

In another terminal (frontend):

```bash
cd frontend
npm start
# App on http://localhost:3000
```

On first backend boot, a default admin is seeded using `ADMIN_EMAIL`/`ADMIN_PASSWORD` if not found.

---

## Backend Overview (Express API)

Entry: `backend/app.js`

- Middleware: logger (morgan), JSON/urlencoded parsers, cookies, CORS whitelist
- MongoDB connect via `process.env.MONGO_URI`
- Seeds default admin if missing
- Routers mounted under `/api`:
  - `/api/auth` – login
  - `/api/users` – register, profile, enrolled courses
  - `/api/courses` – catalog, teacher CRUD, enroll/unenroll, details, live flags
  - `/api/admin` – user/course moderation (admin‑only)

Auth middleware: `backend/middleware/auth.js`

- Reads `x-auth-token`, verifies JWT with `JWTPRIVATEKEY`, injects `req.user = { _id, role }`

Data models (Mongoose):

- `User` – name, email (unique), hashed password, role, moderation fields, `enrolledCourses[]`
- `Course` – teacher ref, curriculum fields, `enrolledStudents[]`, moderation fields, live flags
- `Enrollment` – `{ user, course, isPaid }` with unique compound index

Key routes

- Auth (`POST /api/auth`): email/password, enforces approval for non‑admins, returns `{ token, user }`
- Users (`/api/users`):
  - `POST /` register (students/teachers only; starts pending)
  - `GET /profile` / `PUT /profile`
  - `GET /enrolledCourses` – returns enrolled with `isPaid` merged from `Enrollment`
- Courses (`/api/courses`):
  - `GET /` – students see only approved; teachers/admins see all (without `videos` in list)
  - `GET /teacher` – teacher’s courses
  - `POST /` – create (teacher), sets `status=pending`
  - `PUT /:id` – update (teacher owner), resets to `pending`
  - `DELETE /:id` – delete (teacher owner)
  - `POST /:id/enroll` – student enroll/unenroll (`{ unenroll: true }` to unenroll); sets `isPaid` based on `price>0`
  - `GET /:id` – returns full if teacher/enrolled; otherwise redacts `videos`
  - `POST /:id/live/start|stop` – toggle live flags (teacher owner)
- Admin (`/api/admin`) – all require admin role:
  - Users: list pending, approve, reject(with reason), update, reset password
  - Courses: list pending, approve, reject(with reason), admin update

---

## Frontend Overview (React)

- Axios instance `src/service/API.js` with `baseURL=REACT_APP_API_URL`; adds `x-auth-token` from `localStorage`
- Auth service `src/service/AuthService.js` handles login/register and token storage
- `components/PrivateRoute.js` protects routes and optionally enforces a `role`
- Pages:
  - Login/Signup
  - Student Dashboard – browse approved, enroll/unenroll, see enrolled split by free/paid
  - Teacher Dashboard – list own courses, create/update/delete (edits trigger re‑approval)
  - Admin Dashboard – moderate users/courses (via `/api/admin/*` helpers in `API.js`)

Environment contract

- Frontend uses `REACT_APP_API_URL` pointing to backend `/api` base
- All authenticated requests include `x-auth-token` header from `localStorage`

---

## Common Workflows

- Register as Student/Teacher → user is `pending`
- Admin approves user → user can log in
- Teacher creates course → `pending`
- Admin approves course → visible to students in catalog
- Student enrolls → appears under enrolled; `isPaid` determined by `price>0`

---

## Scripts

Backend (`backend/`):

```bash
npm start        # start server
npm run dev      # if configured with nodemon
```

Frontend (`frontend/`):

```bash
npm start        # start CRA dev server
npm run build    # production build
```

---

## Deployment Notes

- Set all backend env vars securely (MONGO_URI, JWTPRIVATEKEY, ADMIN_* and CORS domains)
- Set frontend `REACT_APP_API_URL` to your live backend `/api` URL
- CORS whitelist (`backend/configs/cors.config.js`) must include your frontend origin

---

## Troubleshooting

- 401/400 from API: ensure `x-auth-token` is present and valid; check `JWTPRIVATEKEY`
- Login blocked with 403: user likely `pending` or `rejected`; have an admin approve
- CORS errors: verify frontend origin is whitelisted and `.env` domains set
- No admin user: confirm `ADMIN_EMAIL/ADMIN_PASSWORD` and that backend logs show seeding

---

## License

MIT (or add your preferred license).


