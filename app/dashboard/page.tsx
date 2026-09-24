import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasStudioSession } from "../../lib/studio-auth";
import Dashboard from "./Dashboard";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Create your world — Aempy Studio",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  if (!(await hasStudioSession())) redirect("/login");
  return <Dashboard />;
}
