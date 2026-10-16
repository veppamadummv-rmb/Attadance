import { eq } from "drizzle-orm";
import { getAdminAccount } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";

export async function POST(request: Request) {
  const currentAdmin = await getAdminAccount();
  if (!currentAdmin) return Response.json({ error: "Admin access required" }, { status: 403 });
  const db = getDb();
  const { id } = await request.json() as { id?: number };
  if (!Number.isInteger(id) || !id || id < 1) return Response.json({ error: "Invalid teacher account" }, { status: 400 });
  if (currentAdmin.id === id) return Response.json({ error: "You cannot delete your own admin account" }, { status: 400 });
  const deleted = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (!deleted.length) return Response.json({ error: "Teacher account was not found" }, { status: 404 });
  return Response.json({ ok: true, deletedId: id });
}
