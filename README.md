# Multi-Tenant Restaurant Ordering & Management SaaS Platform

A production-ready, full-stack **MERN** SaaS platform built with strict tenant isolation, real-time Socket.IO notifications, server-side financial calculations, and modular Razorpay payments.

---

## ⚡ Quick Start (Windows One-Click)

1. Simply double-click **`start-dev.bat`** in the project root folder.
   - It automatically starts both the **Backend API (port 5000)** and **Frontend (port 5173)** concurrently.
   - If a replica-set-enabled local MongoDB is not available, it initializes an in-memory replica set automatically with sample seed data.
   - Local MongoDB must be configured with replica set name `rs0` because tenant creation uses multi-document transactions. Set `MONGO_URI` to include `?replicaSet=rs0` (or `&replicaSet=rs0` when other query options are already present).

---

## 💻 Running via Terminal Commands

### Option A: Run Both Together (Recommended)
From the root directory (`Hotel Management/`):
```bash
npm run dev
```
*(Starts both backend and frontend concurrently in a single terminal)*

### Option B: Run Separately
- **Backend (Port 5000)**:
  ```bash
  cd backend
  npm run dev
  ```
- **Frontend (Port 5173)**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 🌐 Application Portals & URLs

| Portal | URL | Demo Credentials |
| :--- | :--- | :--- |
| **Landing Page** | [http://localhost:5173/](http://localhost:5173/) | Overview & portal links |
| **Super Admin** | [http://localhost:5173/platform/login](http://localhost:5173/platform/login) | `superadmin@example.com` / `ChangeMe123!` |
| **Restaurant Admin (Tenant A)** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) | `admin@royalspice.com` / `ChangeMe123!` |
| **Restaurant Admin (Tenant B)** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) | `admin@bellaitalia.com` / `ChangeMe123!` |
| **Customer QR Menu (Royal Spice)** | [http://localhost:5173/menu/royal-spice](http://localhost:5173/menu/royal-spice) | Guest ordering (no login required) |
| **Customer QR Menu (Bella Italia)** | [http://localhost:5173/menu/bella-italia](http://localhost:5173/menu/bella-italia) | Guest ordering (no login required) |
| **Interactive Swagger Docs** | [http://localhost:5000/api-docs](http://localhost:5000/api-docs) | OpenAPI 3.0 specification |
| **Backend Health Check** | [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health) | Service monitor |

---

## 🐳 Running with Docker Compose

If Docker is installed:
```bash
docker-compose up --build
```
This boots up:
- MongoDB replica set on `mongodb://localhost:27017` (required for multi-document transactions)
- Express Backend on `http://localhost:5000`
- React Frontend on `http://localhost:5173`

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Socket.IO Client, Recharts, Lucide React icons.
- **Backend**: Node.js, Express, TypeScript, Mongoose, Socket.IO, JWT, bcryptjs, Zod, node-cron, Swagger OpenAPI.
- **Payment & Assets**: Razorpay payment order & webhook signature verification, Cloudinary asset storage abstraction.
