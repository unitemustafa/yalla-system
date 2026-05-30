CREATE TABLE "dashboard_items" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "position" INTEGER NOT NULL,
  "image" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subcategory" TEXT NOT NULL,
  "calories" TEXT NOT NULL,
  "price" TEXT NOT NULL,
  "featured" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "dashboard_orders" (
  "number" TEXT NOT NULL PRIMARY KEY,
  "position" INTEGER NOT NULL,
  "customer" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "total" REAL NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "payment" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
