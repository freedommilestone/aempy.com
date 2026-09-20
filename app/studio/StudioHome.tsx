"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { importProjectBackup } from "@/lib/backup";
import {
  PROJECTS_CHANGED,
  SAMPLE_IDEA,
  buildProject,
  loadProjects,
  upsertProject,
  type Project,
} from "@/lib/projects";

export function StudioHome() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function refresh() {
      setProjects(loadProjects());
      setReady(true);
    }
    refresh();
    window.addEventListener(PROJECTS_CHANGED, refresh);
    return () => window.removeEventListener(PROJECTS_CHANGED, refresh);
  }, []);

  const empty = useMemo(() => ready && projects.length === 0, [ready, projects]);

  function createFrom(raw: string) {
    const project = buildProject(raw);
    upsertProject(project);
    router.push(`/studio/${project.id}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!idea.trim()) return;
    createFrom(idea);
  }

  return (
    <div className="studio">
      <p className="kicker">Video projects</p>
      <h1>Track the story from idea to publish.</h1>
      <p className="studio-lede">
        One board per YouTube video. Pick a project in the left sidebar, or
        start a new idea below.
      </p>

      <form className="new-project" onSubmit={onSubmit}>
        <label className="kicker" htmlFor="idea">
          New video idea
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="What is the episode about? Who is it for? What should they feel at the end?"
        />
        <div className="row-actions">
          <button className="button primary" type="submit">
            Create project
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => createFrom(SAMPLE_IDEA)}
          >
            Start with a sample
          </button>
          <label className="button ghost file-button">
            Import backup
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                try {
                  const projectId = await importProjectBackup(file);
                  router.push(`/studio/${projectId}`);
                } catch {
                  window.alert("That file is not an aempy backup.");
                }
              }}
            />
          </label>
        </div>
      </form>

      {empty ? (
        <p className="empty">No projects yet. Capture an idea to open a board.</p>
      ) : null}
    </div>
  );
}
