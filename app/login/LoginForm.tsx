"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, { error: "" });
  return <form action={action} className="access-form">
    <label htmlFor="access-code">Studio access code</label>
    <input id="access-code" name="code" type="password" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter your code" maxLength={32} required aria-describedby="access-status" disabled={pending || !configured}/>
    <p className="access-error" id="access-status" role="status">{configured ? state.error : "Studio access is being connected. Please try again shortly."}</p>
    <button type="submit" disabled={pending || !configured}>{pending ? "Opening your studio…" : "Enter Studio"}<span aria-hidden="true">→</span></button>
    <p className="access-note">Private preview · Use the access code you were given.</p>
  </form>;
}
