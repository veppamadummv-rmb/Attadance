import { eq } from "drizzle-orm";
import { getAdminAccount } from "../../admin-auth";
import { getDb } from "../../../db";
import { transactions } from "../../../db/schema";
export async function POST(request:Request){if(!await getAdminAccount())return Response.json({error:"Admin access required"},{status:403});const p=await request.json() as {teacherId:number;type:"deposit"|"loan"|"festival_loan"|"loan_recovery"|"festival_recovery";amount:number;month:string;note?:string};if(!p.teacherId||!p.type||!(p.amount>0)||!p.month)return Response.json({error:"Complete all transaction fields"},{status:400});const [row]=await getDb().insert(transactions).values({...p,note:p.note?.trim()||""}).returning();return Response.json({transaction:row},{status:201})}
export async function DELETE(request:Request){if(!await getAdminAccount())return Response.json({error:"Admin access required"},{status:403});const {id}=await request.json() as {id:number};await getDb().delete(transactions).where(eq(transactions.id,id));return Response.json({ok:true})}
