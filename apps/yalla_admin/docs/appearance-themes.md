# Appearance / Themes System

## Architectural Overview

The theme system is backend-driven. Admins manage seasonal visual themes from
Dashboard Settings, and all clients fetch the active theme configuration from
the API. The theme changes branding tokens only: colors, logo, banner, splash
screen, decorative assets, and welcome messages. Layout and feature behavior
stay controlled by the client applications.

Main flow:

1. Admin creates or edits a theme in `Settings > Appearance / Themes`.
2. The backend stores theme metadata in `themes`, files/URLs in
   `theme_assets`, and target apps in `theme_targets`.
3. Manual activation writes one row per app target in `active_theme_settings`.
4. Automatic activation is resolved at read time by `startAt`, `endAt`,
   `autoActivate`, `status`, and target support.
5. If a theme is expired, disabled, missing, or has unavailable config, the
   active-theme API returns the Default Theme.

## Database Schema

Implemented in `prisma/schema.prisma`:

- `themes`: theme identity, occasion type, status, light/dark colors, welcome
  message, auto-activation dates, and fallback behavior.
- `theme_assets`: one-to-many assets per theme. Supported types are `banner`,
  `splash`, `logo`, and `decorative`.
- `theme_targets`: many targets per theme. Supported targets are `delivery`,
  `market`, and `dashboard`.
- `active_theme_settings`: one active manual theme per target, with source,
  expiration, and fallback theme slug.

Important constraints:

- `themes.slug` is unique.
- `theme_targets` is unique by `(themeId, target)`.
- `active_theme_settings.target` is unique.
- Assets and targets cascade when a theme is hard-deleted.

## API Endpoints

Public app endpoint:

```http
GET /api/themes/active?target=delivery
GET /api/themes/active?target=market
GET /api/themes/active?target=dashboard
GET /api/themes/active?target=all
```

Dashboard admin endpoints:

```http
GET    /api/dashboard/themes
POST   /api/dashboard/themes
GET    /api/dashboard/themes/:themeId
PATCH  /api/dashboard/themes/:themeId
DELETE /api/dashboard/themes/:themeId
POST   /api/dashboard/themes/:themeId/activate
POST   /api/dashboard/themes/:themeId/deactivate
POST   /api/dashboard/themes/:themeId/assets
POST   /api/dashboard/themes/preview
```

Create/update request:

```json
{
  "name": "Ramadan Theme",
  "slug": "ramadan-2027",
  "description": "Seasonal Ramadan identity",
  "occasion": "ramadan",
  "status": "active",
  "colors": {
    "primary": "#0f766e",
    "secondary": "#f59e0b",
    "background": "#fff7ed",
    "text": "#1f2937",
    "button": "#0f766e",
    "headerNavigation": "#064e3b"
  },
  "darkColors": {
    "primary": "#5eead4",
    "secondary": "#fbbf24",
    "background": "#10231f",
    "text": "#f8fafc",
    "button": "#14b8a6",
    "headerNavigation": "#06251f"
  },
  "welcomeMessage": "Ramadan Kareem",
  "autoActivate": true,
  "revertToDefault": true,
  "startAt": "2027-02-07T00:00:00.000Z",
  "endAt": "2027-03-09T23:59:59.000Z",
  "targets": ["delivery", "market"],
  "assets": {
    "bannerUrl": "/uploads/theme-assets/ramadan/banner.webp",
    "splashScreenUrl": "/uploads/theme-assets/ramadan/splash.webp",
    "logoUrl": "/uploads/theme-assets/ramadan/logo.webp",
    "decorativeAssets": [
      "/uploads/theme-assets/ramadan/lantern.webp",
      "/uploads/theme-assets/ramadan/crescent.webp"
    ]
  }
}
```

Active theme response:

```json
{
  "target": "market",
  "source": "scheduled",
  "isFallback": false,
  "fallbackReason": null,
  "resolvedAt": "2026-05-30T16:00:00.000Z",
  "theme": {
    "id": "theme-id",
    "slug": "ramadan-2027",
    "colors": {
      "primary": "#0f766e",
      "secondary": "#f59e0b",
      "background": "#fff7ed",
      "text": "#1f2937",
      "button": "#0f766e",
      "headerNavigation": "#064e3b"
    },
    "assets": {
      "bannerUrl": "/uploads/theme-assets/ramadan/banner.webp",
      "splashScreenUrl": "/uploads/theme-assets/ramadan/splash.webp",
      "logoUrl": "/uploads/theme-assets/ramadan/logo.webp",
      "decorativeAssets": []
    }
  }
}
```

## Frontend Application Strategy

Clients should treat the theme response as design tokens:

- Map colors to CSS variables, Flutter `ThemeData`, or app design tokens.
- Apply `logoUrl`, `bannerUrl`, and `splashScreenUrl` only where those assets
  already exist in the layout.
- Render decorative assets with small counts and fixed sizes.
- If an image fails to load, keep the current asset or fall back to Default
  Theme assets.
- Cache the last successful active theme locally so apps can boot safely if the
  network is temporarily unavailable.

Recommended web token mapping:

```css
:root {
  --theme-primary: #0f766e;
  --theme-secondary: #f59e0b;
  --theme-background: #fff7ed;
  --theme-text: #1f2937;
  --theme-button: #0f766e;
  --theme-header-navigation: #064e3b;
}
```

## Admin Dashboard UI

The Dashboard Settings page now includes:

- Theme list with status, color swatches, active targets, and target chips.
- Create/edit form for identity, schedule, colors, dark mode colors, assets,
  message, and target selection.
- Apply-to-all switch plus per-target switches.
- Preview button for home, product cards, category cards, buttons, banners,
  header, and dashboard layout.
- Activate, deactivate, soft-disable, and upload-asset actions.

## Production Rules

- Do not let a theme change app layout or route behavior.
- Keep decorative assets light: at most 8 decorative assets per theme.
- Use hex colors and validate contrast before publishing.
- Prefer WebP/AVIF/PNG assets with optimized dimensions.
- Keep Default Theme active and never delete it.
- Use a cloud object store in production for uploaded files; the local
  `/public/uploads/theme-assets` path is suitable for local/dev deployments.
- Apply scheduled themes dynamically at read time so no cron is required.

## Practical Examples

Ramadan:

- Occasion: `ramadan`
- Message: `Ramadan Kareem`
- Colors: deep teal primary, gold secondary, warm light background
- Assets: lantern, crescent, stars, Ramadan banner
- Targets: delivery, market, dashboard or selected apps only

Eid:

- Occasion: `eid-al-fitr` or `eid-al-adha`
- Message: `Eid Mubarak`
- Colors: celebratory purple/gold or green/gold
- Assets: Eid banner, gift/decorative shapes, optional seasonal logo
- Targets: market and dashboard, or all apps for a full campaign
