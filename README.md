# Vikramaditya Metrology Center (VMC)

High-precision industrial metrology management platform for calibration workflows, gauge registration, customer party management, billing, dispatch, and quality compliance.

Built with **React 19**, **Vite**, **TypeScript**, **Express**, **TailwindCSS v4**, **PostgreSQL**, **Redis**, and **Supabase**.

---

## 🌟 Key Features
- **ISO/IEC 17025 Compliance**: Calibration certificate tracking, ULR numbers, NABL vs Non-NABL calibration badges.
- **Quotations & PO Workflow**: Instant PDF generation, discount tracking, and email delivery.
- **Certificate & Quotation Emailing via Gmail SMTP**: Direct PDF emailing with registered party or custom recipient email selection.
- **Hybrid Storage & Offline Capability**: Automatic fallback between Local PostgreSQL with Redis caching and Supabase Cloud.
- **Role-Based Access Control (RBAC)**: Dedicated permissions for `admin`, `manager`, and `staff`.

---

## 🚀 Quick Start with Docker

The application runs seamlessly with Docker Compose, providing:
1. **Frontend & Backend App** (`vmc-app` on port `5001`) — Multi-stage container serving Express backend and built Vite frontend.
2. **PostgreSQL Database** (`vmc-postgres` on port `5432`) — Persistent local relational storage.
3. **Redis Cache** (`vmc-redis` on port `6379`) — 5-minute TTL caching layer with instant cache hits (< 1ms).

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start all services
docker compose up -d --build
```

Access the application at: **[http://localhost:5001](http://localhost:5001)**

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start frontend development server
npm run dev:frontend

# Start backend development server
npm run start:backend

# Build both frontend and backend
npm run build
```

---

## ⚙️ Environment Variables

Configuration is managed in [.env](.env):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5001` | HTTP Port for the application |
| `POSTGRES_HOST` | `db` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_DB` | `vmc_db` | Database name |
| `POSTGRES_USER` | `vmc_user` | Database user |
| `POSTGRES_PASSWORD` | `vmc_password` | Database password |
| `REDIS_HOST` | `redis` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_TTL` | `300` | Redis caching TTL (seconds) |
| `VITE_SUPABASE_URL` | *(optional)* | Supabase Cloud URL (if using cloud mode) |
| `VITE_SUPABASE_ANON_KEY` | *(optional)* | Supabase Cloud Anon Key |
| `GMAIL_USER` | *(optional)* | Gmail SMTP User email |
| `GMAIL_APP_PASSWORD` | *(optional)* | Gmail SMTP 16-character App Password |

---

## 📁 Repository Structure

```
├── backend/            # Express REST API, PostgreSQL queries, Redis caching
│   ├── dist/           # Compiled backend build
│   ├── scripts/        # Schema definition (schema.sql) and seed scripts
│   ├── src/            # Backend source code (index.ts, db.ts, redis.ts)
│   ├── package.json    # Backend dependencies
│   └── tsconfig.json   # TypeScript config
├── frontend/           # React, Vite, Lucide, Tailwind & Custom UI
│   ├── dist/           # Static production build
│   ├── src/            # Components, pages, hooks, Smart DB Client
│   ├── package.json    # Frontend dependencies
│   └── vite.config.ts  # Vite build configuration
├── netlify/            # Netlify serverless functions (send-email)
├── supabase/           # Supabase edge functions
├── .env.example        # Environment variable template
├── Dockerfile          # Multi-stage production container
├── docker-compose.yml  # Docker multi-service orchestration (app, postgres, redis)
└── package.json        # Monorepo root workspace configuration
```
