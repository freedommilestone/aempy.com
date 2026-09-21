export type IngestKind = "script" | "picture" | "clip" | "audio" | "skip";

const LIMITS = {
  image: 20 * 1024 * 1024,
  audio: 30 * 1024 * 1024,
  video: 80 * 1024 * 1024,
  file: 20 * 1024 * 1024,
};

const SKIP = /(\.DS_Store|Thumbs\.db|desktop\.ini|^~\$)/i;

export function skipIngestName(name: string) {
  return SKIP.test(name) || name.startsWith(".");
}

export function classifyIngestFile(file: File): IngestKind {
  if (skipIngestName(file.name)) return "skip";
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type.startsWith("video/") || /\.(mp4|mov|m4v|webm|mkv)$/.test(name)) {
    return "clip";
  }
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|heif)$/.test(name)) {
    return "picture";
  }
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|aiff)$/.test(name)) {
    return "audio";
  }
  if (
    type.startsWith("text/") ||
    /\.(txt|md|markdown|fountain|rtf|doc|docx)$/.test(name)
  ) {
    return "script";
  }
  if (/\.pdf$/.test(name) || type === "application/pdf") {
    return /script|dialogue|vo\b|voiceover/.test(name) ? "script" : "picture";
  }
  return "skip";
}

export function ingestLimitFor(kind: IngestKind) {
  if (kind === "clip") return LIMITS.video;
  if (kind === "audio") return LIMITS.audio;
  if (kind === "picture") return LIMITS.image;
  return LIMITS.file;
}

export function sortIngestFiles(files: File[]) {
  const rank: Record<IngestKind, number> = {
    script: 0,
    picture: 1,
    clip: 2,
    audio: 3,
    skip: 9,
  };
  return [...files].sort((a, b) => {
    const ka = classifyIngestFile(a);
    const kb = classifyIngestFile(b);
    if (rank[ka] !== rank[kb]) return rank[ka] - rank[kb];
    const pa = a.webkitRelativePath || a.name;
    const pb = b.webkitRelativePath || b.name;
    return pa.localeCompare(pb, undefined, { numeric: true });
  });
}
