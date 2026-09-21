"use client";

import { FormEvent, useState } from "react";
import { FileSlot } from "@/app/studio/FileSlot";
import type { ChatResult } from "@/lib/chat";
import {
  addBeat,
  applyBeatRec,
  beatById,
  explodeBeat,
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
  const selected = beatById(project, project.currentBeatId);

  function select(beatId: string) {
    persist({ ...project, currentBeatId: beatId });
  }

  function update(beatId: string, patch: Partial<Beat>) {
    persist(patchBeat(project, beatId, patch));
  }

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
          text: "Could not reach the agent. Your note is still on this beat.",
          trackId: "",
          beatId: selected.id,
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  const chat = project.chat.filter((message) => message.beatId === selected?.id);

  return (
    <section className="beat-studio">
      <div className="kicker-row">
        <p className="kicker">Beats</p>
        <div className="row-actions">
          <button
            className="button ghost"
            type="button"
            onClick={() => persist(addBeat(project))}
          >
            Add beat
          </button>
        </div>
      </div>
      <p className="meta">
        Click a beat to see its still, clip, and prompt. Grade it. Type a new
        prompt to stage a new take.
      </p>

      {project.beats.length === 0 ? (
        <p className="empty">
          Upload a script, stills, or clips, or add a beat to start staging.
        </p>
      ) : (
        <div className="beat-layout">
          <div className="beat-list" role="list">
            {project.beats.map((beat, index) => {
              const score = weakScore(beat);
              return (
                <button
                  key={beat.id}
                  className={`beat-item${beat.id === selected?.id ? " is-current" : ""}${score != null && score <= 2.5 ? " is-weak" : ""}`}
                  type="button"
                  onClick={() => select(beat.id)}
                >
                  <span className="meta">
                    {String(index + 1).padStart(2, "0")}
                    {score != null ? ` · ${score.toFixed(1)}` : ""}
                  </span>
                  <strong>{beat.title}</strong>
                  <span>{beat.script.slice(0, 90) || "No script yet"}</span>
                </button>
              );
            })}
          </div>

          {selected ? (
            <div className="beat-detail">
              <div className="kicker-row">
                <input
                  className="track-label-input"
                  value={selected.title}
                  onChange={(event) =>
                    update(selected.id, { title: event.target.value })
                  }
                  aria-label="Beat title"
                />
                <div className="row-actions">
                  {splitIntoBeats(selected.script).length > 1 ? (
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => persist(explodeBeat(project, selected.id))}
                    >
                      Split script
                    </button>
                  ) : null}
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => persist(savePromptTake(project, selected.id))}
                  >
                    Save take
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

              <div className="beat-media">
                <FileSlot
                  label="Scene still"
                  accept="image/*"
                  kind="image"
                  assetId={selected.stillFileId}
                  onAssigned={(nextId) =>
                    persist(setBeatMedia(project, selected.id, "still", nextId))
                  }
                />
                <FileSlot
                  label="Scene clip"
                  accept="video/*"
                  kind="video"
                  assetId={selected.clipFileId}
                  onAssigned={(nextId) =>
                    persist(setBeatMedia(project, selected.id, "clip", nextId))
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

              <div className="kicker-row">
                <label className="kicker" htmlFor="beat-prompt">
                  Prompt used
                </label>
                <button
                  className="button ghost"
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(selected.prompt);
                  }}
                >
                  Copy prompt
                </button>
              </div>
              <textarea
                id="beat-prompt"
                className="prompt-editor"
                value={selected.prompt}
                onChange={(event) =>
                  update(selected.id, { prompt: event.target.value })
                }
                placeholder="Type a new prompt to restage this still or clip…"
              />

              <h3>Recommendation prompts</h3>
              <ul className="recs">
                {selected.recommendations.map((item) => (
                  <li key={item}>
                    {item}
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() =>
                        persist(applyBeatRec(project, selected.id, item))
                      }
                    >
                      Apply to prompt
                    </button>
                  </li>
                ))}
              </ul>

              <h3>Grade this beat</h3>
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

              {(selected.stillTakes.length > 0 || selected.clipTakes.length > 0) && (
                <div className="version-list">
                  <p className="kicker">Takes</p>
                  <ul>
                    {[...selected.stillTakes, ...selected.clipTakes]
                      .sort((a, b) => (a.at < b.at ? 1 : -1))
                      .map((take) => (
                        <li key={take.id}>
                          <span>
                            {take.kind} · {new Date(take.at).toLocaleString()} ·{" "}
                            {take.prompt.slice(0, 60) || "No prompt"}
                          </span>
                          <button
                            className="button ghost"
                            type="button"
                            onClick={() =>
                              persist(restoreTake(project, selected.id, take.id))
                            }
                          >
                            Restore
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <h3>Ask the agent</h3>
              <div className="chat-log">
                {chat.length === 0 ? (
                  <p className="empty">Notes for this beat only.</p>
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
                  placeholder="Restage this shot: colder diner, slower push-in…"
                />
                <button className="button primary" type="submit" disabled={busy}>
                  {busy ? "Writing prompt…" : "New prompt from note"}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
