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

export function splitIntoBeats(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
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
      beats: built,
      currentBeatId: built[0]?.id ?? null,
    };
  }

  const filled: Beat[] = beats.map((beat, index) => {
    const still = stills[index];
    const clip = clips[index];
    return {
      ...beat,
      stillFileId: beat.stillFileId || still?.fileId,
      clipFileId: beat.clipFileId || clip?.fileId,
      prompt: beat.prompt || still?.prompt || clip?.prompt || "",
      script: beat.script || scriptParts[index] || "",
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
    beats: filled,
    currentBeatId:
      project.currentBeatId && filled.some((beat) => beat.id === project.currentBeatId)
        ? project.currentBeatId
        : filled[0]?.id ?? null,
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
  const beat = emptyBeat({
    title: `Beat ${String(project.beats.length + 1).padStart(2, "0")}`,
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
      project.currentBeatId === beatId ? (beats[0]?.id ?? null) : project.currentBeatId,
  };
}

export function explodeBeat(project: Project, beatId: string): Project {
  const beat = project.beats.find((item) => item.id === beatId);
  if (!beat) return project;
  const parts = splitIntoBeats(beat.script);
  if (parts.length < 2) return project;
  const first = { ...beat, script: parts[0], title: titleFromChunk(parts[0], 0) };
  const rest = parts.slice(1).map((script, index) =>
    emptyBeat({
      title: titleFromChunk(script, index + 1),
      script,
      prompt: beat.prompt,
      vo: index === 0 ? "" : "",
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
