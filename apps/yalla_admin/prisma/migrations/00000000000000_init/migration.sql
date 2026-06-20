CREATE TABLE "dashboard_items" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "image" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subcategory" TEXT NOT NULL,
  "shopName" TEXT NOT NULL DEFAULT '',
  "calories" TEXT NOT NULL,
  "price" TEXT NOT NULL,
  "variantDetails" TEXT NOT NULL DEFAULT '{}',
  "visibilityMode" TEXT NOT NULL DEFAULT 'general',
  "regionSlugs" TEXT NOT NULL DEFAULT '[]',
  "regionNames" TEXT NOT NULL DEFAULT '[]',
  "featured" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "dashboard_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dashboard_orders" (
  "number" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "customer" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "payment" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "dashboard_orders_pkey" PRIMARY KEY ("number")
);

CREATE UNIQUE INDEX "dashboard_items_code_key" ON "dashboard_items"("code");
