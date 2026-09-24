"use client";

import { useState } from "react";
import type { Draft } from "./project-types";

export function withoutProject(id: string): Draft[] {
  const saved = JSON.parse(localStorage.getItem("aempy-drafts") || "[]");
  if (!Array.isArray(saved)) throw new Error("Projects could not be read");
  return saved.filter((project: Draft) => project.id !== id);
}

export default function DeleteProjectControl({ title, onDelete }: { title: string; onDelete: () => boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  function remove() {
    try {
      if (onDelete()) return;
    } catch { /* Keep the confirmation open when storage cannot be updated. */ }
    setError("Couldn’t delete this project. Your saved project is unchanged. Please try again.");
  }
  return <div className="project-delete-control">
    {confirming ? <div role="group" aria-label="Confirm project deletion"><h3>Delete “{title}”?</h3><p>This permanently removes the project and all its episodes, world details, and notes from this browser. This cannot be undone.</p><div className="project-delete-actions"><button className="project-delete-button" type="button" onClick={remove}>Delete Permanently</button><button className="project-secondary" type="button" onClick={()=>{setConfirming(false);setError("");}}>Keep Project</button></div></div> : <button className="project-delete-button" type="button" onClick={()=>setConfirming(true)}>Delete Project</button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
