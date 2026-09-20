"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { FileSlot } from "@/app/studio/FileSlot";
import { downloadProjectBackup } from "@/lib/backup";
import type { ChatResult } from "@/lib/chat";
import {
  TRACK_KINDS,
  addTrack,
  addYoutubeSet,
  moveTrack,
  patchTrack,
  removeTrack,
  type Project,
  type TrackKind,
  upsertProject,
  loadProjects,
} from "@/lib/projects";
import {
  addScene,
  appendChat,
  captureVersion,
  patchScene,
  removeScene,
  restoreVersion,
  trackById,
  withPromptRefinement,
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

function assignMap(map: Record<string, string>, key: string, nextId?: string) {
  const next = { ...map };
  if (nextId) next[key] = nextId;
  else delete next[key];
  return next;
}

export function ProjectBoard({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [addKind, setAddKind] = useState<TrackKind>("title");
  const [chatDraft, setChatDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = loadProjects().find((item) => item.id === id) ?? null;
    setProject(found);
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
  const view = trackById(active, active.currentTrackId);

  function persist(next: Project) {
    upsertProject(next);
    setProject(next);
  }

  function selectTrack(trackId: string) {
    persist({ ...active, currentTrackId: trackId });
  }

  function saveVersion() {
    if (!view) return;
    persist(captureVersion(active, view.id));
    setNotice("Version saved for this track.");
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    const text = chatDraft.trim();
    if (!text || chatBusy || !view) return;
    setChatBusy(true);
    setChatDraft("");
    const withUser = appendChat(active, {
      role: "user",
      text,
      trackId: view.id,
    });
    persist(withUser);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: view.label,
          prompt: view.prompt,
          content: view.content,
          message: text,
          history: withUser.chat.slice(-8).map((item) => ({
            role: item.role,
            text: item.text,
          })),
        }),
      });
      const data = (await response.json()) as ChatResult;
      let next = patchTrack(withUser, view.id, {
        prompt: data.prompt,
        content: data.content,
      });
      next = captureVersion(next, view.id);
      next = appendChat(next, {
        role: "assistant",
        text: data.reply,
        trackId: view.id,
      });
      persist(next);
    } catch {
      persist(
        appendChat(withUser, {
          role: "assistant",
          text: "Could not reach chat. Your message is still logged.",
          trackId: view.id,
        }),
      );
    } finally {
      setChatBusy(false);
    }
  }

  const visual = view && ["storyboard", "images", "videos"].includes(view.kind);
  const audio = view && ["voiceover", "sound", "music"].includes(view.kind);

  return (
    <div className="studio">
      <div className="kicker-row">
        <Link className="meta" href="/studio">
          ← New project
        </Link>
        <button
          className="button ghost"
          type="button"
          onClick={async () => {
            await downloadProjectBackup(active);
            setNotice(
              "Backup downloaded. Import it from the studio home on another device.",
            );
          }}
        >
          Download backup
        </button>
      </div>
      <input
        className="board-title-input"
        value={active.title}
        onChange={(event) => persist({ ...active, title: event.target.value })}
        aria-label="Project title"
      />
      <label className="kicker" htmlFor="brief">
        Brief
      </label>
      <textarea
        id="brief"
        className="brief-editor"
        value={active.brief}
        onChange={(event) => persist({ ...active, brief: event.target.value })}
        placeholder="What is this video? Optional — used when you add a YouTube set or a new track."
      />
      <p className="studio-lede">
        Add only the tracks this video needs. Chat, versions, and uploads stay
        on the track you have open.
      </p>
      {notice ? <p className="notice">{notice}</p> : null}

      <div className="track-bar">
        {active.tracks.map((track, index) => (
          <div
            key={track.id}
            className={`track-chip${track.id === view?.id ? " is-current" : ""}`}
          >
            <button type="button" onClick={() => selectTrack(track.id)}>
              <span className="meta">{String(index + 1).padStart(2, "0")}</span>
              <strong>{track.label}</strong>
            </button>
          </div>
        ))}
      </div>

      <div className="add-track">
        <select
          value={addKind}
          onChange={(event) => setAddKind(event.target.value as TrackKind)}
          aria-label="Track type"
        >
          {TRACK_KINDS.map((kind) => (
            <option key={kind.id} value={kind.id}>
              {kind.label}
            </option>
          ))}
        </select>
        <button
          className="button primary"
          type="button"
          onClick={() => persist(addTrack(active, addKind))}
        >
          Add track
        </button>
        <button
          className="button ghost"
          type="button"
          onClick={() => persist(addYoutubeSet(active))}
        >
          Add YouTube set
        </button>
      </div>

      {active.tracks.length === 0 ? (
        <p className="empty">
          Nothing on this board yet. Add a title, a thumbnail, notes — whatever
          you actually need — or drop in the full YouTube set.
        </p>
      ) : null}

      {view ? (
        <div className="board">
          <section className="panel">
            <div className="kicker-row">
              <input
                className="track-label-input"
                value={view.label}
                onChange={(event) =>
                  persist(
                    patchTrack(active, view.id, { label: event.target.value }),
                  )
                }
                aria-label="Track name"
              />
              <div className="row-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => persist(moveTrack(active, view.id, -1))}
                >
                  Up
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => persist(moveTrack(active, view.id, 1))}
                >
                  Down
                </button>
                <button className="button ghost" type="button" onClick={saveVersion}>
                  Save version
                </button>
                <button
                  className="button danger"
                  type="button"
                  onClick={() => persist(removeTrack(active, view.id))}
                >
                  Remove
                </button>
              </div>
            </div>

            {view.kind === "thumbnail" && (
              <div className="scene-grid">
                {["A", "B", "C"].map((letter) => (
                  <article className="scene-card" key={letter}>
                    <FileSlot
                      label={`Thumb ${letter} · 1280×720`}
                      accept="image/*"
                      kind="image"
                      assetId={view.thumbs[letter]}
                      onAssigned={(nextId) =>
                        persist(
                          patchTrack(active, view.id, {
                            thumbs: assignMap(view.thumbs, letter, nextId),
                          }),
                        )
                      }
                    />
                  </article>
                ))}
              </div>
            )}

            {audio && (
              <FileSlot
                label="Audio file"
                accept="audio/*"
                kind="audio"
                assetId={view.audioId}
                onAssigned={(nextId) =>
                  persist(patchTrack(active, view.id, { audioId: nextId }))
                }
              />
            )}

            {view.kind === "files" && (
              <div className="scene-grid">
                {view.files.map((assetId, index) => (
                  <FileSlot
                    key={assetId}
                    label={`File ${index + 1}`}
                    accept="*/*"
                    kind="image"
                    assetId={assetId}
                    onAssigned={(nextId) =>
                      persist(
                        patchTrack(active, view.id, {
                          files: nextId
                            ? view.files.map((id) => (id === assetId ? nextId : id))
                            : view.files.filter((id) => id !== assetId),
                        }),
                      )
                    }
                  />
                ))}
                <FileSlot
                  label="Add file"
                  accept="*/*"
                  kind="image"
                  onAssigned={(nextId) => {
                    if (!nextId) return;
                    persist(
                      patchTrack(active, view.id, {
                        files: [...view.files, nextId],
                      }),
                    );
                  }}
                />
              </div>
            )}

            {visual && (
              <div>
                {view.kind === "storyboard" ? (
                  <div className="storyboard-board" aria-label="Storyboard">
                    {view.scenes.map((scene, index) => (
                      <article className="frame" key={scene.id}>
                        <span className="frame-label">
                          Panel {String(index + 1).padStart(2, "0")}
                          {scene.camera ? ` · ${scene.camera}` : ""}
                        </span>
                        <input
                          value={scene.title}
                          onChange={(event) =>
                            persist(
                              patchScene(active, view.id, scene.id, {
                                title: event.target.value,
                              }),
                            )
                          }
                        />
                        <textarea
                          value={scene.beat}
                          onChange={(event) =>
                            persist(
                              patchScene(active, view.id, scene.id, {
                                beat: event.target.value,
                              }),
                            )
                          }
                        />
                        <button
                          className="button ghost"
                          type="button"
                          onClick={() =>
                            persist(removeScene(active, view.id, scene.id))
                          }
                        >
                          Remove beat
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="scene-grid">
                    {view.scenes.map((scene, index) => (
                      <article className="scene-card" key={scene.id}>
                        <FileSlot
                          label={`${view.kind === "images" ? "Still" : "Clip"} ${String(index + 1).padStart(2, "0")}`}
                          accept={view.kind === "images" ? "image/*" : "video/*"}
                          kind={view.kind === "images" ? "image" : "video"}
                          assetId={scene.fileId}
                          onAssigned={(nextId) =>
                            persist(
                              patchScene(active, view.id, scene.id, {
                                fileId: nextId,
                              }),
                            )
                          }
                        />
                        <div className="scene-body">
                          <input
                            value={scene.title}
                            onChange={(event) =>
                              persist(
                                patchScene(active, view.id, scene.id, {
                                  title: event.target.value,
                                }),
                              )
                            }
                          />
                          <textarea
                            value={scene.beat}
                            onChange={(event) =>
                              persist(
                                patchScene(active, view.id, scene.id, {
                                  beat: event.target.value,
                                }),
                              )
                            }
                          />
                          <button
                            className="button ghost"
                            type="button"
                            onClick={() =>
                              persist(removeScene(active, view.id, scene.id))
                            }
                          >
                            Remove beat
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => persist(addScene(active, view.id))}
                >
                  Add beat
                </button>
              </div>
            )}

            <label className="kicker" htmlFor="track-result">
              Result
            </label>
            <textarea
              id="track-result"
              className="result-editor"
              value={view.content}
              onChange={(event) =>
                persist(
                  patchTrack(active, view.id, { content: event.target.value }),
                )
              }
            />

            {view.kind === "publish" && (
              <ul className="checklist">
                {view.checks.map((check) => (
                  <li key={check.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={check.done}
                        onChange={() =>
                          persist(
                            patchTrack(active, view.id, {
                              checks: view.checks.map((item) =>
                                item.id === check.id
                                  ? { ...item, done: !item.done }
                                  : item,
                              ),
                            }),
                          )
                        }
                      />
                      <span>{check.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {view.history.length > 0 && (
              <div className="version-list">
                <p className="kicker">Versions</p>
                <ul>
                  {view.history.map((version) => (
                    <li key={version.id}>
                      <span>
                        {new Date(version.at).toLocaleString()} ·{" "}
                        {version.content.slice(0, 72) || "Empty result"}
                      </span>
                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          persist(restoreVersion(active, view.id, version.id));
                          setNotice("Restored that version.");
                        }}
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <aside className="panel">
            <div className="kicker-row">
              <h3>Prompt</h3>
              <CopyButton text={view.prompt} />
            </div>
            <textarea
              className="prompt-editor"
              value={view.prompt}
              onChange={(event) =>
                persist(
                  patchTrack(active, view.id, { prompt: event.target.value }),
                )
              }
            />

            {view.recommendations.length > 0 && (
              <>
                <h3 style={{ marginTop: "1.4rem" }}>Recommendations</h3>
                <ul className="recs">
                  {view.recommendations.map((item) => (
                    <li key={item}>
                      {item}
                      <button
                        className="button ghost"
                        type="button"
                        onClick={() =>
                          persist(withPromptRefinement(active, view.id, item))
                        }
                      >
                        Apply to prompt
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 style={{ marginTop: "1.4rem" }}>Project chat</h3>
            <p className="meta">Writes into {view.label}.</p>
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
                      {trackById(active, message.trackId)?.label ?? "Track"}
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
                placeholder="Ask for a tighter hook, a new title pack, a VO tone…"
              />
              <button className="button primary" type="submit" disabled={chatBusy}>
                {chatBusy ? "Writing…" : "Send to track"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
