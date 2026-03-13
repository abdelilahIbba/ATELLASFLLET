<div align="center">

# 🚗 Atellas Fleet — Premium Car Rental Platform

**A full-stack, production-ready fleet management & car rental system built for Moroccan agencies.**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## ✨ Overview

**Atellas Fleet** is a complete car rental and fleet management platform designed for Moroccan rental agencies. It combines a polished client-facing booking experience with a powerful admin dashboard — all in a self-hosted, Dockerized environment.

> Built with a **React + TypeScript** frontend and a **Laravel 12** REST API backend, connected via Docker Compose.

---

## 🖥️ Screenshots

| Client Booking | Admin Dashboard | Gantt Planning |
|---|---|---|
| Multi-step booking modal with live availability calendar | Full fleet + KYC + booking management | Real-time Gantt chart per vehicle & unit |

---

## 🗂️ Project Structure

```
AtellasFleetFullVers/
├── backend/          # Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API controllers (Cars, Bookings, KYC…)
│   │   ├── Models/                 # Eloquent models
│   │   └── Services/               # Business logic services
│   ├── database/
│   │   ├── migrations/             # All DB schema migrations
│   │   └── seeders/                # Sample data seeders
│   ├── routes/api.php              # All API routes
│   └── docker/                     # Nginx, PHP-FPM, Supervisor configs
│
├── frontend/         # React 18 + TypeScript SPA
│   ├── components/
│   │   ├── Admin/                  # Admin dashboard modules
│   │   ├── Booking/                # Client booking modal (multi-step)
│   │   ├── UI/                     # Shared UI components
│   │   └── Pages/                  # Full page components
│   ├── services/api.ts             # Axios API client
│   └── types.ts                    # Shared TypeScript types
│
├── nginx/            # Reverse proxy config (HTTPS)
└── docker-compose.yml
```

---

## 🚀 Features

### 👤 Client Side
- **Multi-step booking wizard** — vehicle selection → identity verification → confirmation
- **Live availability calendar** — 3-month grid per vehicle, color-coded (available / booked / partial)
- **Document OCR scanner** — scan CIN / driving license via camera or file upload
- **GPS pickup locator** — auto-detect client position via browser Geolocation API
- **Pickup & dropoff points** — choose agency branch or airport (6 Moroccan airports seeded)
- **AI Fleet Assistant** — Gemini-powered chatbot for vehicle recommendations
- **Booking tracking page** — clients track their rental status with an access key

### 🔧 Admin Dashboard
- **Fleet management** — add / edit / delete vehicles with full specs, documents, GPS coordinates
- **Booking management (Gantt)** — interactive Gantt chart per vehicle with unit-level rows
- **KYC Client profiles** — full client dossier with document history
- **Pickup point management** — manage branches and airports (type: pickup / dropoff / both)
- **Real-time availability calendar** — per-vehicle calendar in the booking form
- **Analytics & reports** — revenue charts, active rentals, pending requests
- **Contract generator** — printable PDF rental contracts
- **Conflict detection** — backend 422 response with the next suggested available slot
- **Fine / Infraction tracking** — log speeding fines and damage against bookings

### ⚙️ Technical Highlights
- **Laravel Sanctum** authentication with role-based access (client / admin)
- **Multi-unit vehicles** — Dacia Sandero ×4 tracked as separate plate-level units
- **Image uploads** — vehicle photos & document uploads stored in Laravel `storage/`
- **Docker Compose** — one command spins up PHP-FPM, MySQL, Nginx, Supervisor (queue worker)
- **SSL ready** — `nginx/generate-ssl.sh` for self-signed certificates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | Laravel 12, PHP 8.3, MySQL 8 |
| **Auth** | Laravel Sanctum (SPA token auth) |
| **Maps** | Leaflet.js + OpenStreetMap |
| **AI** | Google Gemini API (`gemini-1.5-flash`) |
| **Queue** | Laravel queues with Supervisor |
| **Containerization** | Docker + Docker Compose |
| **Reverse Proxy** | Nginx (SSL/TLS) |

---

## ⚡ Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac/Linux)
- [Node.js](https://nodejs.org/) ≥ 20 (for local frontend dev)

### 1. Clone the repository
```bash
git clone https://github.com/abdelilahIbba/ATELLASFLLET.git
cd ATELLASFLLET
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set DB_PASSWORD, APP_KEY, GEMINI_API_KEY, MAIL_* ...
```

### 3. Start with Docker Compose
```bash
docker-compose up -d --build
```

This starts:
- `backend` — PHP-FPM + Laravel (port 9000 internal)
- `db` — MySQL 8 (port 3306 internal)
- `nginx` — Reverse proxy (port 443 / 80 → backend + frontend)
- `frontend` — Vite build served statically

### 4. Run migrations & seeders
```bash
docker-compose exec backend php artisan migrate --seed
```

### 5. Open the app
```
https://localhost        → Client-facing site
https://localhost/admin  → Admin dashboard (login required)
```

### Local Frontend Dev (optional, hot-reload)
```bash
cd frontend
npm install
npm run dev   # → http://localhost:5174
```

---

## 🔑 Default Admin Account

After seeding, log in with:

```
Email:    admin@atellasfleet.ma
Password: password
```

> ⚠️ Change these credentials immediately in production.

---

## 📦 API Reference (selected endpoints)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cars` | List all available vehicles |
| `GET` | `/api/cars/{id}/booked-periods` | Booking schedule for one vehicle |
| `POST` | `/api/cars/check-availability` | Check availability for date range |
| `POST` | `/api/bookings` | Create a booking |
| `POST` | `/api/auth/login` | Authenticate (returns Sanctum token) |
| `GET` | `/api/admin/bookings` | Admin: list all bookings |
| `GET` | `/api/admin/cars` | Admin: full fleet list |
| `GET` | `/api/admin/pickup-points` | Admin: pickup/dropoff locations |

All admin routes require `Authorization: Bearer <token>` with an admin-role user.

---

## 🗺️ Roadmap

- [ ] Stripe / CMI payment gateway integration
- [ ] Mobile app (React Native)
- [ ] WhatsApp notification on booking confirmation
- [ ] Multi-agency / multi-branch support
- [ ] Advanced analytics export (Excel/PDF)

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with ❤️ in Morocco 🇲🇦

</div>
