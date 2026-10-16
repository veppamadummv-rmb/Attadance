import { eq } from "drizzle-orm";
import { getAdminAccount } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { transactions } from "../../../../db/schema";

export async function POST(request: Request) {
  if (!await getAdminAccount()) return Response.json({ error: "Admin access required" }, { status: 403 });
  const db = getDb();
  const p = await request.json() as { id?:number; type?:"deposit"|"loan"|"festival_loan"|"loan_recovery"|"festival_recovery"; amount?:number; month?:string; note?:string };
  const allowed = ["deposit","loan","festival_loan","loan_recovery","festival_recovery"];
  if (!Number.isInteger(p.id) || !p.id || !p.type || !allowed.includes(p.type) || !(Number(p.amount)>0) || !p.month) return Response.json({ error:"Complete all fields correctly" },{status:400});
  const updated = await db.update(transactions).set({ type:p.type, amount:Number(p.amount), month:p.month, note:p.note?.trim()||"" }).where(eq(transactions.id,p.id)).returning({id:transactions.id});
  if(!updated.length) return Response.json({error:"Amount record was not found"},{status:404});
  return Response.json({ok:true});
}
