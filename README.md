# Doctor Tracker

> **Doctor Tracker** is a secure, full-stack administrative web portal that empowers healthcare administrators to manage doctors and their patients from a single dashboard. Built with Next.js, Express, and MongoDB, it combines real-time analytics, optimized database queries, and a clean modern UI to give administrators complete control over their medical staff and patient records — all behind a secure JWT-authenticated interface.

---

## Setup Guide

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the frontend
```bash
git clone https://github.com/Sadman-Sakib-12/doctor-tracker-frontend.git
cd doctor-tracker-frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start the backend first
```bash
git clone https://github.com/Sadman-Sakib-12/doctor-tracker-backend.git
cd doctor-tracker-backend
npm install
cp .env.example .env
# Fill in MONGODB_URI and JWT_SECRET in .env
npm run dev
```

### 4. Run the frontend
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Create your admin account
Register at `POST http://localhost:5000/api/auth/register` then log in at `/login`.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Next.js)                 │
│                                                      │
│  /login → Auth Store (Zustand) → JWT in localStorage│
│                                                      │
│  /dashboard → dashboardApi → GET /api/dashboard/stats│
│  /doctors   → doctorApi    → GET /api/doctors        │
│  /patients  → patientApi   → GET /api/patients       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (Axios + Bearer token)
┌──────────────────────▼──────────────────────────────┐
│              Express.js REST API (Node.js)           │
│                                                      │
│  Routes → Validators → Auth Middleware → Controllers │
│                                                      │
│  /api/auth      – register, login, logout, me        │
│  /api/doctors   – CRUD + nested patients             │
│  /api/patients  – CRUD + search/filter/paginate      │
│  /api/dashboard – aggregated analytics               │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│                   MongoDB Atlas                      │
│                                                      │
│  Collections: users, doctors, patients               │
│  Indexes: text index, compound indexes on createdAt  │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User logs in → Express validates credentials → returns JWT
2. Frontend stores JWT → attaches to every Axios request via interceptor
3. Protected API routes verify JWT → query MongoDB with indexed fields
4. Aggregation pipelines power the dashboard analytics
5. Paginated responses sent back → React state updated → UI re-renders

---

## Technical Decisions

### 1. Zustand over Redux / Context API for state management

Redux adds significant boilerplate (actions, reducers, selectors) for what is essentially a small admin app with one auth state. React Context causes unnecessary re-renders across the entire tree on any state change. **Zustand** gives us a minimal, hook-based store with built-in `persist` middleware that serializes the JWT to `localStorage` automatically — zero boilerplate, zero extra re-renders, and the store is accessible outside of React components (e.g., in the Axios interceptor).

### 2. Reusable `APIFeatures` class over duplicated Mongoose queries

Every list endpoint needs search, filter, sort, and pagination. Without abstraction this logic gets copy-pasted into every controller, making it hard to maintain. We built a single `APIFeatures` class that chains `.search()`, `.filter()`, `.sort()`, and `.paginate()` onto any Mongoose query object. Adding a new filter to any endpoint requires zero changes to the controller — only the route params change. This pattern also ensures consistent query behaviour and centralised performance optimisation (e.g., adding a new index benefits all endpoints automatically).

---

## Visual Evidence

### Desktop View
![Doctor Tracker Dashboard](https://ibb.co.com/rRrYBhHJ)

### Mobile View
![Doctor Tracker Mobile](https://ibb.co.com/rRrYBhHJ)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register admin |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/doctors` | List doctors (search/filter/paginate) |
| POST | `/api/doctors` | Create doctor |
| GET  | `/api/doctors/:id` | Get doctor |
| PUT  | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor + patients |
| GET  | `/api/doctors/:id/patients` | Doctor's patients |
| POST | `/api/doctors/:id/patients` | Add patient to doctor |
| GET  | `/api/patients` | List all patients |
| PUT  | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET  | `/api/dashboard/stats` | Aggregated analytics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State | Zustand (with persist) |
| Data fetching | Axios + TanStack Query ready |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
