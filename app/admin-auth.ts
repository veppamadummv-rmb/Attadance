import { eq } from "drizzle-orm";
import { getChatGPTUser } from "./chatgpt-auth";
import { getTeacherSessionId } from "./teacher-auth";
import { getDb } from "../db";
import { users } from "../db/schema";

export async function getAdminAccount() {
  const db = getDb();
  const chatGPTUser = await getChatGPTUser();
  if (chatGPTUser) {
    const [account] = await db.select().from(users).where(eq(users.email, chatGPTUser.email)).limit(1);
    return account?.role === "admin" ? account : null;
  }
  const sessionId = await getTeacherSessionId();
  if (!sessionId) return null;
  const [account] = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
  return account?.role === "admin" ? account : null;
}
