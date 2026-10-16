import { eq } from "drizzle-orm";
import { getAdminAccount } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";

export async function POST(request: Request) {
  const currentAdmin = await getAdminAccount();
  if (!currentAdmin) return Response.json({ error: "Admin access required" }, { status: 403 });
  const { id, role } = await request.json() as { id?: number; role?: "admin" | "teacher" };
  if (!Number.isInteger(id) || !id || !["admin", "teacher"].includes(role || "")) return Response.json({ error: "Invalid role change" }, { status: 400 });
  const db = getDb();
  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target || !target.nic || !target.phone) return Response.json({ error: "Teacher account was not found" }, { status: 404 });
  if (currentAdmin.id === target.id && role === "teacher") return Response.json({ error: "You cannot remove your own admin access" }, { status: 400 });
  await db.update(users).set({ role: role! }).where(eq(users.id, id!));
  return Response.json({ ok: true, role });
}
