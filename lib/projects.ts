export const TRACK_KINDS = [
  { id: "notes", label: "Notes" },
  { id: "idea", label: "Idea" },
  { id: "title", label: "Title" },
  { id: "script", label: "Script" },
  { id: "voiceover", label: "Voice over" },
  { id: "storyboard", label: "Storyboard" },
  { id: "images", label: "Stills" },
  { id: "thumbnail", label: "Thumbnail" },
  { id: "videos", label: "Clips" },
  { id: "sound", label: "Sound" },
  { id: "music", label: "Music" },
  { id: "description", label: "Description" },
  { id: "publish", label: "Publish" },
  { id: "files", label: "Files" },
] as const;

export type TrackKind = (typeof TRACK_KINDS)[number]["id"];

export const YOUTUBE_SET: TrackKind[] = [
  "idea",
  "title",
  "script",
  "voiceover",
  "storyboard",
  "images",
  "thumbnail",
  "videos",
  "sound",
  "music",
  "description",
  "publish",
];

export type Scene = {
  id: string;
  title: string;
  beat: string;
  camera?: string;
  prompt: string;
  fileId?: string;
};

export type TrackCheck = {
  id: string;
  label: string;
  done: boolean;
};

export type TrackVersion = {
  id: string;
  at: string;
  prompt: string;
  content: string;
  scenes?: Scene[];
};

export type Track = {
  id: string;
  kind: TrackKind;
  label: string;
  prompt: string;
  content: string;
  recommendations: string[];
  scenes: Scene[];
  checks: TrackCheck[];
  files: string[];
  thumbs: Record<string, string>;
  audioId?: string;
  history: TrackVersion[];
};

export type GradeKey = "script" | "vo" | "still" | "clip";

export type MediaTake = {
  id: string;
  at: string;
  prompt: string;
  kind: "still" | "clip";
  fileId?: string;
};

export type Beat = {
  id: string;
  title: string;
  startSec: number;
  script: string;
  vo: string;
  prompt: string;
  recommendations: string[];
  stillFileId?: string;
  clipFileId?: string;
  stillTakes: MediaTake[];
  clipTakes: MediaTake[];
  grades: Partial<Record<GradeKey, number>>;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  trackId: string;
  beatId?: string;
  at: string;
};

export type Project = {
  id: string;
  title: string;
  createdAt: string;
  brief: string;
  currentTrackId: string | null;
  currentBeatId: string | null;
  tracks: Track[];
  beats: Beat[];
  chat: ChatMessage[];
};

const STORAGE_KEY = "aempy-projects";

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function kindLabel(kind: TrackKind) {
  return TRACK_KINDS.find((item) => item.id === kind)?.label ?? kind;
}

export function titleFromIdea(idea: string) {
  const words = idea.replace(/\s+/g, " ").trim().split(" ").slice(0, 8).join(" ");
  if (!words) return "Untitled video";
  return words.length > 52 ? `${words.slice(0, 52)}…` : words;
}

function emptyTrack(kind: TrackKind, label?: string): Track {
  return {
    id: uid(),
    kind,
    label: label ?? kindLabel(kind),
    prompt: "",
    content: "",
    recommendations: [],
    scenes: [],
    checks: [],
    files: [],
    thumbs: {},
    history: [],
  };
}

function sceneBeats(subject: string, promptKind: "storyboard" | "image" | "video"): Scene[] {
  const beats = [
    {
      title: "The cold open",
      camera: "Wide, locked-off, 16:9",
      beat: "Hook in the first three seconds. Put the viewer inside the world before you explain anything.",
    },
    {
      title: "The turn",
      camera: "Medium, slow push-in",
      beat: "A complication arrives. The character has to choose, and the stakes become visible.",
    },
    {
      title: "The proof",
      camera: "Close-up, hold",
      beat: "Show the work, the evidence, or the transformation. This is the panel people pause on.",
    },
    {
      title: "The closer",
      camera: "Wide again, match the open",
      beat: "Emotional payoff, then a reason to watch the next video. Leave one image lingering.",
    },
  ];

  return beats.map((beat, index) => {
    let prompt = "";
    if (promptKind === "storyboard") {
      prompt = `Storyboard panel ${index + 1} of 4, 16:9, clean production sketch. Story: ${subject}. Shot: ${beat.title}. Camera: ${beat.camera}. Action: ${beat.beat} Same character continuity across panels. No photoreal render, no text, no watermark.`;
    } else if (promptKind === "image") {
      prompt = `Photoreal cinematic still, 16:9 YouTube frame. Story: ${subject}. Shot: ${beat.title}. Camera: ${beat.camera}. Action: ${beat.beat} Motivated practical light, shallow depth of field, grounded wardrobe, continuity of character and location, film grain, no text, no watermark.`;
    } else {
      prompt = `5–8 second cinematic clip, 16:9, 24fps. Story: ${subject}. Beat: ${beat.title} — ${beat.beat} Camera: ${beat.camera}. Ambient world sound, no jump cuts, no on-screen text, no watermark.`;
    }
    return {
      id: uid(),
      title: beat.title,
      beat: beat.beat,
      camera: beat.camera,
      prompt,
    };
  });
}

export function createTrack(kind: TrackKind, subject: string): Track {
  const topic = subject.trim() || "this video";
  const track = emptyTrack(kind);

  if (kind === "notes" || kind === "files") {
    track.prompt = `Notes and files for: ${topic}`;
    return track;
  }

  if (kind === "idea") {
    track.content = topic === "this video" ? "" : topic;
    track.prompt = `You are a YouTube showrunner. Turn this into one filmable episode concept with a hook, protagonist, conflict, and ending image. Idea: ${topic}`;
    track.recommendations = [
      "Name the viewer in the first line: who this is for, and why they should stay.",
      "Make the conflict visible on screen — not only described in voiceover.",
      "Write one signature image the audience could screenshot and remember.",
    ];
    return track;
  }

  if (kind === "title") {
    const working = titleFromIdea(subject);
    track.content = `WORKING TITLE + ALTS\n\nA. ${working}\nB.\nC.`;
    track.prompt = `Write 6 YouTube titles for this video. Mix curiosity and specificity. Under 70 characters. No all-caps. Concept: ${topic}`;
    track.recommendations = [
      "Lead with the emotion or the choice, not the format.",
      "Test one title that names a place or object from the video.",
      "If you need a subtitle, put it in the first description line instead.",
    ];
    return track;
  }

  if (kind === "script") {
    track.content = `TITLE: ${titleFromIdea(subject)}\n\nCOLD OPEN\n\nTURN\n\nPROOF\n\nCLOSER`;
    track.prompt = `Write a YouTube script from this concept. Include spoken lines and visual directions. Concept: ${topic}`;
    track.recommendations = [
      "Cut any sentence that restates what the picture already shows.",
      "Put a pattern interrupt before the 30-second mark.",
      "End on a visual callback to the open.",
    ];
    return track;
  }

  if (kind === "voiceover") {
    track.content = "VOICE OVER — dry read\n\nCOLD OPEN\n\nTURN\n\nPROOF\n\nCLOSER";
    track.prompt = `Write a voice-over read. Short sentences. Conversational. Mark breaths. Concept: ${topic}`;
    track.recommendations = [
      "Cut any line the picture already says.",
      "Leave air before the closer so music can enter.",
    ];
    return track;
  }

  if (kind === "storyboard") {
    track.scenes = sceneBeats(topic, "storyboard");
    track.prompt = track.scenes
      .map(
        (scene, index) =>
          `PANEL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.prompt}`,
      )
      .join("\n\n");
    track.recommendations = [
      "Keep panels the same aspect ratio and character design.",
      "Rewrite unclear action in one sentence: who does what.",
    ];
    return track;
  }

  if (kind === "images") {
    track.scenes = sceneBeats(topic, "image");
    track.prompt = track.scenes
      .map(
        (scene, index) =>
          `STILL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.prompt}`,
      )
      .join("\n\n");
    track.recommendations = [
      "Keep faces readable at mobile size.",
      "If a still feels generic, add one specific prop and replace only that frame.",
    ];
    return track;
  }

  if (kind === "videos") {
    track.scenes = sceneBeats(topic, "video");
    track.prompt = track.scenes
      .map(
        (scene, index) =>
          `CLIP ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.prompt}`,
      )
      .join("\n\n");
    track.recommendations = [
      "Keep clips short; long generative takes kill YouTube pacing.",
    ];
    return track;
  }

  if (kind === "thumbnail") {
    track.content = "THUMBNAIL — 1280×720, readable at mobile size\n\nA.\nB.\nC.";
    track.prompt = `Design 3 YouTube thumbnails, 1280x720. High contrast, one focal point, max 3 words of text. Story: ${topic}`;
    track.recommendations = [
      "Never put more than three words on the image.",
      "Export a version with no text for A/B tests.",
    ];
    return track;
  }

  if (kind === "sound") {
    track.content = "SOUND DESIGN — diegetic first\n\nBeds:\nHits:\nSignature sound:";
    track.prompt = `Design a sound bed for this video. List FX, room tone, and one signature sound. Story: ${topic}`;
    return track;
  }

  if (kind === "music") {
    track.content = "MUSIC — instrumental cues\n\nTheme:\nOpen:\nCloser:";
    track.prompt = `Compose an underscore. Instrumental, no lyrics, cue points. Story: ${topic}`;
    return track;
  }

  if (kind === "description") {
    track.content = `YOUTUBE DESCRIPTION\n\nFirst line:\n\nChapters:\n\nSummary:\n\nLinks:\n\nTags:`;
    track.prompt = `Write a YouTube description: hook line, chapters, summary, links, tags. Concept: ${topic}`;
    return track;
  }

  track.content = `PUBLISH CHECKLIST\nEpisode: ${topic}`;
  track.prompt = `YouTube upload checklist for this episode. Concept: ${topic}`;
  track.checks = [
    { id: "title", label: "Title locked with the thumbnail", done: false },
    { id: "thumb", label: "Thumbnail uploaded (1280×720)", done: false },
    { id: "captions", label: "Captions reviewed", done: false },
    { id: "chapters", label: "Chapters match the description", done: false },
    { id: "tags", label: "Tags and playlist set", done: false },
    { id: "endscreen", label: "End screen + cards", done: false },
    { id: "pin", label: "Pinned comment drafted", done: false },
    { id: "schedule", label: "Premiere or schedule set", done: false },
  ];
  return track;
}

export function buildProject(name: string): Project {
  const brief = name.trim();
  return {
    id: uid(),
    title: titleFromIdea(brief),
    createdAt: new Date().toISOString(),
    brief,
    currentTrackId: null,
    currentBeatId: null,
    tracks: [],
    beats: [],
    chat: [],
  };
}

export function addTrack(project: Project, kind: TrackKind): Project {
  const track = createTrack(kind, project.brief || project.title);
  return {
    ...project,
    tracks: [...project.tracks, track],
    currentTrackId: track.id,
  };
}

export function ensureTrack(project: Project, kind: TrackKind) {
  const existing = project.tracks.find((track) => track.kind === kind);
  if (existing) {
    return { project, trackId: existing.id };
  }
  const next = addTrack(project, kind);
  const track = next.tracks[next.tracks.length - 1];
  return { project: next, trackId: track.id };
}

export function addYoutubeSet(project: Project): Project {
  const existing = new Set(project.tracks.map((track) => track.kind));
  const added = YOUTUBE_SET.filter((kind) => !existing.has(kind)).map((kind) =>
    createTrack(kind, project.brief || project.title),
  );
  if (added.length === 0) return project;
  return {
    ...project,
    tracks: [...project.tracks, ...added],
    currentTrackId: project.currentTrackId ?? added[0]?.id ?? null,
  };
}

export function removeTrack(project: Project, trackId: string): Project {
  const tracks = project.tracks.filter((track) => track.id !== trackId);
  return {
    ...project,
    tracks,
    currentTrackId:
      project.currentTrackId === trackId
        ? (tracks[0]?.id ?? null)
        : project.currentTrackId,
    chat: project.chat.filter((message) => message.trackId !== trackId),
  };
}

export function moveTrack(project: Project, trackId: string, dir: -1 | 1): Project {
  const index = project.tracks.findIndex((track) => track.id === trackId);
  const next = index + dir;
  if (index < 0 || next < 0 || next >= project.tracks.length) return project;
  const tracks = [...project.tracks];
  const [item] = tracks.splice(index, 1);
  tracks.splice(next, 0, item);
  return { ...project, tracks };
}

export function patchTrack(
  project: Project,
  trackId: string,
  patch: Partial<Track> | ((track: Track) => Track),
): Project {
  return {
    ...project,
    tracks: project.tracks.map((track) => {
      if (track.id !== trackId) return track;
      return typeof patch === "function" ? patch(track) : { ...track, ...patch };
    }),
  };
}

export function applyRecommendation(text: string, recommendation: string) {
  const note = `Refinement: ${recommendation}`;
  if (text.includes(note)) return text;
  return `${text.trim()}\n\n${note}`;
}

type LegacyScene = Scene & {
  storyboardPrompt?: string;
  imagePrompt?: string;
  videoPrompt?: string;
};

type LegacyProject = {
  id?: string;
  title?: string;
  createdAt?: string;
  brief?: string;
  currentTrackId?: string | null;
  currentBeatId?: string | null;
  tracks?: Track[];
  beats?: Beat[];
  currentStage?: string;
  idea?: { raw?: string; refined?: string; prompt?: string; recommendations?: string[] };
  titles?: { content?: string; prompt?: string; recommendations?: string[] };
  script?: { content?: string; prompt?: string; recommendations?: string[] };
  voiceOver?: { content?: string; prompt?: string; recommendations?: string[] };
  scenes?: LegacyScene[];
  storyboardRecommendations?: string[];
  imageRecommendations?: string[];
  videoRecommendations?: string[];
  thumbnail?: { content?: string; prompt?: string; recommendations?: string[] };
  soundDesign?: { content?: string; prompt?: string; recommendations?: string[] };
  music?: { content?: string; prompt?: string; recommendations?: string[] };
  description?: { content?: string; prompt?: string; recommendations?: string[] };
  publish?: {
    content?: string;
    prompt?: string;
    recommendations?: string[];
    checks?: TrackCheck[];
  };
  history?: Record<string, TrackVersion[]>;
  notes?: Record<string, string>;
  files?: {
    stills?: Record<string, string>;
    clips?: Record<string, string>;
    thumbs?: Record<string, string>;
    voiceOver?: string;
  };
  chat?: Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
    trackId?: string;
    stage?: string;
    at: string;
  }>;
};

function fromOutput(
  kind: TrackKind,
  output:
    | { content?: string; prompt?: string; recommendations?: string[] }
    | undefined,
  extra: Partial<Track> = {},
): Track {
  return {
    ...emptyTrack(kind),
    content: output?.content ?? "",
    prompt: output?.prompt ?? "",
    recommendations: output?.recommendations ?? [],
    ...extra,
  };
}

function migrateLegacy(legacy: LegacyProject): Project {
  const brief = legacy.brief || legacy.idea?.raw || legacy.title || "";
  const scenes = legacy.scenes ?? [];
  const history = legacy.history ?? {};
  const notes = legacy.notes ?? {};
  const files = legacy.files ?? {};

  const storyboard = fromOutput("storyboard", {
    content: notes.storyboard ?? "",
    prompt: scenes
      .map(
        (scene, index) =>
          `PANEL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.storyboardPrompt ?? scene.prompt}`,
      )
      .join("\n\n"),
    recommendations: legacy.storyboardRecommendations,
  }, {
    scenes: scenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      beat: scene.beat,
      camera: scene.camera,
      prompt: scene.storyboardPrompt ?? scene.prompt,
    })),
    history: history.storyboard ?? [],
  });

  const images = fromOutput("images", {
    content: notes.images ?? "",
    prompt: scenes
      .map(
        (scene, index) =>
          `STILL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.imagePrompt ?? scene.prompt}`,
      )
      .join("\n\n"),
    recommendations: legacy.imageRecommendations,
  }, {
    scenes: scenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      beat: scene.beat,
      camera: scene.camera,
      prompt: scene.imagePrompt ?? scene.prompt,
      fileId: files.stills?.[scene.id],
    })),
    history: history.images ?? [],
  });

  const videos = fromOutput("videos", {
    content: notes.videos ?? "",
    prompt: scenes
      .map(
        (scene, index) =>
          `CLIP ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.videoPrompt ?? scene.prompt}`,
      )
      .join("\n\n"),
    recommendations: legacy.videoRecommendations,
  }, {
    scenes: scenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      beat: scene.beat,
      camera: scene.camera,
      prompt: scene.videoPrompt ?? scene.prompt,
      fileId: files.clips?.[scene.id],
    })),
    history: history.videos ?? [],
  });

  const tracks: Track[] = [
    fromOutput("idea", {
      content: legacy.idea?.refined ?? brief,
      prompt: legacy.idea?.prompt,
      recommendations: legacy.idea?.recommendations,
    }, { history: history.idea ?? [] }),
    fromOutput("title", legacy.titles, { history: history.titles ?? [] }),
    fromOutput("script", legacy.script, { history: history.script ?? [] }),
    fromOutput("voiceover", legacy.voiceOver, {
      audioId: files.voiceOver,
      history: history.voiceover ?? [],
    }),
    storyboard,
    images,
    fromOutput("thumbnail", legacy.thumbnail, {
      thumbs: files.thumbs ?? {},
      history: history.thumbnail ?? [],
    }),
    videos,
    fromOutput("sound", legacy.soundDesign, { history: history.sound ?? [] }),
    fromOutput("music", legacy.music, { history: history.music ?? [] }),
    fromOutput("description", legacy.description, {
      history: history.description ?? [],
    }),
    fromOutput("publish", legacy.publish, {
      checks: legacy.publish?.checks ?? [],
      history: history.publish ?? [],
    }),
  ];

  const stageToKind: Record<string, TrackKind> = {
    idea: "idea",
    titles: "title",
    script: "script",
    voiceover: "voiceover",
    storyboard: "storyboard",
    images: "images",
    thumbnail: "thumbnail",
    videos: "videos",
    sound: "sound",
    music: "music",
    description: "description",
    publish: "publish",
  };
  const currentKind = stageToKind[legacy.currentStage ?? ""] ?? "idea";
  const currentTrackId =
    tracks.find((track) => track.kind === currentKind)?.id ?? tracks[0]?.id ?? null;

  const chat: ChatMessage[] = (legacy.chat ?? []).map((message) => {
    const kind = stageToKind[message.stage ?? ""] ?? currentKind;
    return {
      id: message.id,
      role: message.role,
      text: message.text,
      at: message.at,
      trackId:
        message.trackId ||
        tracks.find((track) => track.kind === kind)?.id ||
        currentTrackId ||
        "",
    };
  });

  return {
    id: String(legacy.id ?? uid()),
    title: String(legacy.title ?? titleFromIdea(brief)),
    createdAt: String(legacy.createdAt ?? new Date().toISOString()),
    brief,
    currentTrackId,
    currentBeatId: legacy.currentBeatId ?? null,
    tracks,
    beats: legacy.beats ?? [],
    chat,
  };
}

function normalizeBeat(beat: Beat): Beat {
  return {
    id: beat.id,
    title: beat.title || "Beat",
    script: beat.script ?? "",
    vo: beat.vo ?? "",
    prompt: beat.prompt ?? "",
    recommendations: beat.recommendations ?? [],
    stillFileId: beat.stillFileId,
    clipFileId: beat.clipFileId,
    stillTakes: beat.stillTakes ?? [],
    clipTakes: beat.clipTakes ?? [],
    grades: beat.grades ?? {},
    startSec: beat.startSec ?? 0,
  };
}

function normalizeTrack(track: Track): Track {
  return {
    ...emptyTrack(track.kind, track.label),
    ...track,
    scenes: track.scenes ?? [],
    checks: track.checks ?? [],
    files: track.files ?? [],
    thumbs: track.thumbs ?? {},
    history: track.history ?? [],
    recommendations: track.recommendations ?? [],
  };
}

export function migrateProject(raw: unknown): Project {
  const project = raw as LegacyProject;
  if (Array.isArray(project.tracks)) {
    const tracks = project.tracks.map(normalizeTrack);
    return {
      id: String(project.id ?? uid()),
      title: String(project.title ?? "Untitled video"),
      createdAt: String(project.createdAt ?? new Date().toISOString()),
      brief: String(project.brief ?? ""),
      currentTrackId: project.currentTrackId ?? tracks[0]?.id ?? null,
      currentBeatId: project.currentBeatId ?? project.beats?.[0]?.id ?? null,
      tracks,
      beats: (project.beats ?? []).map(normalizeBeat),
      chat: (project.chat ?? []).map((message) => ({
        id: message.id,
        role: message.role,
        text: message.text,
        at: message.at,
        trackId: message.trackId ?? tracks[0]?.id ?? "",
      })),
    };
  }
  return migrateLegacy(project);
}

export const SAMPLE_IDEA =
  "A late-night diner where creators go to decide whether to quit YouTube or make the video that defines them";

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.map(migrateProject) : [];
  } catch {
    return [];
  }
}

export const PROJECTS_CHANGED = "aempy-projects-changed";

export function saveProjects(projects: Project[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event(PROJECTS_CHANGED));
}

export function upsertProject(project: Project) {
  const projects = loadProjects();
  const index = projects.findIndex((item) => item.id === project.id);
  if (index >= 0) projects[index] = project;
  else projects.unshift(project);
  saveProjects(projects);
}

export function deleteProject(id: string) {
  saveProjects(loadProjects().filter((project) => project.id !== id));
}

export function collectAssetIds(project: Project) {
  const ids: string[] = [];
  for (const track of project.tracks) {
    if (track.audioId) ids.push(track.audioId);
    ids.push(...track.files);
    ids.push(...Object.values(track.thumbs).filter(Boolean));
    for (const scene of track.scenes) {
      if (scene.fileId) ids.push(scene.fileId);
    }
  }
  for (const beat of project.beats ?? []) {
    if (beat.stillFileId) ids.push(beat.stillFileId);
    if (beat.clipFileId) ids.push(beat.clipFileId);
    for (const take of [...beat.stillTakes, ...beat.clipTakes]) {
      if (take.fileId) ids.push(take.fileId);
    }
  }
  return ids;
}
