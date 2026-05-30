CREATE TABLE "themes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "occasion" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'inactive',
  "primaryColor" TEXT NOT NULL,
  "secondaryColor" TEXT NOT NULL,
  "backgroundColor" TEXT NOT NULL,
  "textColor" TEXT NOT NULL,
  "buttonColor" TEXT NOT NULL,
  "headerNavigationColor" TEXT NOT NULL,
  "darkPrimaryColor" TEXT,
  "darkSecondaryColor" TEXT,
  "darkBackgroundColor" TEXT,
  "darkTextColor" TEXT,
  "darkButtonColor" TEXT,
  "darkHeaderNavColor" TEXT,
  "welcomeMessage" TEXT,
  "autoActivate" BOOLEAN NOT NULL DEFAULT false,
  "revertToDefault" BOOLEAN NOT NULL DEFAULT true,
  "startAt" DATETIME,
  "endAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "theme_assets" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "themeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "theme_assets_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "theme_targets" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "themeId" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "theme_targets_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "active_theme_settings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "target" TEXT NOT NULL,
  "themeId" TEXT,
  "source" TEXT NOT NULL DEFAULT 'manual',
  "fallbackThemeSlug" TEXT NOT NULL DEFAULT 'default',
  "activatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" DATETIME,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "active_theme_settings_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "themes_slug_key" ON "themes" ("slug");
CREATE INDEX "themes_status_idx" ON "themes" ("status");
CREATE INDEX "themes_autoActivate_startAt_endAt_idx" ON "themes" ("autoActivate", "startAt", "endAt");
CREATE INDEX "theme_assets_themeId_idx" ON "theme_assets" ("themeId");
CREATE INDEX "theme_assets_type_idx" ON "theme_assets" ("type");
CREATE UNIQUE INDEX "theme_targets_themeId_target_key" ON "theme_targets" ("themeId", "target");
CREATE INDEX "theme_targets_target_idx" ON "theme_targets" ("target");
CREATE UNIQUE INDEX "active_theme_settings_target_key" ON "active_theme_settings" ("target");
CREATE INDEX "active_theme_settings_themeId_idx" ON "active_theme_settings" ("themeId");
