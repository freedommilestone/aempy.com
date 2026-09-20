"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  PROJECTS_CHANGED,
  STAGES,
  deleteProject,
  loadProjects,
  stageIndex,
  type Project,
} from "@/lib/projects";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function refresh() {
      setProjects(loadProjects());
    }
    refresh();
    window.addEventListener(PROJECTS_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROJECTS_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sorted = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [projects],
  );

  const activeId = pathname.startsWith("/studio/")
    ? pathname.slice("/studio/".length).split("/")[0]
    : "";

  return (
    <>
      <header className="studio-header">
        <Link className="logo" href="/">
          aempy
        </Link>
        <nav className="studio-nav" aria-label="Studio">
          <button
            className="button ghost sidebar-toggle"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="project-sidebar"
          >
            Projects
          </button>
          <Link href="/">Home</Link>
          <Link href="/studio" aria-current="page">
            Studio
          </Link>
        </nav>
      </header>

      <div className={`studio-shell${open ? " is-open" : ""}`}>
        <aside className="studio-sidebar" id="project-sidebar">
          <div className="sidebar-head">
            <p className="kicker">Projects</p>
            <Link className="button ghost" href="/studio">
              New
            </Link>
          </div>
          {sorted.length === 0 ? (
            <p className="sidebar-empty">No videos yet.</p>
          ) : (
            <nav className="sidebar-list" aria-label="YouTube video projects">
              {sorted.map((project) => {
                const current = project.id === activeId;
                return (
                  <div
                    key={project.id}
                    className={`sidebar-item${current ? " is-current" : ""}`}
                  >
                    <Link href={`/studio/${project.id}`}>
                      <strong>{project.title}</strong>
                      <span>
                        {formatDate(project.createdAt)} ·{" "}
                        {STAGES[stageIndex(project.currentStage)]?.label}
                      </span>
                    </Link>
                    <button
                      className="sidebar-remove"
                      type="button"
                      aria-label={`Remove ${project.title}`}
                      onClick={() => {
                        deleteProject(project.id);
                        if (current) {
                          router.push("/studio");
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </nav>
          )}
        </aside>
        <div className="studio-main">{children}</div>
      </div>
    </>
  );
}
