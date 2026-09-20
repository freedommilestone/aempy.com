"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  STAGES,
  applyRecommendation,
  buildProject,
  loadProjects,
  nextStage,
  stageIndex,
  upsertProject,
  type Project,
  type StageId,
} from "@/lib/projects";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="button ghost"
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? "Copied" : "Copy prompt"}
    </button>
  );
}

function promptFor(project: Project, stage: StageId) {
  if (stage === "idea") return project.idea.prompt;
  if (stage === "titles") return project.titles.prompt;
  if (stage === "script") return project.script.prompt;
  if (stage === "voiceover") return project.voiceOver.prompt;
  if (stage === "thumbnail") return project.thumbnail.prompt;
  if (stage === "sound") return project.soundDesign.prompt;
  if (stage === "music") return project.music.prompt;
  if (stage === "description") return project.description.prompt;
  if (stage === "publish") return project.publish.prompt;
  if (stage === "storyboard") {
    return project.scenes
      .map(
        (scene, index) =>
          `PANEL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.storyboardPrompt}`,
      )
      .join("\n\n");
  }
  if (stage === "images") {
    return project.scenes
      .map(
        (scene, index) =>
          `STILL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.imagePrompt}`,
      )
      .join("\n\n");
  }
  return project.scenes
    .map(
      (scene, index) =>
        `CLIP ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.videoPrompt}`,
    )
    .join("\n\n");
}

function recsFor(project: Project, stage: StageId) {
  if (stage === "idea") return project.idea.recommendations;
  if (stage === "titles") return project.titles.recommendations;
  if (stage === "script") return project.script.recommendations;
  if (stage === "voiceover") return project.voiceOver.recommendations;
  if (stage === "thumbnail") return project.thumbnail.recommendations;
  if (stage === "sound") return project.soundDesign.recommendations;
  if (stage === "music") return project.music.recommendations;
  if (stage === "description") return project.description.recommendations;
  if (stage === "publish") return project.publish.recommendations;
  if (stage === "storyboard") return project.storyboardRecommendations;
  if (stage === "images") return project.imageRecommendations;
  return project.videoRecommendations;
}

export function ProjectBoard({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [view, setView] = useState<StageId>("idea");
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = loadProjects().find((item) => item.id === id) ?? null;
    setProject(found);
    setView(found?.currentStage ?? "idea");
    setDraft(found?.idea.raw ?? "");
    setReady(true);
  }, [id]);

  if (!ready) {
    return (
      <div className="studio">
        <p className="empty">Loading board…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="studio">
        <p className="empty">This project is not on this device.</p>
        <Link className="button ghost" href="/studio">
          Back to projects
        </Link>
      </div>
    );
  }

  const currentIndex = stageIndex(project.currentStage);
  const prompt = promptFor(project, view);
  const recommendations = recsFor(project, view);

  function persist(next: Project) {
    upsertProject(next);
    setProject(next);
  }

  function apply(recommendation: string) {
    if (view === "idea") {
      persist({
        ...project,
        idea: {
          ...project.idea,
          prompt: applyRecommendation(project.idea.prompt, recommendation),
        },
      });
      return;
    }
    if (view === "script") {
      persist({
        ...project,
        script: {
          ...project.script,
          prompt: applyRecommendation(project.script.prompt, recommendation),
        },
      });
      return;
    }
    if (view === "titles") {
      persist({
        ...project,
        titles: {
          ...project.titles,
          prompt: applyRecommendation(project.titles.prompt, recommendation),
        },
      });
      return;
    }
    if (view === "thumbnail") {
      persist({
        ...project,
        thumbnail: {
          ...project.thumbnail,
          prompt: applyRecommendation(project.thumbnail.prompt, recommendation),
        },
      });
      return;
    }
    if (view === "description") {
      persist({
        ...project,
        description: {
          ...project.description,
          prompt: applyRecommendation(
            project.description.prompt,
            recommendation,
          ),
        },
      });
      return;
    }
    if (view === "publish") {
      persist({
        ...project,
        publish: {
          ...project.publish,
          prompt: applyRecommendation(project.publish.prompt, recommendation),
        },
      });
      return;
    }
    if (view === "voiceover") {
      persist({
        ...project,
        voiceOver: {
          ...project.voiceOver,
          prompt: applyRecommendation(project.voiceOver.prompt, recommendation),
        },
      });
      return;
    }
    if (view === "sound") {
      persist({
        ...project,
        soundDesign: {
          ...project.soundDesign,
          prompt: applyRecommendation(
            project.soundDesign.prompt,
            recommendation,
          ),
        },
      });
      return;
    }
    if (view === "music") {
      persist({
        ...project,
        music: {
          ...project.music,
          prompt: applyRecommendation(project.music.prompt, recommendation),
        },
      });
      return;
    }
    persist({
      ...project,
      scenes: project.scenes.map((scene) => {
        if (view === "storyboard") {
          return {
            ...scene,
            storyboardPrompt: applyRecommendation(
              scene.storyboardPrompt,
              recommendation,
            ),
          };
        }
        if (view === "images") {
          return {
            ...scene,
            imagePrompt: applyRecommendation(scene.imagePrompt, recommendation),
          };
        }
        return {
          ...scene,
          videoPrompt: applyRecommendation(scene.videoPrompt, recommendation),
        };
      }),
    });
  }

  function regenerate() {
    const rebuilt = buildProject(draft || project.idea.raw);
    persist({
      ...rebuilt,
      id: project.id,
      createdAt: project.createdAt,
      currentStage: project.currentStage,
    });
  }

  function toggleCheck(id: string) {
    persist({
      ...project,
      publish: {
        ...project.publish,
        checks: project.publish.checks.map((check) =>
          check.id === id ? { ...check, done: !check.done } : check,
        ),
      },
    });
  }

  function continueNext() {
    const upcoming = nextStage(project.currentStage);
    if (!upcoming) return;
    persist({ ...project, currentStage: upcoming });
    setView(upcoming);
  }

  return (
    <div className="studio">
      <Link className="meta" href="/studio">
        ← All projects
      </Link>
      <h1 className="board-title">{project.title}</h1>
      <p className="studio-lede">
        Follow every stage in order — story, picture, sound, and the YouTube
        packaging. Each output keeps its prompt and notes to refine the next
        pass.
      </p>

      <div className="stepper">
        {STAGES.map((stage, index) => {
          const done = index < currentIndex;
          const current = stage.id === view;
          return (
            <button
              key={stage.id}
              className={`step${current ? " is-current" : ""}${done ? " is-done" : ""}`}
              type="button"
              onClick={() => setView(stage.id)}
            >
              {stage.number}
              <strong>{stage.label}</strong>
            </button>
          );
        })}
      </div>

      <div className="board">
        <section className="panel">
          <div className="kicker-row">
            <p className="kicker">Output</p>
            <span className="meta">
              {STAGES.find((stage) => stage.id === view)?.label}
            </span>
          </div>

          {view === "idea" && (
            <div className="output">
              <h2>{project.idea.refined}</h2>
              <label className="kicker" htmlFor="refine">
                Refine the idea
              </label>
              <div className="refine">
                <textarea
                  id="refine"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </div>
            </div>
          )}

          {view === "titles" && (
            <pre className="script-output">{project.titles.content}</pre>
          )}

          {view === "script" && (
            <pre className="script-output">{project.script.content}</pre>
          )}

          {view === "voiceover" && (
            <pre className="script-output">{project.voiceOver.content}</pre>
          )}

          {view === "storyboard" && (
            <div className="storyboard-board" aria-label="Storyboard">
              {project.scenes.map((scene, index) => (
                <article className="frame" key={scene.id}>
                  <span className="frame-label">
                    Panel {String(index + 1).padStart(2, "0")}
                    {scene.camera ? ` · ${scene.camera}` : ""}
                  </span>
                  <strong>{scene.title}</strong>
                  <p>{scene.beat}</p>
                </article>
              ))}
            </div>
          )}

          {view === "images" && (
            <div className="scene-grid">
              {project.scenes.map((scene, index) => (
                <article className="scene-card" key={scene.id}>
                  <div className="scene-visual">
                    <span className="kicker">
                      Still {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{scene.title}</h3>
                  </div>
                  <div className="scene-body">
                    <p>{scene.beat}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {view === "thumbnail" && (
            <>
              <div className="scene-grid">
                {["A", "B", "C"].map((letter) => (
                  <article className="scene-card" key={letter}>
                    <div className="scene-visual thumb">
                      <span className="kicker">Thumb {letter}</span>
                      <h3>1280×720</h3>
                    </div>
                  </article>
                ))}
              </div>
              <pre className="script-output">{project.thumbnail.content}</pre>
            </>
          )}

          {view === "videos" && (
            <div className="scene-grid">
              {project.scenes.map((scene, index) => (
                <article className="scene-card" key={scene.id}>
                  <div className="scene-visual clip">
                    <span className="kicker">
                      Clip {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{scene.title}</h3>
                  </div>
                  <div className="scene-body">
                    <p>{scene.beat}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {view === "sound" && (
            <pre className="script-output">{project.soundDesign.content}</pre>
          )}

          {view === "music" && (
            <pre className="script-output">{project.music.content}</pre>
          )}

          {view === "description" && (
            <pre className="script-output">{project.description.content}</pre>
          )}

          {view === "publish" && (
            <div>
              <pre className="script-output">{project.publish.content}</pre>
              <ul className="checklist">
                {project.publish.checks.map((check) => (
                  <li key={check.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={check.done}
                        onChange={() => toggleCheck(check.id)}
                      />
                      <span>{check.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="board-actions">
            <button className="button ghost" type="button" onClick={regenerate}>
              Regenerate from idea
            </button>
            {nextStage(project.currentStage) && view === project.currentStage && (
              <button className="button primary" type="button" onClick={continueNext}>
                Continue to {STAGES[currentIndex + 1]?.label}
              </button>
            )}
          </div>
        </section>

        <aside className="panel">
          <div className="kicker-row">
            <h3>Prompt used</h3>
            <CopyButton text={prompt} />
          </div>
          <pre className="prompt-block">{prompt}</pre>

          <h3 style={{ marginTop: "1.4rem" }}>Recommendations</h3>
          <ul className="recs">
            {recommendations.map((item) => (
              <li key={item}>
                {item}
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => apply(item)}
                >
                  Apply to prompt
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
