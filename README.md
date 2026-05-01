# Collaborative Team Hub - Monorepo

A production-ready SaaS application for team collaboration, built with Turborepo, Next.js 14, and Express.js.

## Tech Stack

### Monorepo
- **Turborepo**: High-performance build system for JavaScript/TypeScript monorepos.

### Frontend (`apps/web`)
- **Next.js 14**: App Router architecture.
- **Tailwind CSS**: Modern styling.
- **Zustand**: Global state management.
- **Lucide React**: Clean icons.
- **Socket.io Client**: Real-time communication.

### Backend (`apps/api`)
- **Node.js & Express.js**: RESTful API.
- **Prisma ORM**: Type-safe database access (PostgreSQL).
- **JWT & Cookies**: Secure authentication.
- **Socket.io Server**: Real-time events.
- **Cloudinary**: Media uploads.

## Project Structure

```text
├── apps
│   ├── api          # Express.js REST API
│   └── web          # Next.js 14 Frontend
├── packages
│   └── ui           # Shared UI components (optional)
├── turbo.json       # Turborepo configuration
└── package.json     # Root workspace configuration
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 2. Installation
Install dependencies from the root:
```bash
npm install
```

### 3. Environment Variables
Copy the `.env.example` files in both `apps/api` and `apps/web` to `.env` and fill in your details.

**API:**
```bash
cp apps/api/.env.example apps/api/.env
```

**Web:**
```bash
cp apps/web/.env.example apps/web/.env
```

### 4. Database Setup
Run migrations and generate Prisma client:
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Running the Project
Run both frontend and backend in development mode from the root:
```bash
npm run dev
```

The web app will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

## Features
- ✅ Modular Backend Architecture
- ✅ JWT Authentication with Cookie-based Refresh
- ✅ Beautiful Dashboard UI (Linear/Notion inspired)
- ✅ Kanban Board for Task Management
- ✅ Prisma Schema with Workspace/Team relations
- ✅ Real-time Socket.io integration (Foundation)
