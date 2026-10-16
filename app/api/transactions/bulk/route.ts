import { getAdminAccount } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { transactions } from "../../../../db/schema";

type BulkRow = { teacherId: number; deposit?: number; loan?: number; loanRecovery?: number; festivalLoan?: number; festivalRecovery?: number };

export async function POST(request: Request) {
  if (!await getAdminAccount()) return Response.json({ error: "Admin access required" }, { status: 403 });
  const db = getDb();
  const { month, rows } = await request.json() as { month?: string; rows?: BulkRow[] };
  if (!month || !/^\d{4}-\d{2}$/.test(month) || !Array.isArray(rows)) return Response.json({ error: "Select a valid month" }, { status: 400 });
  const values: Array<typeof transactions.$inferInsert> = [];
  const fields = [["deposit","deposit"],["loan","loan"],["loanRecovery","loan_recovery"],["festivalLoan","festival_loan"],["festivalRecovery","festival_recovery"]] as const;
  for (const row of rows.slice(0, 500)) for (const [key, type] of fields) { const amount = Number(row[key] || 0); if (amount > 0 && Number.isFinite(amount)) values.push({ teacherId: row.teacherId, type, amount, month, note: "Bulk monthly entry" }); }
  if (!values.length) return Response.json({ error: "Enter at least one amount" }, { status: 400 });
  await db.insert(transactions).values(values);
  return Response.json({ ok: true, saved: values.length });
}
