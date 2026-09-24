"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, loginConfigured, SESSION_COOKIE, SESSION_SECONDS, validAccessCode } from "../../lib/studio-auth";

export type LoginState = { error: string };
const ATTEMPT_COOKIE = "aempy_login_wait";

export async function login(_previous: LoginState, form: FormData): Promise<LoginState> {
  if (!loginConfigured()) return { error: "Studio access is being connected. Please try again shortly." };
  const jar = await cookies();
  // A short server-enforced retry delay prevents accidental rapid submissions.
  if (jar.has(ATTEMPT_COOKIE)) return { error: "Please wait a few seconds, then try again." };
  const code = form.get("code");
  if (typeof code !== "string" || !validAccessCode(code)) {
    jar.set(ATTEMPT_COOKIE, "1", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/login", maxAge: 3 });
    return { error: "That access code isn’t correct. Please try again." };
  }
  jar.set(SESSION_COOKIE, createSessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_SECONDS });
  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
