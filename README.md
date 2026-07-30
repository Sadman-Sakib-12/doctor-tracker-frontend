# Doctor Tracker – Frontend

A modern admin portal built with **Next.js 14**, **TypeScript**, and **Tailwind CSS** for managing doctors and patients.

## Setup

```bash
git clone https://github.com/Sadman-Sakib-12/doctor-tracker-frontend.git
cd doctor-tracker-frontend
npm install
cp .env.example .env.local   # add your API URL
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |

## Features

- 🔐 JWT authentication with protected routes
- 📊 Dashboard with charts (Bar, Line, Doughnut)
- 👨‍⚕️ Doctor management (CRUD, search, filter, paginate)
- 🏥 Patient management (CRUD, search, filter by condition/gender/date)
- 📱 Responsive design
- ♻️ Reusable components (Button, Input, Modal, Badge, Pagination)
