import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "aempy_studio_session";
export const SESSION_SECONDS = 60 * 60 * 8;

function secret() { return process.env.STUDIO_SESSION_SECRET; }
export function loginConfigured() { return Boolean(process.env.STUDIO_ACCESS_CODE && secret()); }
export function validAccessCode(value: string) {
  const expected = process.env.STUDIO_ACCESS_CODE;
  if (!expected) return false;
  const given = Buffer.from(value.trim());
  const required = Buffer.from(expected);
  return given.length === required.length && timingSafeEqual(given, required);
}
export function createSessionToken() {
  const key = secret();
  if (!key) throw new Error("Studio access is not configured.");
  const payload = `${Math.floor(Date.now() / 1000) + SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  const signature = createHmac("sha256", key).update(payload).digest("hex");
  return `${payload}.${signature}`;
}
export async function hasStudioSession() {
  const key = secret();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!key || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const expires = Number(parts[0]);
  const now = Math.floor(Date.now() / 1000);
  if (expires <= now || expires > now + SESSION_SECONDS) return false;
  const expected = createHmac("sha256", key).update(`${parts[0]}.${parts[1]}`).digest();
  return timingSafeEqual(Buffer.from(parts[2], "hex"), expected);
}
