"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { importProjectBackup } from "@/lib/backup";
import {
  PROJECTS_CHANGED,
  SAMPLE_IDEA,
  addYoutubeSet,
  buildProject,
  loadProjects,
  upsertProject,
  type Project,
} from "@/lib/projects";

export function StudioHome() {
  const router = useRouter();
  const [name, setName] = useState("");
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

  function open(project: Project) {
    upsertProject(project);
    router.push(`/studio/${project.id}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    open(buildProject(name));
  }

  return (
    <div className="studio">
      <p className="kicker">Video projects</p>
      <h1>Track what this video actually needs.</h1>
      <p className="studio-lede">
        Start empty. Add a title, a thumbnail, a script — only the pieces you
        use. The full YouTube set is optional.
      </p>

      <form className="new-project" onSubmit={onSubmit}>
        <label className="kicker" htmlFor="name">
          New video
        </label>
        <textarea
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Working title or a one-line brief"
        />
        <div className="row-actions">
          <button className="button primary" type="submit">
            Create empty project
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => {
              if (!name.trim()) return;
              open(addYoutubeSet(buildProject(name)));
            }}
          >
            Create with YouTube set
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => open(addYoutubeSet(buildProject(SAMPLE_IDEA)))}
          >
            Sample with YouTube set
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
        <p className="empty">No projects yet. Name a video to open a board.</p>
      ) : null}
    </div>
  );
}
