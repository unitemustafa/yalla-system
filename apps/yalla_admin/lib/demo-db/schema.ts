import { prisma } from "@/lib/prisma";

let schemaPromise: Promise<void> | null = null;

// TODO: Convert demo price/date strings to typed numeric/date fields in a
// planned migration. The local schema keeps strings for compatibility today.
export async function ensureDashboardSchema() {
  if (!schemaPromise) {
    schemaPromise = prisma
      .$transaction([
        prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS dashboard_items (
            id TEXT PRIMARY KEY NOT NULL,
            code TEXT NOT NULL UNIQUE,
            position INTEGER NOT NULL,
            image TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            subcategory TEXT NOT NULL,
            shopName TEXT NOT NULL DEFAULT '',
            calories TEXT NOT NULL,
            price TEXT NOT NULL,
            variantDetails TEXT NOT NULL DEFAULT '{}',
            visibilityMode TEXT NOT NULL DEFAULT 'general',
            regionSlugs TEXT NOT NULL DEFAULT '[]',
            regionNames TEXT NOT NULL DEFAULT '[]',
            featured TEXT NOT NULL,
            active BOOLEAN NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
        prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS dashboard_orders (
            number TEXT PRIMARY KEY NOT NULL,
            position INTEGER NOT NULL,
            customer TEXT NOT NULL,
            phone TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            total REAL NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            payment TEXT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
      ])
      .then(async () => {
        await prisma.$executeRawUnsafe(
          "ALTER TABLE dashboard_items ADD COLUMN code TEXT",
        ).catch(() => undefined);
        await prisma.$executeRawUnsafe(`
          UPDATE dashboard_items
          SET code = 'PRD-SEED-' || printf('%03d', rowid)
          WHERE code IS NULL OR trim(code) = ''
        `);
        await prisma.$executeRawUnsafe(
          "CREATE UNIQUE INDEX IF NOT EXISTS dashboard_items_code_key ON dashboard_items(code)",
        );
        await prisma.$executeRawUnsafe(
          "ALTER TABLE dashboard_items ADD COLUMN variantDetails TEXT NOT NULL DEFAULT '{}'",
        ).catch(() => undefined);
        await prisma.$executeRawUnsafe(
          "ALTER TABLE dashboard_items ADD COLUMN shopName TEXT NOT NULL DEFAULT ''",
        ).catch(() => undefined);
        await prisma.$executeRawUnsafe(
          "ALTER TABLE dashboard_items ADD COLUMN visibilityMode TEXT NOT NULL DEFAULT 'general'",
        ).catch(() => undefined);
        await prisma.$executeRawUnsafe(
          "ALTER TABLE dashboard_items ADD COLUMN regionSlugs TEXT NOT NULL DEFAULT '[]'",
        ).catch(() => undefined);
        await prisma.$executeRawUnsafe(
          "ALTER TABLE dashboard_items ADD COLUMN regionNames TEXT NOT NULL DEFAULT '[]'",
        ).catch(() => undefined);
      })
      .then(() => undefined);
  }

  await schemaPromise;
}
