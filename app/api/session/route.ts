import { eq, sql } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getTeacherSessionId } from "../../teacher-auth";
import { getDb } from "../../../db";
import { transactions, users } from "../../../db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const db = getDb();
  const auth = await getChatGPTUser();
  if (auth) {
    let [account] = await db.select().from(users).where(eq(users.email, auth.email)).limit(1);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "admin"));
    if (!account && Number(count) === 0) [account] = await db.insert(users).values({ role: "admin", name: auth.displayName, email: auth.email }).returning();
    if (!account || account.role !== "admin") return Response.json({ error: "This ChatGPT account is not an administrator" }, { status: 403 });
    const allAccounts = await db.select().from(users);
    const teachers = allAccounts.filter((item) => item.nic && item.phone);
    const rows = await db.select().from(transactions);
    return Response.json({ linked: true, authMode: "admin", account, teachers, transactions: rows }, { headers: { "cache-control": "no-store" } });
  }

  const teacherId = await getTeacherSessionId();
  if (!teacherId) return Response.json({ error: "Teacher login required" }, { status: 401 });
  const [account] = await db.select().from(users).where(eq(users.id, teacherId)).limit(1);
  if (!account) return Response.json({ error: "Teacher account is unavailable" }, { status: 401 });
  if (account.role === "admin") {
    const allAccounts = await db.select().from(users);
    const teachers = allAccounts.filter((item) => item.nic && item.phone);
    const rows = await db.select().from(transactions);
    return Response.json({ linked: true, authMode: "delegated-admin", account, teachers, transactions: rows }, { headers: { "cache-control": "no-store" } });
  }
  const rows = await db.select().from(transactions).where(eq(transactions.teacherId, teacherId));
  return Response.json({ linked: true, authMode: "teacher", account, transactions: rows }, { headers: { "cache-control": "no-store" } });
}
