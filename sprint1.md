# Healthcare Wellness Portal – Complete Documentation

This README consolidates all project notes, requirements, and design information into a single document.

---



## Section from file: 1 (10)

# Business Requirements & MVP Scope

## 1. Business Objective

Build a **Healthcare Wellness & Preventive Care Portal** that helps patients track health goals, stay compliant with preventive checkups, and enables healthcare providers to monitor patient progress — all while maintaining healthcare data privacy standards.

## 2. Problem Statement

Patients often miss preventive care milestones and struggle to maintain consistent wellness habits. Healthcare providers lack a simple digital tool to monitor patient compliance with preventive care schedules. This portal bridges that gap with a secure, user-friendly platform.

## 3. Target Users

| Role | Description |
|------|-------------|
| **Patient** | Individuals tracking wellness goals (steps, water, sleep) and preventive care reminders (blood tests, checkups) |
| **Healthcare Provider** | Doctors/nurses monitoring assigned patients' goal compliance and preventive checkup status |

## 4. MVP Scope — In Scope

| # | Feature | Priority |
|---|---------|----------|
| 1 | **Secure Authentication** – Registration & login with JWT, role-based access (patient vs provider) | 🔴 Critical |
| 2 | **Patient Dashboard** – Wellness goal progress, preventive care reminders, health tip of the day | 🔴 Critical |
| 3 | **Goal Tracker** – Log daily goals (steps, water intake, sleep hours) | 🔴 Critical |
| 4 | **Profile Management** – View/edit patient health info (allergies, medications) | 🟡 High |
| 5 | **Provider Dashboard** – View assigned patients, compliance status, click for detail | 🟡 High |
| 6 | **Public Health Info Page** – Static general health info + privacy policy | 🟢 Medium |
| 7 | **Privacy & Security** – Audit logging, consent checkbox, HIPAA basics | 🔴 Critical |

## 5. MVP Scope — Out of Scope (Future Iterations)

- Real-time chat between patient and provider
- Appointment scheduling / telehealth
- Integration with wearable devices (Fitbit, Apple Health)
- Advanced analytics / AI-based health recommendations
- Payment / insurance processing
- Mobile native apps (iOS/Android)
- Multi-language support

## 6. Success Criteria

| Criteria | Metric |
|----------|--------|
| Functional auth | Patients & providers can register, login, and access role-specific dashboards |
| Goal tracking | Patients can log ≥3 goal types and see progress on dashboard |
| Compliance visibility | Providers can see patient compliance status (Met / Missed) |
| Security | JWT auth, password hashing, audit logging, consent collection all functional |
| Deployment | Both services deployed and accessible via public URLs |
| CI/CD | Automated test + build pipeline runs on push to `main` |

## 7. Constraints

- **Time-bound MVP** – Focus on demonstrable core features over polish
- **HIPAA awareness** – Implement basic compliance measures (encryption, access controls, audit logs); full HIPAA certification is out of scope for MVP
- **Cloud free tier** – Render.com free tier and MongoDB Atlas free tier introduce cold-start latency


---


## Section from file: 2

# System Architecture Design

## 1. Architecture Overview

The portal follows a **three-tier architecture** with clear separation of concerns:

```mermaid
graph TB
    subgraph "Client Tier"
        FE["Next.js Frontend<br/>(Port 3000)"]
    end

    subgraph "Application Tier"
        BE["Django REST Backend<br/>(Port 8000)"]
        AUTH["JWT Auth Middleware"]
        AUDIT["Audit Logging"]
    end

    subgraph "Data Tier"
        DB[("MongoDB Atlas<br/>(Cloud NoSQL)")]
    end

    FE -->|"REST API (HTTPS)"| BE
    BE --> AUTH
    BE --> AUDIT
    BE -->|"mongoengine ODM"| DB

    style FE fill:#0070f3,color:#fff
    style BE fill:#092e20,color:#fff
    style DB fill:#4db33d,color:#fff
```

## 2. Layer Responsibilities

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| **Client** | Next.js 14 (App Router) | UI rendering, routing, client-side auth state, form validation |
| **Application** | Django + DRF | Business logic, JWT auth, RBAC, audit logging, API endpoints |
| **Data** | MongoDB Atlas | Persistent storage for users, profiles, goals, reminders, audit logs |

## 3. Data Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant FE as Next.js Frontend
    participant BE as Django Backend
    participant DB as MongoDB Atlas

    U->>FE: Interacts with UI
    FE->>BE: REST API call + JWT Bearer token
    BE->>BE: Validate JWT & check role
    BE->>BE: Log action (audit)
    BE->>DB: MongoEngine query
    DB-->>BE: Document response
    BE-->>FE: JSON response
    FE-->>U: Render updated UI
```

## 4. Deployment Architecture

```mermaid
graph LR
    subgraph "Render.com"
        WS1["Web Service: Frontend<br/>Node.js Runtime"]
        WS2["Web Service: Backend<br/>Python Runtime"]
    end

    subgraph "MongoDB Atlas"
        CLUSTER["M0 Free Cluster<br/>healthportal DB"]
    end

    subgraph "GitHub"
        REPO["Repository"]
        CI["GitHub Actions CI/CD"]
    end

    REPO -->|push to main| CI
    CI -->|deploy hook| WS1
    CI -->|deploy hook| WS2
    WS2 -->|MONGODB_URI| CLUSTER
    WS1 -->|NEXT_PUBLIC_API_URL| WS2
```

## 5. Local Development Architecture

For local development, `docker-compose` orchestrates all services:

```
docker-compose.yml
├── frontend   (Next.js, port 3000)
├── backend    (Django, port 8000)
└── mongodb    (Local MongoDB, port 27017)  ← optional, can use Atlas directly
```

## 6. Security Architecture

| Layer | Measure |
|-------|---------|
| **Transport** | HTTPS enforced on Render (TLS auto-provisioned) |
| **Authentication** | JWT access tokens (15 min expiry) + refresh tokens (7 day) |
| **Authorization** | Role-based middleware — `patient` and `provider` roles |
| **Passwords** | bcrypt hashing with salt |
| **CORS** | Whitelist frontend origin only |
| **Audit** | All data-access actions logged with user ID, action, timestamp, IP |
| **Consent** | Registration requires explicit data-usage consent checkbox |
| **Env Vars** | All secrets in environment variables, never in code |

## 7. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| MongoEngine over Djongo | More stable, actively maintained, better MongoDB feature support |
| Next.js App Router | Modern file-based routing, server components, built-in middleware |
| CSS Modules over Tailwind | Per project requirements; scoped styles, no build-time utility classes |
| JWT over sessions | Stateless auth suitable for separate frontend/backend deploys |
| MongoDB Atlas over self-hosted | Managed service, free tier available, automatic backups, no ops overhead |


---


## Section from file: 3

# Technology Stack Specification

## Stack Overview

```mermaid
graph LR
    subgraph Frontend
        NJ["Next.js 14"]
        CSS["CSS Modules"]
        RC["React 18"]
    end
    subgraph Backend
        DJ["Django 4.2"]
        DRF["Django REST Framework"]
        ME["MongoEngine"]
    end
    subgraph Database
        MA["MongoDB Atlas (M0)"]
    end
    subgraph DevOps
        DC["Docker + Compose"]
        GH["GitHub Actions"]
        RN["Render.com"]
    end

    NJ --> DRF
    DRF --> ME --> MA
```

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.x | React framework with App Router, SSR, file-based routing |
| **React** | 18.x | UI component library |
| **CSS Modules** | (built-in) | Scoped component styling, no external CSS framework |
| **js-cookie** | 3.x | Client-side JWT token storage |

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11 | Runtime |
| **Django** | 4.2 LTS | Web framework |
| **Django REST Framework** | 3.14.x | RESTful API views, serializers, permissions |
| **MongoEngine** | 0.28.x | MongoDB ODM (Object-Document Mapper) |
| **PyJWT** | 2.x | JWT token encode/decode |
| **bcrypt** | 4.x | Password hashing |
| **django-cors-headers** | 4.x | Cross-origin resource sharing |
| **gunicorn** | 21.x | Production WSGI server |
| **python-dotenv** | 1.x | Environment variable loading |

## Database

| Technology | Tier | Purpose |
|-----------|------|---------|
| **MongoDB Atlas** | M0 (Free) | Cloud-hosted NoSQL database |
| **MongoDB** | 7.x (local) | Local development via Docker (optional) |

## DevOps & Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization of frontend & backend |
| **Docker Compose** | Multi-service orchestration for local dev |
| **GitHub Actions** | CI/CD — automated tests, lint, build, deploy |
| **Render.com** | Cloud hosting (2 web services) |

## Security Libraries

| Technology | Purpose |
|-----------|---------|
| **PyJWT** | JWT creation & validation |
| **bcrypt** | Password hashing (cost factor 12) |
| **CORS headers** | Restrict cross-origin API access |
| **Next.js Middleware** | Client-side route protection |

## Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **npm** | Frontend package management |
| **pip** | Backend package management |
| **Docker Desktop** | Local container runtime |


---


## Section from file: 4

# Authentication & Role-Based Access Control Plan

## 1. Auth Flow Overview

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js
    participant BE as Django API
    participant DB as MongoDB

    Note over U,DB: Registration Flow
    U->>FE: Fill registration form + consent ✓
    FE->>BE: POST /api/auth/register
    BE->>BE: Validate input, hash password (bcrypt)
    BE->>DB: Save User document
    DB-->>BE: Confirm
    BE-->>FE: 201 Created

    Note over U,DB: Login Flow
    U->>FE: Enter email + password
    FE->>BE: POST /api/auth/login
    BE->>DB: Find user by email
    BE->>BE: Verify password hash
    BE->>BE: Generate JWT access + refresh tokens
    BE-->>FE: { access_token, refresh_token, role }
    FE->>FE: Store tokens in httpOnly cookie / localStorage

    Note over U,DB: Authenticated Request
    FE->>BE: GET /api/patient/goals (Authorization: Bearer <token>)
    BE->>BE: Validate JWT, check role
    BE->>DB: Query data
    DB-->>BE: Results
    BE-->>FE: JSON response

    Note over U,DB: Token Refresh
    FE->>BE: POST /api/auth/refresh { refresh_token }
    BE->>BE: Validate refresh token
    BE-->>FE: { new access_token }
```

## 2. JWT Token Design

| Property | Access Token | Refresh Token |
|----------|-------------|---------------|
| **Expiry** | 15 minutes | 7 days |
| **Payload** | `user_id`, `email`, `role`, `exp`, `iat` | `user_id`, `exp`, `iat` |
| **Storage** | localStorage / cookie | localStorage / cookie |
| **Algorithm** | HS256 | HS256 |
| **Secret** | `JWT_SECRET` env var | `JWT_SECRET` env var |

## 3. Roles & Permissions

### Role Definitions

| Role | Description |
|------|-------------|
| `patient` | End user tracking wellness and preventive care |
| `provider` | Healthcare professional monitoring patients |

### Permission Matrix

| Endpoint | Patient | Provider | Unauthenticated |
|----------|---------|----------|-----------------|
| `POST /api/auth/register` | — | — | ✅ |
| `POST /api/auth/login` | — | — | ✅ |
| `GET /api/auth/me` | ✅ | ✅ | ❌ |
| `GET/PUT /api/patient/profile` | ✅ (own) | ❌ | ❌ |
| `GET/POST /api/patient/goals` | ✅ (own) | ❌ | ❌ |
| `GET /api/patient/reminders` | ✅ (own) | ❌ | ❌ |
| `GET /api/patient/health-tip` | ✅ | ✅ | ❌ |
| `GET /api/provider/patients` | ❌ | ✅ | ❌ |
| `GET /api/provider/patients/:id` | ❌ | ✅ | ❌ |
| `GET /health-info` (frontend) | ✅ | ✅ | ✅ |

## 4. Password Security

- **Algorithm**: bcrypt with cost factor 12
- **Validation rules**:
  - Minimum 8 characters
  - Must contain uppercase, lowercase, and a number
- Plaintext passwords are **never** stored or logged

## 5. Registration Requirements

- Email (unique, validated format)
- Password (meets strength rules)
- First name, last name
- Role selection (patient / provider)
- **Consent checkbox** (required) — "I consent to the collection and processing of my health data in accordance with the privacy policy"

## 6. Frontend Route Protection

Next.js middleware checks for valid JWT before allowing access:

| Route Pattern | Access |
|--------------|--------|
| `/login`, `/register`, `/health-info` | Public |
| `/dashboard`, `/goals`, `/profile` | Patient only |
| `/provider/*` | Provider only |

Unauthorized users → redirected to `/login`.
Wrong role → redirected to their own dashboard.


---


## Section from file: 5 (1)

# API Endpoints & Data Models

## 1. Data Models (MongoEngine Documents)

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| PATIENT_PROFILE : has
    USER ||--o{ WELLNESS_GOAL : tracks
    USER ||--o{ REMINDER : receives
    USER ||--o{ AUDIT_LOG : generates
    USER {
        ObjectId id PK
        string email UK
        string password_hash
        string role
        string first_name
        string last_name
        date date_of_birth
        boolean consent_given
        list assigned_provider_ids
        datetime created_at
    }
    PATIENT_PROFILE {
        ObjectId id PK
        ObjectId user_id FK
        list allergies
        list medications
        string blood_type
        string emergency_contact_name
        string emergency_contact_phone
        datetime updated_at
    }
    WELLNESS_GOAL {
        ObjectId id PK
        ObjectId user_id FK
        string goal_type
        float target
        float value
        date date
        boolean met
        datetime created_at
    }
    REMINDER {
        ObjectId id PK
        ObjectId user_id FK
        string title
        string description
        date due_date
        boolean completed
        datetime created_at
    }
    AUDIT_LOG {
        ObjectId id PK
        ObjectId user_id FK
        string action
        string resource
        string ip_address
        datetime timestamp
    }
```

### Document Schemas

#### User
```python
class User(Document):
    email          = EmailField(required=True, unique=True)
    password_hash  = StringField(required=True)
    role           = StringField(choices=["patient", "provider"], required=True)
    first_name     = StringField(required=True, max_length=50)
    last_name      = StringField(required=True, max_length=50)
    date_of_birth  = DateField()
    consent_given  = BooleanField(default=False)
    assigned_provider_ids = ListField(ObjectIdField())  # for patients
    created_at     = DateTimeField(default=datetime.utcnow)
```

#### PatientProfile
```python
class PatientProfile(Document):
    user_id                = ObjectIdField(required=True, unique=True)
    allergies              = ListField(StringField(), default=[])
    medications            = ListField(StringField(), default=[])
    blood_type             = StringField(max_length=5)
    emergency_contact_name = StringField(max_length=100)
    emergency_contact_phone = StringField(max_length=20)
    updated_at             = DateTimeField(default=datetime.utcnow)
```

#### WellnessGoal
```python
class WellnessGoal(Document):
    user_id    = ObjectIdField(required=True)
    goal_type  = StringField(choices=["steps", "water", "sleep"], required=True)
    target     = FloatField(required=True)    # e.g., 10000 steps, 8 glasses, 8 hours
    value      = FloatField(default=0)        # actual logged value
    date       = DateField(required=True)
    met        = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
```

#### Reminder
```python
class Reminder(Document):
    user_id     = ObjectIdField(required=True)
    title       = StringField(required=True, max_length=200)
    description = StringField(max_length=500)
    due_date    = DateField(required=True)
    completed   = BooleanField(default=False)
    created_at  = DateTimeField(default=datetime.utcnow)
```

#### AuditLog
```python
class AuditLog(Document):
    user_id    = ObjectIdField(required=True)
    action     = StringField(required=True)  # e.g., "VIEW_PROFILE", "UPDATE_GOAL"
    resource   = StringField(required=True)  # e.g., "patient_profile", "wellness_goal"
    ip_address = StringField()
    timestamp  = DateTimeField(default=datetime.utcnow)
    meta       = {'indexes': ['-timestamp', 'user_id']}
```

---

## 2. API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|-------------|----------|
| POST | `/register` | Register new user | No | `{email, password, first_name, last_name, role, consent_given, date_of_birth?}` | `201 {id, email, role}` |
| POST | `/login` | Login | No | `{email, password}` | `200 {access_token, refresh_token, role}` |
| POST | `/refresh` | Refresh token | No | `{refresh_token}` | `200 {access_token}` |
| GET | `/me` | Current user | Yes | — | `200 {id, email, role, first_name, last_name}` |

### Patient (`/api/patient/`)

| Method | Endpoint | Description | Auth | Role | Request / Response |
|--------|----------|-------------|------|------|-------------------|
| GET | `/profile` | Get own profile | Yes | patient | `200 {allergies, medications, blood_type, ...}` |
| PUT | `/profile` | Update profile | Yes | patient | Body: `{allergies?, medications?, ...}` → `200 {updated profile}` |
| GET | `/goals` | List goals (optional `?date=YYYY-MM-DD`) | Yes | patient | `200 [{goal_type, target, value, met, date}]` |
| POST | `/goals` | Create / log a goal | Yes | patient | Body: `{goal_type, target, value, date}` → `201 {goal}` |
| GET | `/goals/progress` | Weekly progress summary | Yes | patient | `200 {steps: {met: 5, total: 7}, water: {...}, sleep: {...}}` |
| GET | `/reminders` | List reminders | Yes | patient | `200 [{title, description, due_date, completed}]` |
| POST | `/reminders` | Create reminder | Yes | patient | Body: `{title, description, due_date}` → `201 {reminder}` |
| PUT | `/reminders/:id` | Update reminder | Yes | patient | Body: `{completed?}` → `200 {reminder}` |
| GET | `/health-tip` | Health tip of the day | Yes | any | `200 {tip: "...", category: "..."}` |

### Provider (`/api/provider/`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/patients` | List assigned patients + compliance | Yes | provider |
| GET | `/patients/:id` | Patient detail (goals, reminders) | Yes | provider |

**`/patients` response format:**
```json
[
  {
    "id": "...",
    "name": "Jane Doe",
    "compliance": {
      "goals_met_this_week": 5,
      "goals_total_this_week": 7,
      "status": "On Track",
      "missed_checkups": 0
    }
  }
]
```

---

## 3. Indexing Strategy

| Collection | Indexes |
|-----------|---------|
| `user` | `email` (unique), `role` |
| `patient_profile` | `user_id` (unique) |
| `wellness_goal` | `user_id` + `date` (compound), `goal_type` |
| `reminder` | `user_id`, `due_date` |
| `audit_log` | `user_id`, `timestamp` (descending) |


---


## Section from file: 6

# Healthcare Privacy & Security Considerations

## 1. HIPAA Compliance Overview

> [!IMPORTANT]
> This MVP implements **basic HIPAA-aligned measures**. Full HIPAA certification requires a BAA (Business Associate Agreement) with cloud providers, a formal risk assessment, and organizational policies — all outside MVP scope.

### HIPAA Safeguards Addressed

| Safeguard | Requirement | MVP Implementation |
|-----------|-------------|-------------------|
| **Administrative** | Access controls, workforce training | Role-based access (patient vs provider) |
| **Physical** | Facility access, workstation controls | Cloud-hosted (Render + Atlas manage physical security) |
| **Technical** | Encryption, audit controls, integrity | See details below |

## 2. Data Encryption

| Layer | Mechanism |
|-------|-----------|
| **In transit** | TLS/HTTPS enforced by Render (auto-provisioned SSL certs) |
| **At rest** | MongoDB Atlas encryption at rest (AES-256, enabled by default on Atlas) |
| **Passwords** | bcrypt hash with cost factor 12 — plaintext never stored |
| **JWT secrets** | Stored in environment variables, never committed to code |

## 3. Access Controls

```mermaid
graph TD
    REQ["Incoming Request"] --> MW["JWT Middleware"]
    MW -->|Invalid/Missing| R401["401 Unauthorized"]
    MW -->|Valid Token| ROLE["Role Check"]
    ROLE -->|Patient accessing /provider| R403["403 Forbidden"]
    ROLE -->|Provider accessing /patient| R403
    ROLE -->|Correct role| HANDLER["API Handler"]
    HANDLER --> AUDIT["Audit Logger"]
    HANDLER --> RESPONSE["200 Response"]
```

### Principle of Least Privilege

- Patients can only access **their own** profile, goals, and reminders
- Providers can only view patients **assigned to them**
- No admin role in MVP (manual database management)
- API returns only the minimum data required

## 4. Audit Logging

Every data-access action is logged with:

| Field | Example |
|-------|---------|
| `user_id` | `ObjectId("64a...")` |
| `action` | `VIEW_PROFILE`, `UPDATE_GOAL`, `LOGIN`, `REGISTER` |
| `resource` | `patient_profile`, `wellness_goal` |
| `ip_address` | `203.0.113.42` |
| `timestamp` | `2026-03-14T06:30:00Z` |

### Actions Logged

| Category | Actions |
|----------|---------|
| **Auth** | `LOGIN`, `REGISTER`, `TOKEN_REFRESH`, `LOGIN_FAILED` |
| **Patient** | `VIEW_PROFILE`, `UPDATE_PROFILE`, `CREATE_GOAL`, `VIEW_GOALS`, `VIEW_REMINDERS` |
| **Provider** | `VIEW_PATIENT_LIST`, `VIEW_PATIENT_DETAIL` |

## 5. Consent Management

- Registration **requires** checking a consent checkbox
- Consent text: *"I consent to the collection and processing of my health data as described in our Privacy Policy"*
- `consent_given` boolean stored on User document with timestamp
- Backend rejects registration if `consent_given` is `false`

## 6. Data Minimization

- Only essential health data collected (allergies, medications, blood type)
- No SSN, insurance ID, or payment data stored
- API responses exclude sensitive fields (password hash never returned)

## 7. Security Checklist for MVP

| # | Item | Status |
|---|------|--------|
| 1 | Passwords hashed with bcrypt | ☐ |
| 2 | JWT tokens with short expiry (15 min access) | ☐ |
| 3 | HTTPS enforced on all endpoints | ☐ |
| 4 | CORS restricted to frontend origin | ☐ |
| 5 | Role-based access control on all protected routes | ☐ |
| 6 | Audit log for all data access events | ☐ |
| 7 | Consent checkbox on registration | ☐ |
| 8 | Environment variables for all secrets | ☐ |
| 9 | No secrets in version control | ☐ |
| 10 | MongoDB Atlas encryption at rest enabled | ☐ |
| 11 | Input validation on all API endpoints | ☐ |
| 12 | Error messages don't leak internal details | ☐ |


---


## Section from file: 7

# GitHub Repository & CI/CD Pipeline Plan

## 1. Repository Structure

```
healthportal/                          (monorepo)
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI/CD pipeline
├── backend/                           # Django API
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...
├── frontend/                          # Next.js app
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── docker-compose.yml
├── render.yaml                        # Render blueprint
├── .env.example
├── .gitignore
└── README.md
```

## 2. Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code, triggers CI/CD |
| `develop` | Integration branch for features |
| `feature/*` | Individual feature branches |

## 3. CI/CD Pipeline (GitHub Actions)

```mermaid
graph LR
    PUSH["Push / PR to main"] --> LINT["Lint"]
    LINT --> TEST_BE["Backend Tests<br/>(Django)"]
    LINT --> TEST_FE["Frontend Build<br/>(Next.js)"]
    TEST_BE --> DEPLOY{"All pass?"}
    TEST_FE --> DEPLOY
    DEPLOY -->|Yes + main branch| RENDER["Deploy to Render"]
    DEPLOY -->|No| FAIL["❌ Fail"]
```

### Workflow: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: |
          cd backend
          pip install -r requirements.txt
          python manage.py test
    env:
      MONGODB_URI: ${{ secrets.MONGODB_URI }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      DJANGO_SECRET_KEY: ${{ secrets.DJANGO_SECRET_KEY }}

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          cd frontend
          npm ci
          npm run lint
          npm run build
    env:
      NEXT_PUBLIC_API_URL: http://localhost:8000

  deploy:
    needs: [backend-test, frontend-build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Backend to Render
        run: curl -X POST "${{ secrets.RENDER_BACKEND_DEPLOY_HOOK }}"
      - name: Deploy Frontend to Render
        run: curl -X POST "${{ secrets.RENDER_FRONTEND_DEPLOY_HOOK }}"
```

## 4. Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `DJANGO_SECRET_KEY` | Django secret key |
| `RENDER_BACKEND_DEPLOY_HOOK` | Render deploy hook URL for backend service |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Render deploy hook URL for frontend service |

## 5. Render.com Deployment Config

### `render.yaml` Blueprint

```yaml
services:
  - type: web
    name: healthportal-backend
    runtime: python
    buildCommand: cd backend && pip install -r requirements.txt
    startCommand: cd backend && gunicorn healthportal.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: DJANGO_SECRET_KEY
        sync: false

  - type: web
    name: healthportal-frontend
    runtime: node
    buildCommand: cd frontend && npm ci && npm run build
    startCommand: cd frontend && npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        sync: false
```

## 6. Environment Variables

### `.env.example`

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/healthportal

# Django
DJANGO_SECRET_KEY=your-django-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,.onrender.com

# JWT
JWT_SECRET=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```


---


## Section from file: 8

# Wireframes & Mockups — Key Screens

## Screen Map

| Screen | Access | URL |
|--------|--------|-----|
| Login | Public | `/login` |
| Register | Public | `/register` |
| Patient Dashboard | Patient | `/dashboard` |
| Provider Dashboard | Provider | `/provider` |
| Health Info | Public | `/health-info` |
| Goal Tracker | Patient | `/goals` |
| Profile | Patient | `/profile` |

---

## 1. Login Page

![Login page wireframe – centered card with email/password fields, role toggle, and login button](C:\Users\Neo\.gemini\antigravity\brain\f232c0eb-94d6-459f-a18d-eb1c2276610f\wireframe_login_1773470282988.png)

**Key Elements:**
- Role tab toggle (Patient / Provider) at top of form
- Email & password fields
- "Login" primary action button
- Link to registration page
- Branding / logo at top

---

## 2. Registration Page

![Registration page wireframe – form with name, email, password, role, date of birth, consent checkbox, and register button](C:\Users\Neo\.gemini\antigravity\brain\f232c0eb-94d6-459f-a18d-eb1c2276610f\wireframe_register_1773470299500.png)

**Key Elements:**
- First Name, Last Name, Email, Password, Date of Birth fields
- Role dropdown (Patient / Provider)
- **Consent checkbox** (required): *"I consent to the collection and processing of my health data…"*
- "Register" primary action button
- Link to login page

---

## 3. Patient Dashboard

![Patient dashboard wireframe – sidebar nav with wellness goal progress cards, reminders section, and health tip card](C:\Users\Neo\.gemini\antigravity\brain\f232c0eb-94d6-459f-a18d-eb1c2276610f\wireframe_patient_dashboard_1773470313764.png)

**Key Elements:**
- **Sidebar**: Dashboard, Goals, Profile, Logout
- **Wellness Goals** section: 3 progress cards (Steps, Water, Sleep) with visual progress bars
- **Preventive Care Reminders** section: List of upcoming checkups with dates
- **Health Tip of the Day**: Motivational card with daily health tip

---

## 4. Provider Dashboard

![Provider dashboard wireframe – patient compliance table with status badges and expandable patient detail view](C:\Users\Neo\.gemini\antigravity\brain\f232c0eb-94d6-459f-a18d-eb1c2276610f\wireframe_provider_dashboard_1773470330509.png)

**Key Elements:**
- **Sidebar**: Dashboard, Patients, Logout
- **Patient Table** with columns: Patient Name, Goals Met, Compliance Status, Last Activity
- **Compliance badges**: "On Track" (green) / "Needs Attention" (orange) / "Missed Checkup" (red)
- **Clickable rows** → expands to show patient's individual goals and compliance detail

---

## 5. Public Health Information Page

![Health info page wireframe – header with nav, general health tips, preventive care guide table, and privacy policy section](C:\Users\Neo\.gemini\antigravity\brain\f232c0eb-94d6-459f-a18d-eb1c2276610f\wireframe_health_info_1773470344862.png)

**Key Elements:**
- **Public nav header**: Logo, Health Info, Login links
- **General Health Tips** section with curated bullet points
- **Preventive Care Guide** table (recommended checkups by age/frequency)
- **Privacy Policy** section explaining data handling and HIPAA compliance
- No authentication required

---

## Navigation Flow

```mermaid
graph TD
    LP["Login Page"] --> PD["Patient Dashboard"]
    LP --> PV["Provider Dashboard"]
    RP["Register Page"] --> LP
    PD --> GT["Goal Tracker"]
    PD --> PM["Profile Management"]
    PV --> PDET["Patient Detail View"]
    HI["Health Info Page"] -.->|public| LP

    style LP fill:#f39c12,color:#fff
    style RP fill:#f39c12,color:#fff
    style PD fill:#3498db,color:#fff
    style GT fill:#3498db,color:#fff
    style PM fill:#3498db,color:#fff
    style PV fill:#2ecc71,color:#fff
    style PDET fill:#2ecc71,color:#fff
    style HI fill:#95a5a6,color:#fff
```

**Legend**: 🟡 Public  🔵 Patient  🟢 Provider  ⚫ Public Static


---


## Section from file: healthcare_wellness_portal_requirements.md

# Business Requirements & MVP Scope

## 1. Business Objective

Build a **Healthcare Wellness & Preventive Care Portal** that helps patients track health goals, stay compliant with preventive checkups, and enables healthcare providers to monitor patient progress — all while maintaining healthcare data privacy standards.

## 2. Problem Statement

Patients often miss preventive care milestones and struggle to maintain consistent wellness habits. Healthcare providers lack a simple digital tool to monitor patient compliance with preventive care schedules. This portal bridges that gap with a secure, user-friendly platform.

## 3. Target Users

| Role | Description |
|------|-------------|
| **Patient** | Individuals tracking wellness goals (steps, water, sleep) and preventive care reminders (blood tests, checkups) |
| **Healthcare Provider** | Doctors/nurses monitoring assigned patients' goal compliance and preventive checkup status |

## 4. MVP Scope — In Scope

| # | Feature | Priority |
|---|---------|----------|
| 1 | **Secure Authentication** – Registration & login with JWT, role-based access (patient vs provider) | 🔴 Critical |
| 2 | **Patient Dashboard** – Wellness goal progress, preventive care reminders, health tip of the day | 🔴 Critical |
| 3 | **Goal Tracker** – Log daily goals (steps, water intake, sleep hours) | 🔴 Critical |
| 4 | **Profile Management** – View/edit patient health info (allergies, medications) | 🟡 High |
| 5 | **Provider Dashboard** – View assigned patients, compliance status, click for detail | 🟡 High |
| 6 | **Public Health Info Page** – Static general health info + privacy policy | 🟢 Medium |
| 7 | **Privacy & Security** – Audit logging, consent checkbox, HIPAA basics | 🔴 Critical |

## 5. MVP Scope — Out of Scope (Future Iterations)

- Real-time chat between patient and provider
- Appointment scheduling / telehealth
- Integration with wearable devices (Fitbit, Apple Health)
- Advanced analytics / AI-based health recommendations
- Payment / insurance processing
- Mobile native apps (iOS/Android)
- Multi-language support

## 6. Success Criteria

| Criteria | Metric |
|----------|--------|
| Functional auth | Patients & providers can register, login, and access role-specific dashboards |
| Goal tracking | Patients can log ≥3 goal types and see progress on dashboard |
| Compliance visibility | Providers can see patient compliance status (Met / Missed) |
| Security | JWT auth, password hashing, audit logging, consent collection all functional |
| Deployment | Both services deployed and accessible via public URLs |
| CI/CD | Automated test + build pipeline runs on push to `main` |

## 7. Constraints

- **Time-bound MVP** – Focus on demonstrable core features over polish
- **HIPAA awareness** – Implement basic compliance measures (encryption, access controls, audit logs); full HIPAA certification is out of scope for MVP
- **Cloud free tier** – Render.com free tier and MongoDB Atlas free tier introduce cold-start latency


---
