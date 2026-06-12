import { createOrder, listOrders } from "@/lib/dashboard-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET() {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  return Response.json({ orders: await listOrders() });
}

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => ({}));
  const total = Number(body.total);
  const order = await createOrder({
    customer: typeof body.customer === "string" ? body.customer : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    type: typeof body.type === "string" ? body.type : undefined,
    status: typeof body.status === "string" ? body.status : undefined,
    total: Number.isFinite(total) ? total : undefined,
    date: typeof body.date === "string" ? body.date : undefined,
    time: typeof body.time === "string" ? body.time : undefined,
    payment: typeof body.payment === "string" ? body.payment : undefined,
  });

  return Response.json({ order }, { status: 201 });
}
