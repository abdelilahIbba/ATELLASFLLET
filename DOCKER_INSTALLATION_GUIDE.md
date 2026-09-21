# Atellas Fleet Docker Installation Guide

This guide shows how to install and run the project on another device using Docker Compose.

## What this project needs

- Docker Desktop or Docker Engine with Docker Compose
- Git, if you want to clone the repository on the new device
- Internet access for the first image build and dependency download

## Services started by Docker

The root `docker-compose.yml` starts these services:

- `nginx` for the reverse proxy and HTTPS entrypoint
- `backend` for the Laravel API
- `frontend` for the React app
- `db` for MySQL
- `redis` for cache, sessions, and queues
- `adminer` for database access in the browser

## 1. Copy the project to the other device

Either clone the repository on the new device or copy the full project folder.

```bash
git clone <repository-url>
cd AtellasFleetFullVers
```

## 2. Create the root environment file

This project uses the root `.env` file for Docker deployment.

```bash
copy .env.example .env
```

On macOS or Linux, use:

```bash
cp .env.example .env
```

Edit `.env` and set at least these values:

- `APP_KEY`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_ROOT_PASSWORD`
- `MAIL_*` if you want email features to work
- `VITE_GEMINI_API_KEY` if the AI assistant is used

If `APP_KEY` is empty, generate one from the backend container after the first start.

## 3. Review the default ports

By default the project uses:

- `80` for the main web app
- `443` for HTTPS
- `8181` for Adminer
- `3307` for external MySQL access
- `6380` for external Redis access

You can change them in `.env` if they conflict with other services on the new device.

## 4. Build and start the containers

Run the full stack from the repository root:

```bash
docker compose up -d --build
```

The first build may take several minutes because it installs PHP, Node, Composer, and frontend dependencies.

## 5. Generate the Laravel application key

If `APP_KEY` is still empty, generate it inside the backend container:

```bash
docker compose exec backend php artisan key:generate --show
```

Copy the output into the root `.env` file as `APP_KEY=...`, then restart the stack:

```bash
docker compose down
docker compose up -d
```

## 6. Run migrations and seeders

After the containers are healthy, create the database schema and seed sample data:

```bash
docker compose exec backend php artisan migrate --seed
```

## 7. Create the storage link

If file uploads or public assets are needed, create the Laravel storage symlink:

```bash
docker compose exec backend php artisan storage:link
```

## 8. Open the application

Use these URLs in the browser:

- `http://localhost` for the main app
- `https://localhost` if HTTPS is enabled in your environment
- `http://localhost:8181` for Adminer

If the machine is remote or on a LAN, replace `localhost` with the device IP or hostname.

## 9. Log in with seeded admin credentials

If the seeders create the default admin account, use:

- Email: `admin@atellasfleet.ma`
- Password: `password`

Change these credentials immediately after the first login.

## Useful maintenance commands

```bash
docker compose logs -f
docker compose ps
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose down
```

## If you move the project again

To transfer the project to another device with its database data, copy these items as well:

- the project folder
- the root `.env` file
- Docker volumes if you want the current MySQL data and uploads preserved

If you do not copy the Docker volumes, the app code will still run, but the database will start empty and need migrations and seeders again.
