# CarRent — Backend API

Production-ready Laravel 11 backend for the **CarRent** application.  
Serves both the original Blade/web UI **and** a full REST API (via Laravel Sanctum) so any front-end (React, Vue, Flutter, mobile) can connect.

---

## Table of Contents

1. [Requirements](#requirements)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Quick Start (Local)](#quick-start-local)
4. [Environment Variables](#environment-variables)
5. [Database & Migrations](#database--migrations)
6. [API Authentication](#api-authentication)
7. [API Endpoints](#api-endpoints)
8. [Testing](#testing)
9. [Project Structure](#project-structure)

---

## Requirements

| Tool       | Version  |
|------------|----------|
| PHP        | ≥ 8.2    |
| Composer   | ≥ 2.x    |
| MySQL      | ≥ 8.0    |
| Node.js    | ≥ 18 (for Vite/Tailwind assets) |
| Docker     | optional but recommended |

---

## Quick Start (Docker)

```bash
cp .env.example .env          # configure DB, APP_KEY, etc.
docker compose up -d --build
docker compose exec app php artisan migrate --seed
```

The app will be available at `http://localhost:8000`.

---

## Quick Start (Local)

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
npm install && npm run build   # compile front-end assets
php artisan serve              # http://127.0.0.1:8000
```

---

## Environment Variables

Key `.env` entries to configure:

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=car_rental
DB_USERNAME=root
DB_PASSWORD=secret

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173,localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## Database & Migrations

```bash
php artisan migrate            # run all migrations
php artisan migrate:fresh --seed  # reset & seed sample data
```

Key tables: `users`, `cars`, `bookings`, `blogs`, `testimonials`, `contacts`, `activity_logs`, `personal_access_tokens`.

---

## API Authentication

The API uses **Laravel Sanctum** token-based authentication.

### Register

```
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0612345678",
  "national_id": "AB123456",
  "driver_license_number": "DL-12345",
  "password": "password",
  "password_confirmation": "password"
}
```

**Response** → `201` with `{ user, token }`

### Login

```
POST /api/login
Content-Type: application/json

{ "email": "john@example.com", "password": "password" }
```

**Response** → `200` with `{ user, token }`

### Using the token

Include the token in the `Authorization` header for all authenticated requests:

```
Authorization: Bearer <token>
```

### Logout

```
POST /api/logout
Authorization: Bearer <token>
```

---

## API Endpoints

### Public (no auth required)

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/register`                 | Register new user        |
| POST   | `/api/login`                    | Login & get token        |
| GET    | `/api/cars`                     | List available cars      |
| GET    | `/api/cars/{id}`                | Car details              |
| POST   | `/api/cars/check-availability`  | Check car availability   |
| GET    | `/api/blogs`                    | List published blogs     |
| GET    | `/api/blogs/{slug}`             | Blog by slug             |
| GET    | `/api/testimonials`             | List active testimonials |
| POST   | `/api/contact`                  | Submit contact form      |

### Authenticated (any user)

| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| POST   | `/api/logout`                     | Revoke current token    |
| GET    | `/api/me`                         | Current user profile    |
| GET    | `/api/profile`                    | Get profile details     |
| PUT    | `/api/profile`                    | Update profile          |
| PUT    | `/api/profile/password`           | Change password         |
| DELETE | `/api/profile`                    | Delete account          |
| GET    | `/api/bookings`                   | My bookings             |
| POST   | `/api/bookings`                   | Create booking          |
| GET    | `/api/bookings/{id}`              | Booking details         |
| PUT    | `/api/bookings/{id}/cancel`       | Cancel booking          |

### Admin only (`role = admin`)

| Method | Endpoint                               | Description               |
|--------|----------------------------------------|---------------------------|
| GET    | `/api/admin/dashboard`                 | Dashboard statistics      |
| POST   | `/api/admin/cars`                      | Create car                |
| PUT    | `/api/admin/cars/{id}`                 | Update car                |
| DELETE | `/api/admin/cars/{id}`                 | Delete car                |
| GET    | `/api/admin/bookings`                  | All bookings              |
| PUT    | `/api/admin/bookings/{id}/status`      | Update booking status     |
| DELETE | `/api/admin/bookings/{id}`             | Delete booking            |
| GET    | `/api/admin/blogs`                     | All blogs (inc. drafts)   |
| POST   | `/api/admin/blogs`                     | Create blog               |
| GET    | `/api/admin/blogs/{id}`                | Blog details              |
| PUT    | `/api/admin/blogs/{id}`                | Update blog               |
| DELETE | `/api/admin/blogs/{id}`                | Delete blog               |
| GET    | `/api/admin/testimonials`              | All testimonials          |
| POST   | `/api/admin/testimonials`              | Create testimonial        |
| PUT    | `/api/admin/testimonials/{id}`         | Update testimonial        |
| DELETE | `/api/admin/testimonials/{id}`         | Delete testimonial        |
| GET    | `/api/admin/contacts`                  | All contact messages      |
| GET    | `/api/admin/contacts/{id}`             | Contact details           |
| DELETE | `/api/admin/contacts/{id}`             | Delete contact            |
| GET    | `/api/admin/clients`                   | List clients              |
| GET    | `/api/admin/clients/{id}`              | Client details            |
| POST   | `/api/admin/clients`                   | Create client             |
| PUT    | `/api/admin/clients/{id}`              | Update client             |
| DELETE | `/api/admin/clients/{id}`              | Delete client             |

---

## Testing

```bash
php artisan test                   # run all Pest tests
php artisan test --filter=Api      # run API tests only
```

---

## Project Structure

```
backend_final/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                 ← NEW: REST API controllers
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── BlogController.php
│   │   │   │   ├── BookingController.php
│   │   │   │   ├── CarController.php
│   │   │   │   ├── ClientController.php
│   │   │   │   ├── ContactController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ProfileController.php
│   │   │   │   └── TestimonialController.php
│   │   │   ├── Admin/              ← Existing admin web controllers
│   │   │   └── Auth/               ← Existing Breeze auth controllers
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php   ← Existing (web)
│   │   │   └── ApiRoleMiddleware.php← NEW: JSON role guard
│   │   ├── Requests/               ← Form requests
│   │   └── Resources/              ← NEW: API resources
│   │       ├── BlogResource.php
│   │       ├── BookingResource.php
│   │       ├── CarResource.php
│   │       ├── ContactResource.php
│   │       ├── TestimonialResource.php
│   │       └── UserResource.php
│   ├── Mail/
│   ├── Models/                      ← User, Car, Booking, Blog, etc.
│   ├── Providers/
│   └── View/
├── bootstrap/
├── config/
│   ├── cors.php                     ← NEW: CORS config
│   ├── sanctum.php                  ← NEW: Sanctum config
│   └── ...
├── database/
│   └── migrations/
│       ├── 2025_01_01_..._create_personal_access_tokens_table.php ← NEW
│       └── ...
├── docker/                          ← Docker configs (nginx, php, supervisor)
├── public/
├── resources/views/                 ← Blade views (kept for web UI)
├── routes/
│   ├── api.php                      ← NEW: All API routes
│   ├── web.php
│   └── auth.php
├── storage/
├── tests/
├── composer.json                    ← Updated: +sanctum
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## License

MIT
