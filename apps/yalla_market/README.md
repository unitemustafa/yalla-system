# Yalla Market

Production-oriented Flutter marketplace app for Android, iOS, Web, Windows,
macOS, and Linux.

## Runtime configuration

The app expects a REST backend under `/api/v1`. Pass the API origin at build or
run time:

```bash
flutter run --dart-define-from-file=env/development.json
flutter run --dart-define=API_BASE_URL=https://dev-api.yallamarket.com
flutter build web --dart-define-from-file=env/production.json
flutter build appbundle --dart-define-from-file=env/production.json
```

Debug runs default to `http://127.0.0.1:8000`, so Linux desktop can be started
directly with `flutter run -d linux`.

`env/development.json` points at the local Django backend on
`http://127.0.0.1:8000`, which is suitable for Windows/macOS/Linux desktop and
web. For the Android emulator, use `--dart-define=API_BASE_URL=http://10.0.2.2:8000`.

Debug builds without `API_BASE_URL` use local demo repositories so the UI can be
developed before the backend is available. Release builds require
`API_BASE_URL`.

## API response shape

The full backend contract is documented in
[`docs/api-contract.md`](docs/api-contract.md).

Successful responses should return either a direct JSON payload or:

```json
{ "data": {} }
```

Errors should return:

```json
{ "message": "Human readable error", "code": "ERROR_CODE", "fields": {} }
```

## Android release signing

Copy `android/key.properties.example` to `android/key.properties` and point it
at your upload keystore before release builds. The example file is safe to keep
in source control; the real `android/key.properties` must stay private.

## Verification

```bash
flutter analyze
flutter test --coverage
flutter build web --dart-define-from-file=env/production.json
flutter build apk --release --dart-define-from-file=env/production.json
```
