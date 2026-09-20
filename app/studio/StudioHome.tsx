"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  SAMPLE_IDEA,
  STAGES,
  buildProject,
  deleteProject,
  loadProjects,
  stageIndex,
  upsertProject,
  type Project,
} from "@/lib/projects";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function StudioHome() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setReady(true);
  }, []);

  const sorted = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [projects],
  );

  function refresh() {
    setProjects(loadProjects());
  }

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
        One board per YouTube video: idea, title, script, voice over,
        storyboard, stills, thumbnail, clips, sound, music, description, and
        a publish checklist.
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
        </div>
      </form>

      {ready && sorted.length === 0 ? (
        <p className="empty">No projects yet. Capture an idea to open a board.</p>
      ) : (
        <div className="project-list">
          {sorted.map((project) => (
            <article key={project.id} className="project-card">
              <Link href={`/studio/${project.id}`}>
                <h2>{project.title}</h2>
                <p className="meta">
                  {formatDate(project.createdAt)} · Stage{" "}
                  {STAGES[stageIndex(project.currentStage)]?.label}
                </p>
              </Link>
              <div className="row-actions">
                <Link className="button ghost" href={`/studio/${project.id}`}>
                  Open board
                </Link>
                <button
                  className="button danger"
                  type="button"
                  onClick={() => {
                    deleteProject(project.id);
                    refresh();
                  }}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
