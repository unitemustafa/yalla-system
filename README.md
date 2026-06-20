# Yalla System Workspace

Yalla System is a single workspace containing the customer apps, the admin
dashboard, and the Django API they use.

## Active Projects

- `apps/yalla_market`: Flutter customer application.
- `apps/yalla_home`: Flutter home application.
- `apps/yalla_admin`: Next.js admin dashboard.
- `backend`: Django REST API, including the shared authentication service.

The admin dashboard still keeps its catalog and order demo data in a local
Prisma/SQLite database. Authentication can use the Django backend or an explicit
demo mode for dashboard smoke and end-to-end tests.

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

Django API with the local SQLite development settings:

```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate --settings=config.dev_settings
python manage.py runserver --settings=config.dev_settings
```

## Architecture Notes

- Shared Flutter foundations live under `apps/yalla_market/lib/core`.
- Flutter domain areas live under `apps/yalla_market/lib/features`.
- Admin routes live under `apps/yalla_admin/app`.
- Admin implementation lives under `apps/yalla_admin/features`.
- Authentication and user accounts are implemented by `backend/accounts`.
- Generated logs, build output, local databases, uploads, and tool snapshots are
  excluded from version control.
