# Yalla Home

Flutter courier app for managing Yalla Home delivery orders.

## Features

- Arabic-first delivery workflow.
- Active, delivered, notification, and profile tabs.
- Delivery proof capture with camera/gallery uploads.
- Theme switching and offline connection status.
- Courier tracking map with live location updates.

## Running

```powershell
flutter pub get
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:8000
```

على Android Emulator استخدم `http://10.0.2.2:8000` بدلًا من
`127.0.0.1`. حسابات المناديب تُنشأ من لوحة التحكم، ولا يوجد تسجيل حساب جديد
داخل التطبيق.

## Google Maps

The courier tracking map uses `google_maps_flutter`.

Set `GOOGLE_MAPS_API_KEY` before running the app, then enable the Google Maps
SDK for Android and iOS in Google Cloud. For iOS, expose the same value as an
Xcode build setting named `GOOGLE_MAPS_API_KEY`.

```powershell
$env:GOOGLE_MAPS_API_KEY="your-google-maps-key"
flutter run
```

## Checks

```powershell
flutter analyze
flutter test
```
