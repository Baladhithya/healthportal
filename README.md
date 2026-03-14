# 🏥 HealthPortal — Wellness & Preventive Care Portal

A full-stack Healthcare Wellness and Preventive Care Portal built with **React.js**, **Node.js/Express**, and **MongoDB Atlas**.

## Features

- 🔐 **Secure Authentication** — JWT-based login/registration with role-based access (patient/provider)
- 📊 **Patient Dashboard** — Wellness goal progress, preventive care reminders, health tip of the day
- 🎯 **Goal Tracker** — Log daily goals (steps, water, sleep) and track compliance
- 👤 **Profile Management** — View/edit health info (allergies, medications, blood type)
- 👨‍⚕️ **Provider Dashboard** — Monitor assigned patients' compliance status
- 📄 **Public Health Info** — General health tips, preventive care guide, privacy policy
- 🔒 **HIPAA-aligned Security** — Audit logging, consent management, encrypted data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), CSS Modules, React Router |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken), bcryptjs |
| DevOps | Docker, GitHub Actions, Render.com |

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone <repo-url>
cd healthportal

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/healthportal
JWT_SECRET=your-strong-secret-key
```

### 3. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 4. Docker Compose (Alternative)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register (patient/provider) |
| POST | `/api/auth/login` | No | Login, returns JWT tokens |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Current user info |
| GET/PUT | `/api/patient/profile` | Patient | View/edit profile |
| GET/POST | `/api/patient/goals` | Patient | List/create goals |
| GET | `/api/patient/goals/progress` | Patient | Weekly progress |
| GET/POST/PUT | `/api/patient/reminders` | Patient | Manage reminders |
| GET | `/api/patient/health-tip` | Yes | Health tip of day |
| GET | `/api/provider/patients` | Provider | Patient list + compliance |
| GET | `/api/provider/patients/:id` | Provider | Patient detail |
| GET | `/api/health` | No | Health check |

## Deployment (Render.com)

1. Push to GitHub
2. In Render dashboard, create a **Blueprint** from `render.yaml`
3. Set environment variables:
   - `MONGODB_URI` — Atlas connection string
   - `JWT_SECRET` — strong secret key
   - `CORS_ORIGIN` — frontend URL
   - `VITE_API_URL` — backend URL
4. Deploy!

## CI/CD

GitHub Actions pipeline runs on push/PR to `main`:
- Backend: `npm test`
- Frontend: `npm run build`
- Auto-deploy to Render on merge to `main`

## Security

- ✅ JWT authentication with 15-min access tokens
- ✅ bcrypt password hashing (cost 12)
- ✅ Role-based access control (patient/provider)
- ✅ Helmet.js secure HTTP headers
- ✅ CORS origin restriction
- ✅ Audit logging for all data access
- ✅ Consent checkbox on registration
- ✅ Input validation (express-validator)

## License

MIT
