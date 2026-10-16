import { cookies } from "next/headers";
import { env } from "cloudflare:workers";

const COOKIE_NAME = "school_teacher_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = (env as unknown as Record<string, string>).TEACHER_SESSION_SECRET;
  if (!value) throw new Error("Teacher session secret is unavailable");
  return value;
}

async function signature(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createTeacherSession(teacherId: number) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${teacherId}.${expires}`;
  const token = `${payload}.${await signature(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function getTeacherSessionId() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [id, expires, supplied] = token.split(".");
  if (!id || !expires || !supplied || Number(expires) < Math.floor(Date.now() / 1000)) return null;
  const expected = await signature(`${id}.${expires}`);
  if (expected.length !== supplied.length) return null;
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  return difference === 0 && Number.isInteger(Number(id)) ? Number(id) : null;
}

export async function clearTeacherSession() {
  (await cookies()).set(COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}
