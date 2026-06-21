# Yalla System Workspace

Yalla System is a single workspace containing the customer apps, the admin
dashboard, and the Django API they use.

## Active Projects

- `apps/yalla_market`: Flutter customer application.
- `apps/yalla_home`: Flutter home application.
- `apps/yalla_admin`: Next.js admin dashboard.
- `backend`: Django REST API, including the shared authentication service.

PostgreSQL is the primary database for Django. The admin dashboard accesses
catalog and order data exclusively through the Django REST API.

## Structure

```text
apps/
  yalla_market/  Flutter customer app
  yalla_home/    Flutter home app
  yalla_admin/   Next.js admin dashboard

backend/         Django REST API
```

## Common Commands

Yalla Market:

```bash
cd apps/yalla_market
flutter pub get
flutter analyze
flutter test
```

Yalla Home:

```bash
cd apps/yalla_home
flutter pub get
flutter analyze
flutter test
```

Admin dashboard:

```bash
cd apps/yalla_admin
npm install
npm run lint
npm run build
```

Start PostgreSQL (Docker Compose is optional if PostgreSQL is already installed):

```bash
docker compose up -d postgres
```

Django API using PostgreSQL:

```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
# One-time import of the previous local data, only on an empty PostgreSQL DB:
python manage.py loaddata legacy-postgres-import.json
python manage.py runserver
```

Default local connection values are `yalla_db`, `yalla_user`, `1234`,
`127.0.0.1:5432`. Override them with `POSTGRES_DB`, `POSTGRES_USER`,
`POSTGRES_PASSWORD`, `POSTGRES_HOST`, and `POSTGRES_PORT`.
Backend tests also use PostgreSQL and create `test_yalla_db` by default; the
configured PostgreSQL role therefore needs permission to create test databases.
The one-time legacy fixture is local-only and ignored by Git because it contains
account data. The previous SQLite files are retained only as backups and are no
longer referenced by runtime settings.

## Architecture Notes

- Shared Flutter foundations live under `apps/yalla_market/lib/core`.
- Flutter domain areas live under `apps/yalla_market/lib/features`.
- Admin routes live under `apps/yalla_admin/app`.
- Admin implementation lives under `apps/yalla_admin/features`.
- Authentication and user accounts are implemented by `backend/accounts`.
- Generated logs, build output, local databases, uploads, and tool snapshots are
  excluded from version control.
