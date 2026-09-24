import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasStudioSession } from "../../../../lib/studio-auth";
import ProjectWorkspace from "../../ProjectWorkspace";
import "../../dashboard.css";
import "../../projects.css";
import "../../project-workspace.css";
export const metadata: Metadata = { title: "Your Project — Aempy", robots: { index: false, follow: false } };
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await hasStudioSession())) redirect("/login");
  const { id } = await params;
  return <ProjectWorkspace projectId={id}/>;
}
