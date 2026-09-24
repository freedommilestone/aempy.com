import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasStudioSession } from "../../../lib/studio-auth";
import Dashboard from "../Dashboard";
import "../dashboard.css";
import "../projects.css";

export const metadata: Metadata = { title: "My Projects — Aempy", robots: { index: false, follow: false } };
export default async function ProjectsPage() {
  if (!(await hasStudioSession())) redirect("/login");
  return <Dashboard initialSection="Projects"/>;
}
