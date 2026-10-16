import { getDb } from "../../../db";
import { users } from "../../../db/schema";
import { createTeacherSession } from "../../teacher-auth";

function normalized(value: unknown) { return typeof value === "string" ? value.trim().replace(/[\s-]/g, "") : ""; }

export async function POST(request: Request) {
  const payload = await request.json() as { nic?: string; phone?: string };
  const nic = normalized(payload.nic); const phone = normalized(payload.phone);
  if (!nic || !phone) return Response.json({ error: "NIC number and phone number are required" }, { status: 400 });
  const db = getDb();
  const teacherList = await db.select().from(users);
  const teacher = teacherList.find((item) => normalized(item.nic) === nic && normalized(item.phone) === phone);
  if (!teacher) return Response.json({ error: "NIC number or phone number is incorrect" }, { status: 401 });
  await createTeacherSession(teacher.id);
  return Response.json({ ok: true });
}
