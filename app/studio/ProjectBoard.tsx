"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { FileSlot } from "@/app/studio/FileSlot";
import { downloadProjectBackup } from "@/lib/backup";
import type { ChatResult } from "@/lib/chat";
import {
  STAGES,
  buildProject,
  loadProjects,
  nextStage,
  stageIndex,
  upsertProject,
  type Project,
  type StageId,
} from "@/lib/projects";
import {
  appendChat,
  captureVersion,
  recsFor,
  remapFiles,
  restoreVersion,
  stageContent,
  stageLabel,
  stagePrompt,
  withPromptRefinement,
  withSceneBeat,
  withStageContent,
  withStagePrompt,
} from "@/lib/studioState";

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

export function ProjectBoard({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [view, setView] = useState<StageId>("idea");
  const [draft, setDraft] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [notice, setNotice] = useState("");
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

  const active: Project = project;
  const currentIndex = stageIndex(active.currentStage);
  const prompt = stagePrompt(active, view);
  const recommendations = recsFor(active, view);
  const versions = active.history[view] ?? [];
  const output = stageContent(active, view);

  function persist(next: Project) {
    upsertProject(next);
    setProject(next);
  }

  function patchFiles(patch: (files: Project["files"]) => Project["files"]) {
    persist({ ...active, files: patch(active.files) });
  }

  function assignMap(map: Record<string, string>, key: string, nextId?: string) {
    const next = { ...map };
    if (nextId) next[key] = nextId;
    else delete next[key];
    return next;
  }

  function saveVersion() {
    persist(captureVersion(active, view));
    setNotice("Version saved for this stage.");
  }

  function regenerate() {
    const rebuilt = buildProject(draft || active.idea.raw);
    persist({
      ...rebuilt,
      id: active.id,
      createdAt: active.createdAt,
      currentStage: active.currentStage,
      chat: active.chat,
      history: active.history,
      notes: active.notes,
      files: remapFiles(active, rebuilt),
    });
  }

  function toggleCheck(checkId: string) {
    persist({
      ...active,
      publish: {
        ...active.publish,
        checks: active.publish.checks.map((check) =>
          check.id === checkId ? { ...check, done: !check.done } : check,
        ),
      },
    });
  }

  function continueNext() {
    const upcoming = nextStage(active.currentStage);
    if (!upcoming) return;
    persist({ ...active, currentStage: upcoming });
    setView(upcoming);
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    const text = chatDraft.trim();
    if (!text || chatBusy) return;
    setChatBusy(true);
    setChatDraft("");
    const withUser = appendChat(active, {
      role: "user",
      text,
      stage: view,
    });
    persist(withUser);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: view,
          prompt: stagePrompt(withUser, view),
          content:
            view === "storyboard" || view === "images" || view === "videos"
              ? (withUser.notes[view] ?? "")
              : stageContent(withUser, view),
          message: text,
          history: withUser.chat.slice(-8).map((item) => ({
            role: item.role,
            text: item.text,
          })),
        }),
      });
      const data = (await response.json()) as ChatResult;
      let next = withStagePrompt(withUser, view, data.prompt);
      next = withStageContent(next, view, data.content);
      next = captureVersion(next, view);
      next = appendChat(next, {
        role: "assistant",
        text: data.reply,
        stage: view,
      });
      persist(next);
      if (view === "idea") setDraft(next.idea.raw);
    } catch {
      persist(
        appendChat(withUser, {
          role: "assistant",
          text: "Could not reach chat. Your message is still logged.",
          stage: view,
        }),
      );
    } finally {
      setChatBusy(false);
    }
  }

  async function exportProject() {
    await downloadProjectBackup(active);
    setNotice(
      "Backup downloaded. Put this file on Drive or another device, then import it from the studio home.",
    );
  }

  const textStage =
    view === "titles" ||
    view === "script" ||
    view === "voiceover" ||
    view === "sound" ||
    view === "music" ||
    view === "description" ||
    view === "publish" ||
    view === "thumbnail";

  return (
    <div className="studio">
      <div className="kicker-row">
        <Link className="meta" href="/studio">
          ← New project
        </Link>
        <button className="button ghost" type="button" onClick={exportProject}>
          Download backup
        </button>
      </div>
      <h1 className="board-title">{project.title}</h1>
      <p className="studio-lede">
        Edit the result, save versions of prompt plus output, and use project
        chat to write into the stage you have open. Upload stills, VO, and
        thumbnails on those stages. Download a backup to move the project.
      </p>
      {notice ? <p className="notice">{notice}</p> : null}

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
            <button className="button ghost" type="button" onClick={saveVersion}>
              Save version
            </button>
          </div>

          {view === "idea" && (
            <div className="output">
              <label className="kicker" htmlFor="idea-result">
                Episode concept
              </label>
              <textarea
                id="idea-result"
                className="result-editor"
                value={active.idea.refined}
                onChange={(event) =>
                  persist(
                    withStageContent(active, "idea", event.target.value),
                  )
                }
              />
              <label className="kicker" htmlFor="refine">
                Source idea
              </label>
              <div className="refine">
                <textarea
                  id="refine"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    persist({
                      ...active,
                      idea: { ...active.idea, raw: event.target.value },
                    });
                  }}
                />
              </div>
            </div>
          )}

          {textStage && (
            <div className="output">
              {view === "thumbnail" && (
                <div className="scene-grid">
                  {["A", "B", "C"].map((letter) => (
                    <article className="scene-card" key={letter}>
                      <FileSlot
                        label={`Thumb ${letter} · 1280×720`}
                        accept="image/*"
                        kind="image"
                        assetId={active.files.thumbs[letter]}
                        onAssigned={(nextId) =>
                          patchFiles((files) => ({
                            ...files,
                            thumbs: assignMap(files.thumbs, letter, nextId),
                          }))
                        }
                      />
                    </article>
                  ))}
                </div>
              )}
              {view === "voiceover" && (
                <FileSlot
                  label="Voice over take"
                  accept="audio/*"
                  kind="audio"
                  assetId={active.files.voiceOver}
                  onAssigned={(nextId) =>
                    patchFiles((files) => ({ ...files, voiceOver: nextId }))
                  }
                />
              )}
              <label className="kicker" htmlFor="stage-result">
                Result
              </label>
              <textarea
                id="stage-result"
                className="result-editor"
                value={output}
                onChange={(event) =>
                  persist(withStageContent(active, view, event.target.value))
                }
              />
              {view === "publish" && (
                <ul className="checklist">
                  {active.publish.checks.map((check) => (
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
              )}
            </div>
          )}

          {(view === "storyboard" ||
            view === "images" ||
            view === "videos") && (
            <div>
              {view === "storyboard" ? (
                <div className="storyboard-board" aria-label="Storyboard">
                  {active.scenes.map((scene, index) => (
                    <article className="frame" key={scene.id}>
                      <span className="frame-label">
                        Panel {String(index + 1).padStart(2, "0")}
                        {scene.camera ? ` · ${scene.camera}` : ""}
                      </span>
                      <strong>{scene.title}</strong>
                      <textarea
                        value={scene.beat}
                        onChange={(event) =>
                          persist(
                            withSceneBeat(active, scene.id, event.target.value),
                          )
                        }
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="scene-grid">
                  {active.scenes.map((scene, index) => (
                    <article className="scene-card" key={scene.id}>
                      <FileSlot
                        label={`${view === "images" ? "Still" : "Clip"} ${String(index + 1).padStart(2, "0")} · ${scene.title}`}
                        accept={view === "images" ? "image/*" : "video/*"}
                        kind={view === "images" ? "image" : "video"}
                        assetId={
                          view === "images"
                            ? active.files.stills[scene.id]
                            : active.files.clips[scene.id]
                        }
                        onAssigned={(nextId) =>
                          patchFiles((files) => ({
                            ...files,
                            stills:
                              view === "images"
                                ? assignMap(files.stills, scene.id, nextId)
                                : files.stills,
                            clips:
                              view === "videos"
                                ? assignMap(files.clips, scene.id, nextId)
                                : files.clips,
                          }))
                        }
                      />
                      <div className="scene-body">
                        <textarea
                          value={scene.beat}
                          onChange={(event) =>
                            persist(
                              withSceneBeat(
                                active,
                                scene.id,
                                event.target.value,
                              ),
                            )
                          }
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <label className="kicker" htmlFor="scene-notes">
                Stage notes
              </label>
              <textarea
                id="scene-notes"
                className="result-editor"
                value={active.notes[view] ?? ""}
                onChange={(event) =>
                  persist({
                    ...active,
                    notes: { ...active.notes, [view]: event.target.value },
                  })
                }
              />
            </div>
          )}

          {versions.length > 0 && (
            <div className="version-list">
              <p className="kicker">Versions</p>
              <ul>
                {versions.map((version) => (
                  <li key={version.id}>
                    <span>
                      {new Date(version.at).toLocaleString()} ·{" "}
                      {version.content.slice(0, 72) || "Empty result"}
                    </span>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => {
                        persist(restoreVersion(active, view, version.id));
                        setNotice("Restored that version onto the board.");
                      }}
                    >
                      Restore
                    </button>
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
          <textarea
            className="prompt-editor"
            value={prompt}
            onChange={(event) =>
              persist(withStagePrompt(active, view, event.target.value))
            }
          />

          <h3 style={{ marginTop: "1.4rem" }}>Recommendations</h3>
          <ul className="recs">
            {recommendations.map((item) => (
              <li key={item}>
                {item}
                <button
                  className="button ghost"
                  type="button"
                  onClick={() =>
                    persist(withPromptRefinement(active, view, item))
                  }
                >
                  Apply to prompt
                </button>
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: "1.4rem" }}>Project chat</h3>
          <p className="meta">
            Writes into {stageLabel(view)}. Conversation stays on this project.
          </p>
          <div className="chat-log">
            {active.chat.length === 0 ? (
              <p className="empty">No messages yet.</p>
            ) : (
              active.chat.map((message) => (
                <article
                  className={`chat-msg is-${message.role}`}
                  key={message.id}
                >
                  <span className="kicker">
                    {message.role === "user" ? "You" : "Studio"} ·{" "}
                    {stageLabel(message.stage)}
                  </span>
                  <p>{message.text}</p>
                </article>
              ))
            )}
          </div>
          <form className="chat-form" onSubmit={sendChat}>
            <textarea
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder="Tighten the hook, change the VO tone, ask for a new title pack…"
            />
            <button className="button primary" type="submit" disabled={chatBusy}>
              {chatBusy ? "Writing…" : "Send to stage"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
