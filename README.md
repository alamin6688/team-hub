# TeamHub - Advanced Team Collaboration Platform

A premium, production-ready SaaS application for team collaboration, built with a high-performance Monorepo architecture using **Turborepo**, **Next.js 14** and **Express.js**.

---

## 🔗 Quick Links & Demo

| Resource | Link |
| :--- | :--- |
| **Live Link** | [TeamHub](https://web-production-6b9d8.up.railway.app/login) |
| **Video Walkthrough** | [Overview of project](https://www.loom.com/share/36dd2b25458e440b85a267ee50929f1a) |
| **Quick Login** | `email: admin@teamhub.com` / `password: admin123` |

---

## 🚀 Key Advanced Features

### 🎨 Dynamic Workspace Branding
- **Custom Accent Colors**: Each workspace can define its own visual identity through a centralized branding system.
- **Global Injection**: Brand colors propagate instantly to buttons, charts, and navigation links via a dynamic CSS variable system.
- **Premium Aesthetics**: Automatically adjusts gradients and micro-animations based on the chosen brand palette for a polished feel.

### 📜 Audit Log & Compliance
- **Immutable Ledger**: Every significant action (goal changes, member updates, announcements) is recorded in an immutable audit trail.
- **Timeline UI**: A filterable, interactive timeline view that allows administrators to track changes chronologically.
- **CSV Export**: One-click reporting functionality to export workspace activity for compliance or external analysis.

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Monorepo** | [Turborepo](https://turbo.build/) | High-performance build system & task orchestration |
| **Frontend** | [Next.js 14](https://nextjs.org/) | Modern Dashboard UI with App Router & Server Components |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling with dynamic branding variables |
| **State Mgmt** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight & scalable global state management |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Premium micro-animations & smooth transitions |
| **Backend** | [Express.js](https://expressjs.com/) | Modular REST API with clean architecture |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Robust relational data storage |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database access & schema management |
| **Real-time** | [Socket.io](https://socket.io/) | Bi-directional live updates & notifications |
| **Auth** | [JWT & Cookies](https://jwt.io/) | Secure session management with Silent Refresh |
| **Media** | [Cloudinary](https://cloudinary.com/) | Cloud-based avatar & media management |

---

## 📂 Project Structure

```text
├── apps
│   ├── api          # Express.js REST API (Modular Architecture)
│   └── web          # Next.js 14 Frontend (Modern Dashboard)
├── packages
│   └── ui           # Shared design system components
├── turbo.json       # Turborepo build & cache configuration
└── package.json     # Root workspace orchestration
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (Local or Cloud instance)

### 2. Installation
Install all dependencies from the root directory:
```bash
npm install
```

### 3. Environment Configuration
Create `.env` files in both `apps/api` and `apps/web` based on the reference below.

### 4. Database Initialization
Generate the Prisma client and push the schema to your database:
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### 5. Launch Development Environment
Run the entire stack simultaneously from the root:
```bash
npm run dev
```

---

## 🔑 Environment Variables Reference

### API (`apps/api/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | `your_access_secret` |
| `JWT_REFRESH_SECRET`| Secret key for refresh tokens | `your_refresh_secret` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `PORT` | API Port | `8000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name for uploads | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |

### Web (`apps/web/.env.local`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:8000` |

---

## ⚠️ Known Limitations
- **Horizontal Scaling**: Socket.io events are currently handled in-memory; horizontal scaling would require a Redis Pub/Sub adapter.
- **Single Workspace Focus**: The current version is optimized for single-organization usage per instance.
- **Media Hosting**: Requires an active Cloudinary account for profile avatar uploads.
- **Audit Log Storage**: Logs are stored in the primary PostgreSQL database; for high-traffic workspaces, an archival strategy might be needed.

---

## 📄 License
This project is proprietary and built for high-performance team collaboration.
