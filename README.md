# Yalla System Workspace

This workspace contains the current frontend work for Yalla Market:

- Flutter Yalla Market
- Flutter Yalla Home
- Next.js Yalla Admin
- Temporary demo/local data used for frontend development
- No production backend yet

The repository is currently focused on organizing and improving the customer-facing app and the admin dashboard. Backend implementation is intentionally deferred.

## Current Status

The project does not currently include a production-ready backend.

`apps/api`, `packages/contracts`, `packages/api-client`, and `infra` are placeholder areas only. They may contain empty folders or `.gitkeep` files so the intended workspace structure can be kept in version control, but they are not active application code and should not be treated as implemented backend, shared contracts, API clients, database migrations, or deployment infrastructure.

Current data flows are frontend-oriented and rely on temporary demo/local data where needed. Any API routes inside the Next.js dashboard are local dashboard helpers, not the production backend for the full system.

Backend work is postponed and will not be implemented in the current phase.

## Structure

```text
apps/
  yalla_market/  Flutter Yalla Market application
  yalla_home/    Flutter Yalla Home application
  yalla_admin/   Next.js Yalla Admin dashboard
  api/           Placeholder for future backend work

packages/
  contracts/        Placeholder for future shared contracts
  api-client/       Placeholder for a future shared API client

infra/
  db/               Placeholder for future database tooling
  nginx/            Placeholder for future deployment/proxy config
```

## Roadmap

The current phase is limited to frontend and dashboard cleanup:

- Clean up and organize the Flutter Yalla Market.
- Clean up and organize the Next.js Yalla Admin.
- Keep demo/local data clearly separated from future production integration.
- Avoid adding backend implementation until the backend phase is explicitly started.

Future backend, shared contracts, API client, database, and infrastructure work will be planned separately.

## Common Commands

Yalla Market app:

```bash
cd apps/yalla_market
flutter pub get
flutter analyze
flutter test
```

Home app:

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
npm run dev
```

## Architecture Notes

- Shared Flutter foundations live under `apps/yalla_market/lib/core`.
- Flutter domain areas live under `apps/yalla_market/lib/features`.
- Store catalog demo/reference data lives with the store feature in `apps/yalla_market/lib/features/store/data/catalog`.
- Dashboard routes live under `apps/yalla_admin/app`.
- Dashboard implementation lives under `apps/yalla_admin/features/dashboard`.
- Dashboard auth screens live under `apps/yalla_admin/features/auth`.
- Generic reusable dashboard primitives stay inside the dashboard feature until another app needs them.
- Placeholder backend folders under `apps/api` are not active implementation.
- Placeholder package folders under `packages` are not currently consumed by the apps.

## Repository Note

The two apps currently have their own Git repositories. If this workspace becomes one root repository, either remove the nested `.git` folders or convert the apps to intentional submodules before adding them at the root.
