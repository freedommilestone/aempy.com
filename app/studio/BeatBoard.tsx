"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FileSlot } from "@/app/studio/FileSlot";
import { getAsset } from "@/lib/assets";
import type { ChatResult } from "@/lib/chat";
import {
  addBeat,
  applyBeatRec,
  autoRecommendations,
  beatById,
  explodeBeat,
  formatClock,
  gradeBeat,
  patchBeat,
  removeBeat,
  restoreTake,
  savePromptTake,
  setBeatMedia,
  splitIntoBeats,
  weakScore,
} from "@/lib/beats";
import { appendChat } from "@/lib/studioState";
import type { Beat, GradeKey, Project } from "@/lib/projects";

function FrameThumb({ stillId, clipId }: { stillId?: string; clipId?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<"image" | "video">("image");

  useEffect(() => {
    const assetId = stillId || clipId;
    let revoked: string | null = null;
    let cancelled = false;
    if (!assetId) {
      setUrl(null);
      return;
    }
    getAsset(assetId).then((blob) => {
      if (cancelled || !blob) return;
      revoked = URL.createObjectURL(blob);
      setKind(stillId ? "image" : "video");
      setUrl(revoked);
    });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [stillId, clipId]);

  if (!url) return <div className="beat-item-frame is-empty" />;
  if (kind === "video") {
    return <video className="beat-item-frame" src={url} muted playsInline />;
  }
  return <img className="beat-item-frame" src={url} alt="" />;
}

function GradeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grade-row">
      <span>{label}</span>
      <div>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            className={`grade-dot${value === score ? " is-on" : ""}`}
            type="button"
            onClick={() => onChange(score)}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BeatBoard({
  project,
  persist,
}: {
  project: Project;
  persist: (next: Project) => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);
  const selected = beatById(project, project.currentBeatId);
  const selectedIndex = project.beats.findIndex(
    (beat) => beat.id === selected?.id,
  );

  function select(beatId: string) {
    persist({
      ...project,
      currentBeatId: project.currentBeatId === beatId ? null : beatId,
    });
  }

  function step(dir: -1 | 1) {
    if (selectedIndex < 0) {
      const fallback = dir === 1 ? project.beats[0] : project.beats.at(-1);
      if (fallback) persist({ ...project, currentBeatId: fallback.id });
      return;
    }
    const next = project.beats[selectedIndex + dir];
    if (next) persist({ ...project, currentBeatId: next.id });
  }

  function update(beatId: string, patch: Partial<Beat>) {
    persist(patchBeat(project, beatId, patch));
  }

  useEffect(() => {
    const node = document.getElementById(`beat-frame-${project.currentBeatId}`);
    node?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [project.currentBeatId]);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const scroller = event.currentTarget as HTMLDivElement | null;
      if (!scroller) return;
      scroller.scrollLeft += event.deltaY;
      event.preventDefault();
    }
    reel.addEventListener("wheel", onWheel, { passive: false });
    return () => reel.removeEventListener("wheel", onWheel);
  }, []);

  async function sendToBeat(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selected || busy) return;
    setBusy(true);
    setDraft("");
    const withUser = appendChat(project, {
      role: "user",
      text,
      trackId: "",
      beatId: selected.id,
    });
    persist(withUser);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: selected.title,
          prompt: selected.prompt,
          content: `${selected.script}\n\n${selected.vo}`,
          message: text,
        }),
      });
      const data = (await response.json()) as ChatResult;
      let next = savePromptTake(withUser, selected.id);
      next = patchBeat(next, selected.id, {
        prompt: data.prompt,
        script: selected.script,
      });
      next = appendChat(next, {
        role: "assistant",
        text: data.reply,
        trackId: "",
        beatId: selected.id,
      });
      persist(next);
    } catch {
      persist(
        appendChat(withUser, {
          role: "assistant",
          text: "Could not reach the agent. Your note is still on this timestamp.",
          trackId: "",
          beatId: selected.id,
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  const chat = project.chat.filter((message) => message.beatId === selected?.id);
  const recs = selected ? autoRecommendations(selected) : [];

  return (
    <section className="beat-studio">
      <div className="kicker-row">
        <p className="kicker">Timeline</p>
        <div className="row-actions">
          <button
            className="button ghost"
            type="button"
            onClick={() => persist(addBeat(project))}
          >
            Add timestamp
          </button>
        </div>
      </div>
      <p className="meta">
        Scrub left to right. Click a timestamp to grade that section or restage
        it with a prompt.
      </p>

      {project.beats.length === 0 ? (
        <p className="empty">
          Use the plug in the corner to drop a script, a folder of stills, or
          clips. Add a timestamp if you want to grade a section first.
        </p>
      ) : (
        <div className="beat-layout">
          <div className="beat-transport">
            <button
              className="button ghost"
              type="button"
              onClick={() => step(-1)}
              disabled={project.beats.length === 0}
            >
              Prev
            </button>
            <span className="meta">
              {selected
                ? formatClock(selected.startSec)
                : "Pick a timestamp"}
            </span>
            <button
              className="button ghost"
              type="button"
              onClick={() => step(1)}
              disabled={project.beats.length === 0}
            >
              Next
            </button>
          </div>
          <div
            className="beat-reel"
            role="list"
            ref={reelRef}
            tabIndex={0}
            aria-label="Video timestamps"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                step(-1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                step(1);
              }
              if (event.key === "Escape") {
                persist({ ...project, currentBeatId: null });
              }
            }}
          >
            {project.beats.map((beat) => {
              const score = weakScore(beat);
              return (
                <button
                  key={beat.id}
                  id={`beat-frame-${beat.id}`}
                  className={`beat-item${beat.id === selected?.id ? " is-current" : ""}${score != null && score <= 2.5 ? " is-weak" : ""}`}
                  type="button"
                  role="listitem"
                  onClick={() => select(beat.id)}
                >
                  <FrameThumb
                    stillId={beat.stillFileId}
                    clipId={beat.clipFileId}
                  />
                  <span className="beat-item-meta">
                    <strong className="beat-clock">
                      {formatClock(beat.startSec)}
                    </strong>
                    {score != null ? (
                      <span className="meta">{score.toFixed(1)}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          {selected ? (
            <div className="beat-detail">
              <div className="kicker-row">
                <p className="kicker">
                  Timestamp {formatClock(selected.startSec)}
                </p>
                <div className="row-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() =>
                      persist({ ...project, currentBeatId: null })
                    }
                  >
                    Close
                  </button>
                  <button
                    className="button danger"
                    type="button"
                    onClick={() => persist(removeBeat(project, selected.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <label className="kicker" htmlFor="beat-clock">
                Start
              </label>
              <input
                id="beat-clock"
                className="track-label-input"
                value={formatClock(selected.startSec)}
                onChange={(event) => {
                  const match = event.target.value.match(/(\d{1,2}):(\d{2})/);
                  if (!match) return;
                  update(selected.id, {
                    startSec: Number(match[1]) * 60 + Number(match[2]),
                  });
                }}
                aria-label="Timestamp start"
              />

              <h3>Grade this section</h3>
              {(["script", "vo", "still", "clip"] as GradeKey[]).map((key) => (
                <GradeRow
                  key={key}
                  label={key === "vo" ? "Voice over" : key}
                  value={selected.grades[key]}
                  onChange={(value) =>
                    persist(gradeBeat(project, selected.id, key, value))
                  }
                />
              ))}

              <div className="kicker-row">
                <label className="kicker" htmlFor="beat-prompt">
                  Prompt
                </label>
                <button
                  className="button ghost"
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(selected.prompt);
                  }}
                >
                  Copy
                </button>
              </div>
              <textarea
                id="beat-prompt"
                className="prompt-editor"
                value={selected.prompt}
                onChange={(event) =>
                  update(selected.id, { prompt: event.target.value })
                }
                placeholder="Restage this timestamp with a prompt…"
              />

              <h3>Auto recommendations</h3>
              <ul className="recs">
                {recs.map((item) => (
                  <li key={item}>
                    {item}
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() =>
                        persist(applyBeatRec(project, selected.id, item))
                      }
                    >
                      Use prompt
                    </button>
                  </li>
                ))}
              </ul>

              <h3>Ask the agent</h3>
              <div className="chat-log">
                {chat.length === 0 ? (
                  <p className="empty">
                    Describe the change. The agent rewrites the prompt for this
                    timestamp.
                  </p>
                ) : (
                  chat.map((message) => (
                    <article
                      className={`chat-msg is-${message.role}`}
                      key={message.id}
                    >
                      <span className="kicker">
                        {message.role === "user" ? "You" : "Studio"}
                      </span>
                      <p>{message.text}</p>
                    </article>
                  ))
                )}
              </div>
              <form className="chat-form" onSubmit={sendToBeat}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Colder diner, slower push-in, face readable on a phone…"
                />
                <button className="button primary" type="submit" disabled={busy}>
                  {busy ? "Writing prompt…" : "Rewrite prompt with AI"}
                </button>
              </form>

              <details className="beat-more">
                <summary>Script, still, clip, takes</summary>
                <label className="kicker" htmlFor="beat-title">
                  Label
                </label>
                <input
                  id="beat-title"
                  className="track-label-input"
                  value={selected.title}
                  onChange={(event) =>
                    update(selected.id, { title: event.target.value })
                  }
                />
                <div className="beat-media">
                  <FileSlot
                    label="Scene still"
                    accept="image/*"
                    kind="image"
                    assetId={selected.stillFileId}
                    onAssigned={(nextId) =>
                      persist(
                        setBeatMedia(project, selected.id, "still", nextId),
                      )
                    }
                  />
                  <FileSlot
                    label="Scene clip"
                    accept="video/*"
                    kind="video"
                    assetId={selected.clipFileId}
                    onAssigned={(nextId) =>
                      persist(
                        setBeatMedia(project, selected.id, "clip", nextId),
                      )
                    }
                  />
                </div>
                <label className="kicker" htmlFor="beat-script">
                  Script
                </label>
                <textarea
                  id="beat-script"
                  className="result-editor"
                  value={selected.script}
                  onChange={(event) =>
                    update(selected.id, { script: event.target.value })
                  }
                />
                <label className="kicker" htmlFor="beat-vo">
                  Voice over
                </label>
                <textarea
                  id="beat-vo"
                  className="brief-editor"
                  value={selected.vo}
                  onChange={(event) =>
                    update(selected.id, { vo: event.target.value })
                  }
                />
                {splitIntoBeats(selected.script).length > 1 ? (
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => persist(explodeBeat(project, selected.id))}
                  >
                    Split script into timestamps
                  </button>
                ) : null}
                {(selected.stillTakes.length > 0 ||
                  selected.clipTakes.length > 0) && (
                  <div className="version-list">
                    <p className="kicker">Takes</p>
                    <ul>
                      {[...selected.stillTakes, ...selected.clipTakes]
                        .sort((a, b) => (a.at < b.at ? 1 : -1))
                        .map((take) => (
                          <li key={take.id}>
                            <span>
                              {take.kind} · {new Date(take.at).toLocaleString()}{" "}
                              · {take.prompt.slice(0, 60) || "No prompt"}
                            </span>
                            <button
                              className="button ghost"
                              type="button"
                              onClick={() =>
                                persist(
                                  restoreTake(project, selected.id, take.id),
                                )
                              }
                            >
                              Restore
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </details>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
