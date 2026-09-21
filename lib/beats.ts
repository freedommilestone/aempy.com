import {
  applyRecommendation,
  uid,
  type Beat,
  type GradeKey,
  type MediaTake,
  type Project,
} from "@/lib/projects";

export const DEFAULT_BEAT_RECS = [
  "Tighter close-up — face or object readable on a phone.",
  "Show what the line is about. Don't illustrate every word.",
  "Colder light, slower move, one specific prop from this beat.",
];

const CLOCK_PATTERN = String.raw`(?:\d{1,2}:)?\d{2}:\d{2}`;
const CLOCK_RE = new RegExp(CLOCK_PATTERN);
const RANGE_RE = new RegExp(
  String.raw`\[?\s*(${CLOCK_PATTERN})\s*[–\-—]\s*(?:(${CLOCK_PATTERN})|end)\s*\]?`,
  "i",
);
const TIMESTAMP_LINE_RE = new RegExp(
  String.raw`^\s*\[?\s*${CLOCK_PATTERN}\s*[–\-—]\s*(?:${CLOCK_PATTERN}|end)\s*\]?`,
  "i",
);

export function formatClock(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function toSec(clock: string) {
  const parts = clock.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

export function parseClockInput(text: string) {
  const match = text.match(CLOCK_RE);
  if (!match) return null;
  return toSec(match[0]);
}

export function parseTimeRange(text: string) {
  const range = text.match(RANGE_RE);
  if (range) {
    const start = toSec(range[1]);
    const end = range[2] ? toSec(range[2]) : undefined;
    return { start, end };
  }
  const one = text.match(CLOCK_RE);
  if (!one) return null;
  return { start: toSec(one[0]) };
}

export function endOf(beat: Beat) {
  return beat.endSec > beat.startSec ? beat.endSec : beat.startSec + 1;
}

export function timelineDuration(beats: Beat[]) {
  return Math.max(1, ...beats.map((beat) => endOf(beat)));
}

export function rulerMarks(duration: number) {
  const step =
    duration <= 20 ? 2 : duration <= 60 ? 5 : duration <= 180 ? 15 : 30;
  const marks: number[] = [];
  for (let time = 0; time <= duration + 0.001; time += step) {
    marks.push(Number(time.toFixed(2)));
  }
  if (marks[marks.length - 1] < duration) marks.push(duration);
  return marks;
}

export function stampBeatTimes(beats: Beat[]): Beat[] {
  if (!beats.length) return beats;
  const parsed = beats.map((beat) => {
    const range = parseTimeRange(`${beat.title}\n${beat.script}`);
    if (!range) return beat;
    return {
      ...beat,
      startSec: range.start,
      endSec: range.end && range.end > range.start ? range.end : beat.endSec,
    };
  });

  const out: Beat[] = [];
  let index = 0;
  let cursor = 0;
  while (index < parsed.length) {
    const beat = parsed[index];
    if (beat.endSec > beat.startSec) {
      out.push(beat);
      cursor = Math.max(cursor, beat.endSec);
      index += 1;
      continue;
    }
    let next = index;
    while (next < parsed.length && !(parsed[next].endSec > parsed[next].startSec)) {
      next += 1;
    }
    const group = parsed.slice(index, next);
    if (next < parsed.length && parsed[next].startSec <= cursor) {
      const timed = parsed[next];
      const pack = [...group, timed];
      const weights = pack.map((item) => {
        const words = (item.script || "").trim().split(/\s+/).filter(Boolean)
          .length;
        return Math.max(words, 8);
      });
      const totalWeight = weights.reduce((sum, value) => sum + value, 0);
      const span = Math.max(pack.length, timed.endSec - timed.startSec);
      let time = timed.startSec;
      pack.forEach((item, offset) => {
        const dur = (weights[offset] / totalWeight) * span;
        out.push({ ...item, startSec: time, endSec: time + dur });
        time += dur;
      });
      cursor = Math.max(cursor, time);
      index = next + 1;
      continue;
    }
    const weights = group.map((item) => {
      const words = (item.script || "").trim().split(/\s+/).filter(Boolean).length;
      return Math.max(words, 8);
    });
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const cap =
      next < parsed.length
        ? parsed[next].startSec
        : cursor + Math.max(8, totalWeight / 2.5);
    const span = Math.max(group.length, cap - cursor);
    let time = cursor;
    group.forEach((item, offset) => {
      const dur = (weights[offset] / totalWeight) * span;
      out.push({ ...item, startSec: time, endSec: time + dur });
      time += dur;
    });
    cursor = time;
    index = next;
  }
  return out;
}

export function beatAtTime(beats: Beat[], seconds: number) {
  const hit = beats.find(
    (beat) => seconds >= beat.startSec && seconds < endOf(beat),
  );
  if (hit) return hit;
  return (
    [...beats].sort((a, b) => {
      const da = Math.abs((a.startSec + endOf(a)) / 2 - seconds);
      const db = Math.abs((b.startSec + endOf(b)) / 2 - seconds);
      return da - db;
    })[0] ?? null
  );
}

export function beatForRange(beats: Beat[], start: number, end: number) {
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  let best: Beat | null = null;
  let overlap = 0;
  for (const beat of beats) {
    const amount = Math.min(hi, endOf(beat)) - Math.max(lo, beat.startSec);
    if (amount > overlap) {
      overlap = amount;
      best = beat;
    }
  }
  return best ?? beatAtTime(beats, (lo + hi) / 2);
}

export function autoRecommendations(beat: Beat) {
  const extras: string[] = [];
  if ((beat.grades.still ?? 5) <= 2) {
    extras.push(
      "Regenerate this still: tighter close-up, face readable on a phone.",
    );
  }
  if ((beat.grades.clip ?? 5) <= 2) {
    extras.push(
      "Regenerate this clip: shorter take, slower camera, match the still.",
    );
  }
  if ((beat.grades.script ?? 5) <= 2) {
    extras.push("Rewrite this timestamp so the picture carries the line.");
  }
  if ((beat.grades.vo ?? 5) <= 2) {
    extras.push("Rewrite the VO: shorter, more subtext, leave air for the cut.");
  }
  if (!beat.stillFileId) {
    extras.push("Generate a still for this timestamp from the prompt.");
  }
  if (!beat.clipFileId) {
    extras.push("Generate a clip for this timestamp from the prompt.");
  }
  const base = beat.recommendations.length
    ? beat.recommendations
    : DEFAULT_BEAT_RECS;
  return [...new Set([...extras, ...base])].slice(0, 5);
}

export function splitIntoBeats(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const lines = trimmed.split(/\n/);
  const timestampStarts = lines
    .map((line, index) => (TIMESTAMP_LINE_RE.test(line) ? index : -1))
    .filter((index) => index >= 0);
  if (timestampStarts.length > 0) {
    const chunks: string[] = [];
    timestampStarts.forEach((start, offset) => {
      const end = timestampStarts[offset + 1] ?? lines.length;
      const chunk = lines.slice(start, end).join("\n").trim();
      if (chunk) chunks.push(chunk);
    });
    return chunks;
  }
  const headed = trimmed.split(
    /\n(?=(?:COLD OPEN|TURN|PROOF|CLOSER|SCENE\s+\d+|BEAT\s+\d+|INT\.|EXT\.|TITLE:))/i,
  );
  if (headed.length > 1) return headed.map((item) => item.trim()).filter(Boolean);
  const paras = trimmed.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  if (paras.length > 1) return paras;
  return [trimmed];
}

function titleFromChunk(chunk: string, index: number) {
  const line = chunk.split("\n").find((item) => item.trim()) ?? "";
  const cleaned = line.replace(/^TITLE:\s*/i, "").trim();
  if (cleaned && cleaned.length < 52) return cleaned;
  return `Beat ${String(index + 1).padStart(2, "0")}`;
}

export function emptyBeat(partial?: Partial<Beat>): Beat {
  return {
    id: uid(),
    title: "New beat",
    script: "",
    vo: "",
    prompt: "",
    recommendations: [...DEFAULT_BEAT_RECS],
    stillTakes: [],
    clipTakes: [],
    grades: {},
    startSec: 0,
    endSec: 0,
    ...partial,
  };
}

export function alignBeats(project: Project): Project {
  const beats = [...(project.beats ?? [])];
  const script = project.tracks.find((track) => track.kind === "script")?.content ?? "";
  const vo = project.tracks.find((track) => track.kind === "voiceover")?.content ?? "";
  const stills =
    project.tracks.find((track) => track.kind === "images")?.scenes ??
    project.tracks.find((track) => track.kind === "storyboard")?.scenes ??
    [];
  const clips = project.tracks.find((track) => track.kind === "videos")?.scenes ?? [];
  const scriptParts = splitIntoBeats(script);
  const voParts = splitIntoBeats(vo);

  if (beats.length === 0) {
    const count = Math.max(scriptParts.length, voParts.length, stills.length, clips.length);
    const built = Array.from({ length: count }, (_, index) => {
      const still = stills[index];
      const clip = clips[index];
      const chunk = scriptParts[index] ?? "";
      return emptyBeat({
        title: still?.title || clip?.title || titleFromChunk(chunk, index),
        script: chunk,
        vo: voParts[index] ?? "",
        prompt: still?.prompt || clip?.prompt || "",
        stillFileId: still?.fileId,
        clipFileId: clip?.fileId,
      });
    });
    return {
      ...project,
      beats: stampBeatTimes(built),
      currentBeatId: project.currentBeatId ?? null,
    };
  }

  const filled: Beat[] = beats.map((beat, index) => {
    const still = stills[index];
    const clip = clips[index];
    const script = beat.script || scriptParts[index] || "";
    return {
      ...beat,
      stillFileId: beat.stillFileId || still?.fileId,
      clipFileId: beat.clipFileId || clip?.fileId,
      prompt: beat.prompt || still?.prompt || clip?.prompt || "",
      script,
      vo: beat.vo || voParts[index] || "",
    };
  });

  const extra = Math.max(stills.length, clips.length, scriptParts.length);
  for (let index = filled.length; index < extra; index += 1) {
    const still = stills[index];
    const clip = clips[index];
    filled.push(
      emptyBeat({
        title: still?.title || clip?.title || titleFromChunk(scriptParts[index] ?? "", index),
        script: scriptParts[index] ?? "",
        vo: voParts[index] ?? "",
        prompt: still?.prompt || clip?.prompt || "",
        stillFileId: still?.fileId,
        clipFileId: clip?.fileId,
      }),
    );
  }

  return {
    ...project,
    beats: stampBeatTimes(filled),
    currentBeatId:
      project.currentBeatId && filled.some((beat) => beat.id === project.currentBeatId)
        ? project.currentBeatId
        : null,
  };
}

export function patchBeat(
  project: Project,
  beatId: string,
  patch: Partial<Beat> | ((beat: Beat) => Beat),
): Project {
  return {
    ...project,
    beats: project.beats.map((beat) => {
      if (beat.id !== beatId) return beat;
      return typeof patch === "function" ? patch(beat) : { ...beat, ...patch };
    }),
  };
}

export function addBeat(project: Project): Project {
  const last = project.beats.at(-1);
  const start = last ? endOf(last) : 0;
  const beat = emptyBeat({
    title: `Beat ${String(project.beats.length + 1).padStart(2, "0")}`,
    startSec: start,
    endSec: start + Math.max(4, timelineDuration(project.beats) * 0.08),
  });
  return {
    ...project,
    beats: [...project.beats, beat],
    currentBeatId: beat.id,
  };
}

export function removeBeat(project: Project, beatId: string): Project {
  const beats = project.beats.filter((beat) => beat.id !== beatId);
  return {
    ...project,
    beats,
    currentBeatId:
      project.currentBeatId === beatId ? null : project.currentBeatId,
  };
}

export function explodeBeat(project: Project, beatId: string): Project {
  const beat = project.beats.find((item) => item.id === beatId);
  if (!beat) return project;
  const parts = splitIntoBeats(beat.script);
  if (parts.length < 2) return project;
  const span = Math.max(1, (endOf(beat) - beat.startSec) / parts.length);
  const first = {
    ...beat,
    script: parts[0],
    title: titleFromChunk(parts[0], 0),
    endSec: beat.startSec + span,
  };
  const rest = parts.slice(1).map((script, index) =>
    emptyBeat({
      title: titleFromChunk(script, index + 1),
      script,
      prompt: beat.prompt,
      startSec: beat.startSec + span * (index + 1),
      endSec: beat.startSec + span * (index + 2),
    }),
  );
  const index = project.beats.findIndex((item) => item.id === beatId);
  const beats = [...project.beats];
  beats.splice(index, 1, first, ...rest);
  return { ...project, beats, currentBeatId: first.id };
}

function pushTake(takes: MediaTake[], take: MediaTake) {
  return [take, ...takes].slice(0, 20);
}

export function setBeatMedia(
  project: Project,
  beatId: string,
  kind: "still" | "clip",
  fileId?: string,
): Project {
  return patchBeat(project, beatId, (beat) => {
    const currentId = kind === "still" ? beat.stillFileId : beat.clipFileId;
    const takes = kind === "still" ? beat.stillTakes : beat.clipTakes;
    const nextTakes =
      currentId && currentId !== fileId
        ? pushTake(takes, {
            id: uid(),
            at: new Date().toISOString(),
            prompt: beat.prompt,
            kind,
            fileId: currentId,
          })
        : takes;
    if (kind === "still") {
      return { ...beat, stillFileId: fileId, stillTakes: nextTakes };
    }
    return { ...beat, clipFileId: fileId, clipTakes: nextTakes };
  });
}

export function restoreTake(
  project: Project,
  beatId: string,
  takeId: string,
): Project {
  return patchBeat(project, beatId, (beat) => {
    const take =
      beat.stillTakes.find((item) => item.id === takeId) ||
      beat.clipTakes.find((item) => item.id === takeId);
    if (!take) return beat;
    if (take.kind === "still") {
      return { ...beat, prompt: take.prompt, stillFileId: take.fileId };
    }
    return { ...beat, prompt: take.prompt, clipFileId: take.fileId };
  });
}

export function savePromptTake(project: Project, beatId: string): Project {
  return patchBeat(project, beatId, (beat) => ({
    ...beat,
    stillTakes: beat.stillFileId
      ? pushTake(beat.stillTakes, {
          id: uid(),
          at: new Date().toISOString(),
          prompt: beat.prompt,
          kind: "still",
          fileId: beat.stillFileId,
        })
      : beat.stillTakes,
    clipTakes: beat.clipFileId
      ? pushTake(beat.clipTakes, {
          id: uid(),
          at: new Date().toISOString(),
          prompt: beat.prompt,
          kind: "clip",
          fileId: beat.clipFileId,
        })
      : beat.clipTakes,
  }));
}

export function gradeBeat(
  project: Project,
  beatId: string,
  key: GradeKey,
  value: number,
): Project {
  return patchBeat(project, beatId, (beat) => ({
    ...beat,
    grades: { ...beat.grades, [key]: value },
  }));
}

export function applyBeatRec(
  project: Project,
  beatId: string,
  recommendation: string,
): Project {
  return patchBeat(project, beatId, (beat) => ({
    ...beat,
    prompt: applyRecommendation(beat.prompt, recommendation),
  }));
}

export function beatById(project: Project, beatId: string | null) {
  return project.beats.find((beat) => beat.id === beatId) ?? null;
}

export function weakScore(beat: Beat) {
  const values = Object.values(beat.grades).filter((value) => typeof value === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
