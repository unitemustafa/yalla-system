import { prisma } from "@/lib/prisma";

let themeSchemaPromise: Promise<void> | null = null;

export async function ensureThemeSchema() {
  if (!themeSchemaPromise) {
    themeSchemaPromise = prisma
      .$transaction([
        prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS themes (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            description TEXT NOT NULL,
            occasion TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'inactive',
            primaryColor TEXT NOT NULL,
            secondaryColor TEXT NOT NULL,
            backgroundColor TEXT NOT NULL,
            textColor TEXT NOT NULL,
            buttonColor TEXT NOT NULL,
            headerNavigationColor TEXT NOT NULL,
            darkPrimaryColor TEXT,
            darkSecondaryColor TEXT,
            darkBackgroundColor TEXT,
            darkTextColor TEXT,
            darkButtonColor TEXT,
            darkHeaderNavColor TEXT,
            welcomeMessage TEXT,
            autoActivate BOOLEAN NOT NULL DEFAULT false,
            revertToDefault BOOLEAN NOT NULL DEFAULT true,
            startAt DATETIME,
            endAt DATETIME,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
        prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS theme_assets (
            id TEXT PRIMARY KEY NOT NULL,
            themeId TEXT NOT NULL,
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            alt TEXT,
            sortOrder INTEGER NOT NULL DEFAULT 0,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT theme_assets_themeId_fkey
              FOREIGN KEY (themeId) REFERENCES themes (id)
              ON DELETE CASCADE ON UPDATE CASCADE
          )
        `),
        prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS theme_targets (
            id TEXT PRIMARY KEY NOT NULL,
            themeId TEXT NOT NULL,
            target TEXT NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT true,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT theme_targets_themeId_fkey
              FOREIGN KEY (themeId) REFERENCES themes (id)
              ON DELETE CASCADE ON UPDATE CASCADE
          )
        `),
        prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS active_theme_settings (
            id TEXT PRIMARY KEY NOT NULL,
            target TEXT NOT NULL,
            themeId TEXT,
            source TEXT NOT NULL DEFAULT 'manual',
            fallbackThemeSlug TEXT NOT NULL DEFAULT 'default',
            activatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expiresAt DATETIME,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT active_theme_settings_themeId_fkey
              FOREIGN KEY (themeId) REFERENCES themes (id)
              ON DELETE SET NULL ON UPDATE CASCADE
          )
        `),
        prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS themes_slug_key ON themes (slug)
        `),
        prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS themes_status_idx ON themes (status)
        `),
        prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS themes_autoActivate_startAt_endAt_idx
          ON themes (autoActivate, startAt, endAt)
        `),
        prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS theme_assets_themeId_idx
          ON theme_assets (themeId)
        `),
        prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS theme_assets_type_idx
          ON theme_assets (type)
        `),
        prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS theme_targets_themeId_target_key
          ON theme_targets (themeId, target)
        `),
        prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS theme_targets_target_idx
          ON theme_targets (target)
        `),
        prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS active_theme_settings_target_key
          ON active_theme_settings (target)
        `),
        prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS active_theme_settings_themeId_idx
          ON active_theme_settings (themeId)
        `),
      ])
      .then(() => undefined);
  }

  await themeSchemaPromise;
}
