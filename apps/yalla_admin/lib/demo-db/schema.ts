import { prisma } from "@/lib/prisma";

let schemaPromise: Promise<void> | null = null;

export async function ensureDashboardSchema() {
  if (!schemaPromise) {
    schemaPromise = prisma.$connect();
  }

  await schemaPromise;
}
