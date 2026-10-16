import { and, eq, isNull } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { users } from "../../../db/schema";
export async function POST(request:Request){const auth=await getChatGPTUser();if(!auth)return Response.json({error:"Sign in required"},{status:401});const {nic,phone}=await request.json() as {nic?:string;phone?:string};if(!nic?.trim()||!phone?.trim())return Response.json({error:"NIC and phone number are required"},{status:400});const db=getDb();const [teacher]=await db.select().from(users).where(and(eq(users.nic,nic.trim()),eq(users.phone,phone.trim()),isNull(users.email))).limit(1);if(!teacher)return Response.json({error:"Details do not match an unlinked teacher account. Contact the administrator."},{status:404});await db.update(users).set({email:auth.email}).where(eq(users.id,teacher.id));return Response.json({ok:true})}
