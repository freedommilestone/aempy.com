"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FileSlot } from "@/app/studio/FileSlot";
import { getAsset } from "@/lib/assets";
import type { ChatResult } from "@/lib/chat";
import {
  applyBeatRec,
  autoRecommendations,
  beatAtTime,
  beatById,
  beatForRange,
  endOf,
  explodeBeat,
  formatClock,
  parseClockInput,
  patchBeat,
  removeBeat,
  restoreTake,
  rulerMarks,
  savePromptTake,
  setBeatMedia,
  splitIntoBeats,
  timelineDuration,
} from "@/lib/beats";
import { appendChat } from "@/lib/studioState";
import type { Beat, Project } from "@/lib/projects";

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

  if (!url) return <div className="nle-thumb is-empty" />;
  if (kind === "video") {
    return <video className="nle-thumb" src={url} muted playsInline />;
  }
  return <img className="nle-thumb" src={url} alt="" />;
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
  const [range, setRange] = useState<{ start: number; end: number } | null>(
    null,
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ origin: number } | null>(null);
  const selected = beatById(project, project.currentBeatId);
  const selectedIndex = project.beats.findIndex(
    (beat) => beat.id === selected?.id,
  );
  const duration = timelineDuration(project.beats);
  const pxPerSec = Math.max(8, Math.min(24, 960 / duration));
  const boardWidth = Math.max(duration * pxPerSec, 320);
  const viewRange = range
    ? {
        start: Math.min(range.start, range.end),
        end: Math.max(range.start, range.end),
      }
    : selected
      ? { start: selected.startSec, end: endOf(selected) }
      : null;

  function timeAt(clientX: number) {
    const board = boardRef.current;
    if (!board) return 0;
    const rect = board.getBoundingClientRect();
    const x = clientX - rect.left + board.scrollLeft;
    return Math.min(duration, Math.max(0, (x / boardWidth) * duration));
  }

  function selectBeat(beatId: string | null) {
    persist({ ...project, currentBeatId: beatId });
  }

  function step(dir: -1 | 1) {
    if (selectedIndex < 0) {
      const fallback = dir === 1 ? project.beats[0] : project.beats.at(-1);
      if (fallback) {
        setRange({ start: fallback.startSec, end: endOf(fallback) });
        selectBeat(fallback.id);
      }
      return;
    }
    const next = project.beats[selectedIndex + dir];
    if (!next) return;
    setRange({ start: next.startSec, end: endOf(next) });
    persist({ ...project, currentBeatId: next.id });
  }

  function finishSelect(start: number, end: number) {
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const beat =
      hi - lo < 0.12
        ? beatAtTime(project.beats, lo)
        : beatForRange(project.beats, lo, hi);
    if (hi - lo < 0.12 && beat) {
      setRange({ start: beat.startSec, end: endOf(beat) });
    } else {
      setRange({ start: lo, end: Math.max(lo + 0.2, hi) });
    }
    if (beat) persist({ ...project, currentBeatId: beat.id });
  }

  function update(beatId: string, patch: Partial<Beat>) {
    persist(patchBeat(project, beatId, patch));
  }

  useEffect(() => {
    if (!selected) return;
    setRange((current) => {
      if (dragRef.current) return current;
      return { start: selected.startSec, end: endOf(selected) };
    });
  }, [selected?.id, selected?.startSec, selected?.endSec]);

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
          content: `Section ${formatClock(viewRange?.start ?? selected.startSec)}–${formatClock(viewRange?.end ?? endOf(selected))}\n${selected.script}\n\n${selected.vo}`,
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
      {project.beats.length === 0 ? (
        <p className="empty">
          Use the plug in the corner to drop a script, a folder of stills, or
          clips.
        </p>
      ) : (
        <div className="beat-layout">
          <p className="nle-readout" aria-live="polite">
            {viewRange
              ? `${formatClock(viewRange.start)} – ${formatClock(viewRange.end)}`
              : "Drag to select a section"}
          </p>
          <div
            className="nle"
            ref={boardRef}
            tabIndex={0}
            aria-label="Edit timeline"
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
                setRange(null);
                persist({ ...project, currentBeatId: null });
              }
            }}
            onWheel={(event) => {
              if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
              event.currentTarget.scrollLeft += event.deltaY;
            }}
            onPointerDown={(event) => {
              const origin = timeAt(event.clientX);
              dragRef.current = { origin };
              setRange({ start: origin, end: origin });
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!dragRef.current) return;
              setRange({
                start: dragRef.current.origin,
                end: timeAt(event.clientX),
              });
            }}
            onPointerUp={(event) => {
              if (!dragRef.current) return;
              const origin = dragRef.current.origin;
              dragRef.current = null;
              finishSelect(origin, timeAt(event.clientX));
            }}
          >
            <div className="nle-board" style={{ width: boardWidth }}>
              <div className="nle-ruler">
                {rulerMarks(duration).map((mark) => (
                  <span
                    key={mark}
                    className="nle-mark"
                    style={{ left: `${(mark / duration) * 100}%` }}
                  >
                    {formatClock(mark)}
                  </span>
                ))}
              </div>
              <div className="nle-track">
                {project.beats.map((beat) => {
                  const start = beat.startSec;
                  const finish = endOf(beat);
                  return (
                    <div
                      key={beat.id}
                      className={`nle-clip${beat.id === selected?.id ? " is-current" : ""}`}
                      style={{
                        left: `${(start / duration) * 100}%`,
                        width: `${((finish - start) / duration) * 100}%`,
                      }}
                    >
                      <FrameThumb
                        stillId={beat.stillFileId}
                        clipId={beat.clipFileId}
                      />
                      <span className="nle-clip-label">
                        {formatClock(start)}
                      </span>
                    </div>
                  );
                })}
                {viewRange ? (
                  <div
                    className="nle-select"
                    style={{
                      left: `${(viewRange.start / duration) * 100}%`,
                      width: `${((viewRange.end - viewRange.start) / duration) * 100}%`,
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {selected ? (
            <div className="beat-detail">
              <div className="kicker-row">
                <p className="kicker">
                  {viewRange
                    ? `${formatClock(viewRange.start)} – ${formatClock(viewRange.end)}`
                    : `Section ${formatClock(selected.startSec)}`}
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

              <div className="nle-times">
                <label className="kicker" htmlFor="beat-in">
                  In
                </label>
                <input
                  id="beat-in"
                  className="track-label-input"
                  value={formatClock(viewRange?.start ?? selected.startSec)}
                  onChange={(event) => {
                    const next = parseClockInput(event.target.value);
                    if (next == null) return;
                    setRange({
                      start: next,
                      end: viewRange?.end ?? endOf(selected),
                    });
                    update(selected.id, { startSec: next });
                  }}
                  aria-label="Section in point"
                />
                <label className="kicker" htmlFor="beat-out">
                  Out
                </label>
                <input
                  id="beat-out"
                  className="track-label-input"
                  value={formatClock(viewRange?.end ?? endOf(selected))}
                  onChange={(event) => {
                    const next = parseClockInput(event.target.value);
                    if (next == null) return;
                    setRange({
                      start: viewRange?.start ?? selected.startSec,
                      end: next,
                    });
                    update(selected.id, { endSec: next });
                  }}
                  aria-label="Section out point"
                />
              </div>

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
