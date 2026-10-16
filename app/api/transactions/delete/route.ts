import { eq } from "drizzle-orm";
import { getAdminAccount } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { transactions } from "../../../../db/schema";

export async function POST(request: Request) {
  if (!await getAdminAccount()) return Response.json({ error: "Admin access required" }, { status: 403 });
  const db = getDb();
  const { id } = await request.json() as { id?: number };
  if (!Number.isInteger(id) || !id || id < 1) return Response.json({ error: "Invalid amount record" }, { status: 400 });
  const deleted = await db.delete(transactions).where(eq(transactions.id, id)).returning({ id: transactions.id });
  if (!deleted.length) return Response.json({ error: "Amount record was not found" }, { status: 404 });
  return Response.json({ ok: true, deletedId: id });
}
