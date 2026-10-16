import { clearTeacherSession } from "../../teacher-auth";
export async function POST() { await clearTeacherSession(); return Response.json({ ok: true }); }
