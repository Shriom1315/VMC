# Vikramaditya Metrology Control (VMC)

High-precision industrial metrology interface for absolute tolerance validation, calibration logs, and diagnostic telemetry. This comprehensive suite manages everything from material inward handling to Party and Gauge Master registrations.

## Project Structure

This project leverages a modern full-stack architecture running inside Docker:

- **Frontend:** React + Vite + Tailwind CSS (`app` container, port `3000`)
- **Backend:** Node.js + Express API (`api` container, port `3001`)
- **Database:** PostgreSQL with automated initialization (`db` container, port `5432`)
- **Environment Orchestration:** Docker Compose

## Quick Start (Using Docker)

The fastest way to spin up the entire application stack is with Docker Compose.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

1. Clone the repository and navigate into it.
2. Build and start the containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```
3. Access the application:
   - **Frontend App (UI):** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:3001/api/parties](http://localhost:3001/api/parties)
   - **PostgreSQL Database:** `localhost:5432` (User: `vmc_user`, Password: `vmc_password`)

*Note: On the first boot, PostgreSQL will automatically run the schema from `db-init/init.sql` to initialize your tables (`party_master`, `gauge_master`, etc).*

## Local Development (Without Docker for Code)

If you prefer to run the API and React app on your host machine for faster development loops, but keep the database in Docker:

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start purely the Database:**
   ```bash
   docker-compose up -d db
   ```
3. **Start the API Server (Terminal 1):**
   ```bash
   npx tsx server/index.ts
   ```
4. **Start the Vite Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

## Key Features
- **Party Registration Module:** Fully integrated form linking frontend React state to a PostgreSQL backend via an Express API.
- **Inward Log Processing:** Track incoming materials with real-time UI telemetry and database statuses.
- **Automated Database Seeding:** Clean schema teardown and built-in SQL initialization on container startup.
- **PDF Generation:** Quote and invoice exports via `jspdf`.
