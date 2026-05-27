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
            position INTEGER NOT NULL,
            image TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            subcategory TEXT NOT NULL,
            calories TEXT NOT NULL,
            price TEXT NOT NULL,
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
      .then(() => undefined);
  }

  await schemaPromise;
}
