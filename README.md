# Acme Engineering Desktop Application

A modern, full-stack engineering desktop application designed for secure project workspace management, built using Electron, React, Node.js, TypeScript, and Prisma.

---

##  Tech Stack

- **Frontend**: React (v19) + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Desktop Wrapper**: Electron (v34)
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **DevOps/Testing**: Docker Compose, GitHub Actions, Jest + Supertest

---

##  Key Features

1. **Secure Authentication & RBAC**: JWT-based cookie session management with role-based access controls for roles: `ADMIN`, `ENGINEER`, and `VIEWER`.
2. **Subscription Tier Enforcement**: Active subscription verification (`FREE_TRIAL`, `PROFESSIONAL`, `ENTERPRISE`) with request validation and automatic project creation limits (e.g. max 2 projects for `FREE_TRIAL`).
3. **Engineering Workspace & Projects CRUD**: Complete interactive project creation, viewing, updating, and deletion with drag-and-drop sortable interface.
4. **Administrative Audit Trail**: User database management, dynamic role adjustment, subscription editing, and login audit trail tracking.
5. **Robust Dockerization**: Production-ready, multi-stage optimized builds using slim/alpine images with isolated service layers.

---

##  Environment Variables

### Backend (`server/.env`)
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Crypto secret used for signing and verifying JSON Web Tokens.
- `PORT`: Server port (default: `5000`).

### Frontend (`desktop-app/.env`)
- `VITE_API_URL`: Backend server address.

---

##  Getting Started (Running Locally)

To run the application locally in development mode:

### 1. Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL running locally

### 2. Installation
Install all dependencies in the project directories:
```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd server && npm install

# Install frontend & desktop dependencies
cd ../desktop-app && npm install
```

### 3. Database Setup (Migrations)
Make sure your PostgreSQL instance is running and configuration is correct in `server/.env`.
```bash
cd server
npx prisma migrate dev
```

### 4. Running the Full Stack
From the workspace root directory:

- Run backend and frontend dev servers concurrently:
  ```bash
  npm run dev
  ```
- Run backend, frontend, and open the Electron desktop app wrapper:
  ```bash
  npm run fullstack
  ```

---

##  Docker Deployment (Production Stack)

The application is containerized using Docker Compose with the following services:

- PostgreSQL database container
- Backend Node.js service (optimized with Node Alpine image)
- Frontend React service (build-based static serving or Vite dev mode depending on configuration)

Docker Compose ensures full-stack orchestration with a single command:

```bash
docker compose up --build
```

- **PostgreSQL Database** runs inside `postgres` container (healthy check monitored).
- **Backend Service** runs inside `node:alpine` multi-stage container.
- **Frontend Service** compiles React assets and serves them via an optimized `nginx:alpine` instance on port `3000`.

---

##  Desktop Application (Electron)

The Electron desktop application is configured within the frontend workspace.

It launches automatically using:

```bash
npm run fullstack
```

##  Testing

To run the backend test suite:

```bash
npm run test
```

This executes Jest test suites covering authentication endpoints, role-based access controls, and subscription limit enforcements.

---

##  CI/CD (GitHub Actions)

A GitHub Actions pipeline is configured to:

- Install backend dependencies
- Run Prisma client generation
- Execute Jest test suite
- Validate backend stability on every push to `main`
