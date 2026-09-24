import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AempyMark from "../components/AempyMark";
import { hasStudioSession, loginConfigured } from "../../lib/studio-auth";
import LoginForm from "./LoginForm";
import "./login.css";

export const metadata: Metadata = { title: "Log in — Aempy Studio", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await hasStudioSession()) redirect("/dashboard");
  return <main className="access-page">
    <a className="access-brand" href="/"><AempyMark/><span>Aempy</span></a>
    <section className="access-card">
      <p className="access-eyebrow">YOUR NEXT WORLD IS WAITING</p>
      <h1>Welcome back,<br/><em>storyteller.</em></h1>
      <p className="access-description">A little idea. An extraordinary world.<br/>Step inside your creative studio.</p>
      <LoginForm configured={loginConfigured()}/>
      <a className="access-back" href="/">← Back to Aempy</a>
    </section>
    <p className="access-footer">Create. Tell. Belong.</p>
  </main>;
}
