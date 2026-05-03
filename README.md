# TeamHub - Advanced Team Collaboration Platform

A premium, production-ready SaaS application for team collaboration, built with a high-performance Monorepo architecture using **Turborepo**, **Next.js 14**, and **Express.js**.

---

## 🔗 Quick Links & Demo

| Resource | Link |
| :--- | :--- |
| **Live Demo** | [teamhub-live.vercel.app](https://team-hub-demo.vercel.app) |
| **Video Walkthrough** | [YouTube Demo](https://youtube.com/watch?v=demo) |
| **Quick Login** | `email: admin@teamhub.com` / `password: admin123` |

---

## 🚀 Key Advanced Features

### 🎨 Dynamic Workspace Branding
- **Custom Accent Colors**: Each workspace can define its own visual identity.
- **Smart Theme Defaults**: Professional Blue for Light Mode and Vibrant Purple for Dark Mode.
- **Global Injection**: Brand colors propagate instantly to buttons, charts, and navigation links via a dynamic CSS variable system.

### 🔔 Real-time Notification System
- **Live Feed**: Notifications appear instantly via Socket.io without page refreshes.
- **Mark as Read**: Integrated "Mark All as Read" functionality both on the frontend and backend.
- **Dynamic Badge**: Live unread count synchronization across the platform.

### 🔐 Silent Authentication Refresh
- **Zero Interruption**: Background token refresh using secure `httpOnly` cookies.
- **Automatic Retries**: API requests are automatically retried upon token expiration, preventing disruptive redirects to the login page.

### 📊 Professional Analytics & Reporting
- **Discrete Data Scaling**: Charts are optimized for whole-number data (no decimal goals/tasks).
- **Brand-Synced Visuals**: Chart bars and area fills automatically match the workspace brand color.
- **Export Capabilities**: Seamless CSV export for Analytics and Audit Logs.

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
Create `.env` files in both `apps/api` and `apps/web` based on the provided `.env.example` files.

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

## 📈 Platform Roadmap
- [x] Workspace Dynamic Branding
- [x] Real-time Notifications & Activity Feed
- [x] Background Token Refresh
- [x] Modular Audit Logging
- [ ] Multi-team Task Dependencies
- [ ] Direct Messaging & Team Chat
- [ ] Advanced AI Productivity Insights

---

## 📄 License
This project is proprietary and built for high-performance team collaboration.
