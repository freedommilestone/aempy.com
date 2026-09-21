"use client";

import { DragEvent, useRef, useState } from "react";
import { skipIngestName } from "@/lib/ingest";

async function readAllEntries(reader: FileSystemDirectoryReader) {
  const all: FileSystemEntry[] = [];
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (!batch.length) break;
    all.push(...batch);
  }
  return all;
}

async function collectEntry(entry: FileSystemEntry, out: File[]) {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => {
      (entry as FileSystemFileEntry).file(resolve, reject);
    });
    if (!skipIngestName(file.name)) out.push(file);
    return;
  }
  if (!entry.isDirectory) return;
  const children = await readAllEntries(
    (entry as FileSystemDirectoryEntry).createReader(),
  );
  for (const child of children) {
    await collectEntry(child, out);
  }
}

async function filesFromDrop(event: DragEvent<HTMLElement>) {
  const items = event.dataTransfer?.items;
  if (!items?.length) {
    return Array.from(event.dataTransfer?.files ?? []).filter(
      (file) => !skipIngestName(file.name),
    );
  }
  const out: File[] = [];
  const entries: FileSystemEntry[] = [];
  for (const item of Array.from(items)) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) entries.push(entry);
    else if (item.kind === "file") {
      const file = item.getAsFile();
      if (file && !skipIngestName(file.name)) out.push(file);
    }
  }
  for (const entry of entries) {
    await collectEntry(entry, out);
  }
  return out;
}

export function PlugFab({
  busy,
  onFiles,
}: {
  busy: boolean;
  onFiles: (files: File[]) => void | Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function takeList(list: FileList | null) {
    const files = Array.from(list ?? []).filter((file) => !skipIngestName(file.name));
    if (files.length) void onFiles(files);
  }

  return (
    <div className={`plug-fab${over ? " is-over" : ""}`}>
      <input
        ref={fileRef}
        className="plug-input"
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.txt,.md,.pdf,.doc,.docx,.fountain,.rtf,text/plain,application/pdf"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => {
          takeList(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={(node) => {
          folderRef.current = node;
          if (node) {
            node.setAttribute("webkitdirectory", "");
            node.setAttribute("directory", "");
          }
        }}
        className="plug-input"
        type="file"
        multiple
        aria-hidden
        tabIndex={-1}
        onChange={(event) => {
          takeList(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        className="plug-button"
        type="button"
        disabled={busy}
        title="Drop a folder, stills, clips, or a script. Option-click to pick a folder."
        aria-label="Plug in files. Drop a folder or click to pick. Option-click for a folder."
        onClick={(event) => {
          if (event.altKey) folderRef.current?.click();
          else fileRef.current?.click();
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void filesFromDrop(event).then((files) => {
            if (files.length) void onFiles(files);
          });
        }}
      >
        {busy ? "…" : "+"}
      </button>
    </div>
  );
}
