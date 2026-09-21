"use client";

import { useEffect, useRef, useState } from "react";
import { getAsset } from "@/lib/assets";
import {
  beatAtTime,
  beatById,
  beatForRange,
  endOf,
  formatClock,
  removeBeat,
  rulerMarks,
  timelineDuration,
} from "@/lib/beats";
import type { Project } from "@/lib/projects";

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

  useEffect(() => {
    if (!selected) return;
    setRange((current) => {
      if (dragRef.current) return current;
      return { start: selected.startSec, end: endOf(selected) };
    });
  }, [selected?.id, selected?.startSec, selected?.endSec]);

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
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
