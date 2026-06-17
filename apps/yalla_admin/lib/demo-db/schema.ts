import { prisma } from "@/lib/prisma";

let schemaPromise: Promise<void> | null = null;

type TableColumn = {
  name: string;
};

async function readTableColumns(tableName: "dashboard_items") {
  const columns = await prisma.$queryRawUnsafe<TableColumn[]>(
    `PRAGMA table_info(${tableName})`,
  );

  return new Set(columns.map((column) => column.name));
}

async function addDashboardItemColumnIfMissing(
  columns: Set<string>,
  columnName: string,
  sql: string,
) {
  if (columns.has(columnName)) return;

  await prisma.$executeRawUnsafe(sql);
  columns.add(columnName);
}

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
        const dashboardItemColumns = await readTableColumns("dashboard_items");

        await addDashboardItemColumnIfMissing(
          dashboardItemColumns,
          "code",
          "ALTER TABLE dashboard_items ADD COLUMN code TEXT",
        );
        await prisma.$executeRawUnsafe(`
          UPDATE dashboard_items
          SET code = 'PRD-SEED-' || printf('%03d', rowid)
          WHERE code IS NULL OR trim(code) = ''
        `);
        await prisma.$executeRawUnsafe(
          "CREATE UNIQUE INDEX IF NOT EXISTS dashboard_items_code_key ON dashboard_items(code)",
        );
        await addDashboardItemColumnIfMissing(
          dashboardItemColumns,
          "variantDetails",
          "ALTER TABLE dashboard_items ADD COLUMN variantDetails TEXT NOT NULL DEFAULT '{}'",
        );
        await addDashboardItemColumnIfMissing(
          dashboardItemColumns,
          "shopName",
          "ALTER TABLE dashboard_items ADD COLUMN shopName TEXT NOT NULL DEFAULT ''",
        );
        await addDashboardItemColumnIfMissing(
          dashboardItemColumns,
          "visibilityMode",
          "ALTER TABLE dashboard_items ADD COLUMN visibilityMode TEXT NOT NULL DEFAULT 'general'",
        );
        await addDashboardItemColumnIfMissing(
          dashboardItemColumns,
          "regionSlugs",
          "ALTER TABLE dashboard_items ADD COLUMN regionSlugs TEXT NOT NULL DEFAULT '[]'",
        );
        await addDashboardItemColumnIfMissing(
          dashboardItemColumns,
          "regionNames",
          "ALTER TABLE dashboard_items ADD COLUMN regionNames TEXT NOT NULL DEFAULT '[]'",
        );
      })
      .then(() => undefined);
  }

  await schemaPromise;
}
