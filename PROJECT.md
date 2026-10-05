# Project

## Overview
Atellas Fleet manages voitures, reservations, contracts and invoices.
The GPS map at http://localhost:8080/admin/gps consumes live AlloGPS telemetry only.

## Stack & versions
Laravel 11, PHP 8.2, React 19, TypeScript 5, Vite 6, MySQL 8, Docker Compose.

## Structure
- backend: Laravel API, migrations, services and Pest tests.
- frontend: React administration, Leaflet map, Vitest and Playwright tests.
- nginx: Docker reverse proxy; bridge: deployment manifests.

## Setup & run
Run commands from the repository root unless specified otherwise.
GPS_API_BASE_URL, GPS_API_AGENCY_ID, GPS_API_EMAIL, GPS_API_PASSWORD,
GPS_REFRESH_INTERVAL_SECONDS belong in ignored .env.gps.
Never use sample credentials or db:seed to initialize a client's real fleet.

### API-first GPS
1. Configure the real GPS provider credentials in ignored .env.gps.
2. `docker compose up -d --build --wait backend frontend`
3. `docker compose exec -T backend php artisan migrate --force` (creates persistent `gps_device_matricules` mapping storage).
4. `docker compose exec -T backend php artisan config:cache`
5. Open http://localhost:8080/admin/gps. Every valid unique device returned by the GPS API appears in the list; every device with valid API coordinates appears on the map. Polling fetches positions, speed, status, timestamps and kilometrage automatically.
6. Database voitures, gps_visible and GPS_VISIBLE_MATRICULES never determine the displayed fleet. No fleet import, database cleanup, manually entered position or mock fallback is required.
7. Names and matricules come from the API. WW labels remain visible with permanent matricule unavailable; do not invent a replacement plate. Six current provider registrations use serial-letter-region and are represented canonically for matricule comparison.
8. Unique matricule matches may enrich API devices with local reservation/contract and association metadata. Ambiguous or missing local matches leave the API device visible and unassociated. Unmatched local voitures never appear in the map or association options.
9. To associate an API voiture manually, use its "Associer cette voiture…" dropdown and select an unclaimed configured matricule. The one-to-one mapping is stored by GPS provider device ID, does not create or require a local car record, and can be removed with "Dissocier". Only currently unclaimed matricules are offered; duplicate claims are rejected.

The retained visibility endpoint and GPS_VISIBLE_MATRICULES are legacy database-management/cleanup controls only; they do not filter the GPS map. The database cleanup workflow below is optional and unrelated to displaying live devices.

### Backup and cleanup (requires owner approval)
1. Audit first: `docker compose exec -T backend php artisan gps:cleanup`.
2. Take a complete MySQL backup (shell is INSIDE the db container; no passwords pass through chat):
   `docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump -u "$MYSQL_USER" --single-transaction --no-tablespaces "$MYSQL_DATABASE" > /tmp/fleet-before-gps-cleanup.sql'`
3. Copy it to protected storage: `docker compose cp db:/tmp/fleet-before-gps-cleanup.sql ./fleet-before-gps-cleanup.sql`. This file contains personal data; keep it outside source control and restrict access.
4. Review every selected record and its dependencies. Seed fingerprints alone do not prove that later bookings or contracts are fake. Obtain explicit approval for exact voiture IDs.
5. Example only, NOT executed: `docker compose exec backend php artisan gps:cleanup --car=ID --delete`. This prompts for confirmation, writes a private JSON rollback snapshot, and deletes only explicitly selected, unmatched, non-whitelisted voitures with no business dependencies. GPS associations are backed up with the voiture and removed transactionally.
6. Related reservations, contracts, invoices, fines, maintenance and reviews must be reviewed separately. The command refuses dependency-bearing voitures rather than cascading deletion of potentially real documents. Do not disable foreign keys.
7. Restore command-owned deletions: `docker compose exec backend php artisan gps:cleanup --restore=gps-backups/FILENAME.json`. Existing IDs are never overwritten. Restore the full SQL backup only during an approved maintenance window, since it replaces later database changes.
8. Verify: `docker compose exec -T backend php artisan gps:cleanup`, then `cd frontend` and `npm run test:e2e:gps`.

### Client PC
Copy the updated project without local secrets or database volumes. Install Docker Desktop, configure that client's .env and .env.gps, start the stack, and follow the same backup/audit/migration/approval steps. Import only their verified records, never the development MySQL volume. Set NGINX_PORT=8080 in .env to retain the route. If using native PHP instead, run the same artisan commands from backend with that client's database configuration. Never run migrate:fresh on a real database.

### User Management (RBAC)
UI: `/admin/settings` → Gestion des utilisateurs (tabs: Utilisateurs admin, Clients, Roles, Audit).
Endpoints (`/api/admin`, backend-enforced via `permission:<page>[,<action>]`): `users` (CRUD + `{id}/activate`, `{id}/deactivate`, `{id}/send-reset-link`), `roles` (CRUD; delete with users needs `reassign_to`), `permissions` (catalog), `clients` (read-only, search/filters, réservations), `audit-logs`. Website routes use `website:<key>`.
Apply on any PC (back up first with mysqldump):
1. `docker compose up -d --build`
2. `docker compose exec backend php artisan migrate --force` (backfills `user_type` and `role_id` for existing users; logins unchanged)
3. Optional: `docker compose exec backend php artisan db:seed --force`. The migration already syncs roles and permissions, and this command resets the seeded admin account's password.
4. `docker compose exec backend php artisan optimize:clear`

### Source inventory (2026-10-04, before removal)
| Source | Fake voiture / identifier | Runtime relevance |
| --- | --- | --- |
| backend/database/seeders/CarSeeder.php (removed) | Dacia Logan A-12345-B; Sandero A-23456-B; Duster B-34567-C; Peugeot 208 C-45678-D; Renault Clio D-56789-E; Hyundai Accent E-67890-F; Renault Express F-78901-G; Kia Picanto G-89012-H | Historical seed records had fixed positions, fuel and odometer; same fingerprints in Docker cars IDs 1-8 |
| backend/database/migrations/2026_04_11_000000_seed_car_images.php | The same eight seed matricules | Sample writes removed; filename retained as a no-op for migration history |
| frontend/constants.ts (voiture catalogue removed) | c1 Dacia Logan; c2 Sandero; c3 Duster; c4 Peugeot 208; c5 Peugeot 301; c6 Citroen C3; c7 Renault Clio; c8 Hyundai Accent; c9 Renault Express; c10 Kia Picanto | Was a booking fallback and recommendation catalogue; runtime now uses API data |
| frontend/components/Admin/mockData.ts (removed) | V-001 Atellas GT Stradale 72819-A-1; V-002 Range Rover Autobiography 11029-B-6; V-003 Porsche 911 Cabriolet 88210-A-1 | Fixed positions/odometer; no runtime imports found; also sample bookings B-101/B-102/B-103 |
| backend/app/Services/DemoSeeder.php | Dacia Logan 2023; Renault Clio 2022; Hyundai Tucson 2024; Fiat 500 2023; Toyota Corolla 2024 | Random A-* plates, demo_account_id ownership; excluded from GPS; retained for separate demo-account feature |
| backend/database/factories/CarFactory.php and backend/tests; frontend GPS tests | Faker/test fixtures | Test-only; never used as runtime fallback; retained to test rejection |
| backend/database/seeders/BookingPlanningSeeder.php, ClientPlanningSeeder.php, ReviewSeeder.php, FineSeeder.php, MaintenanceSeeder.php | Synthetic clients, bookings, reviews, fines and maintenance | No longer invoked by default DatabaseSeeder; existing dependencies require owner review |
| backend/database/seeders/PickupPointSeeder.php | Fixed pickup-point coordinates | Pickup locations, not voiture telemetry; not used by the GPS map |
| backend/render.yaml | db:seed on deployment | Removed to prevent sample recreation |
| backend/docker/entrypoint.sh, backend/docker/mysql, docker-compose.yml, backend/docker-compose.yml, bridge, frontend/public, Presentation | No additional fake voiture/GPS insertion source found | Docker startup runs schema migrations, not fleet seeding; presentation text is not runtime telemetry |

No application SQL dumps or GPS fleet JSON fixtures were found outside dependencies/build outputs. Other static marketing content is outside the GPS scope. Audit does not treat a reservation/contract as real merely because it exists: planning/demo seeders also create such records.

### Docker record review
The read-only audit includes cars table IDs, actual matricules, qte, demo ownership, verified devices and dependency counts. IDs 1-8 match the eight seed templates above; do not delete them solely by ID on another PC. All nine image matricules were absent from this Docker database at initial audit. Six provider devices have equivalent registrations; 40-D-27135, 40-D-57068 and 40-D-52289 have no proven provider registration match. No real identities or telemetry are invented to fill those gaps.

| cars.id | voiture / matricule | Direct business dependencies | GPS associations |
| --- | --- | --- | --- |
| 1 | Dacia Logan / A-12345-B | bookings 2, contracts 2, fines 1, maintenance_logs 1, reviews 1 | 0 |
| 2 | Dacia Sandero / A-23456-B | bookings 2, contracts 2, fines 1, maintenance_logs 1, reviews 1 | 0 |
| 3 | Dacia Duster / B-34567-C | fines 1, maintenance_logs 1, reviews 1 | 0 |
| 4 | Peugeot 208 / C-45678-D | fines 1, maintenance_logs 1, reviews 1 | 0 |
| 5 | Renault Clio / D-56789-E | bookings 2, contracts 2, maintenance_logs 1, reviews 1 | 1 (live device ID; protected pending review) |
| 6 | Hyundai Accent / E-67890-F | bookings 1, contracts 1, reviews 1 | 0 |
| 7 | Renault Express / F-78901-G | None found | 0 |
| 8 | Kia Picanto / G-89012-H | bookings 1, contracts 1 | 0 |

Counts are a point-in-time Docker inventory, not deletion authorization. IDs 1-6 and 8 require business-document review; ID 7 is an isolated candidate but still requires owner approval. Associations to any currently live device are protected even if their plate is questionable. Indirect invoice dependencies are preserved because related bookings/contracts block deletion.

## Decisions
- GPS API is the sole source of displayed fleet membership, names, matricules and telemetry; database flags and whitelists cannot hide devices.
- Exactly one non-demo voiture unit and one live device sharing a canonical matricule may supply optional association metadata. Missing/ambiguous matches never remove API devices.
- gps_visible and GPS_VISIBLE_MATRICULES never control fleet display. GPS_VISIBLE_MATRICULES limits manual association choices and protects cleanup candidates.
- A failed GPS API request remains an error; database records and frontend fixtures are never used as a location fallback.
- Cleanup is opt-in, backed up, dependency-aware and never cascades business documents.
- Database deletion requires explicit owner confirmation; none was performed during implementation.
- RBAC: one `role_id` per user. Roles carry `admin_access`/`website_access` plus granular `admin.<page>.<action>` and `website.*` permissions from `PermissionCatalog`.
- `user_type` (staff/client) isolates the two lists. Clients are created only through website register/login and never get admin access implicitly.
- Super Admin and Client roles are protected. The last active Super Admin cannot be removed. Users cannot grant permissions they lack. Sensitive changes are written to `audit_logs`.

## Changelog
- 2026-10-05: Added the User Management module (staff users, client list, custom roles, granular backend-enforced permissions, audit log) in /admin/settings.
- 2026-10-04: Replaced database-gated GPS display with the complete live API fleet; removed local visibility controls from the GPS page and retained only verified optional association metadata.
- 2026-10-05: Added persistent, one-to-one API device-to-matricule association choices for live GPS voitures without requiring local car records.
- 2026-10-04: Added real-only GPS eligibility, environment whitelist, reversible visibility and safe cleanup/audit workflow; removed static voiture fallbacks and automatic sample seeding.