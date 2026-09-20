export const STAGES = [
  { id: "idea", label: "Idea", number: "01" },
  { id: "titles", label: "Title", number: "02" },
  { id: "script", label: "Script", number: "03" },
  { id: "voiceover", label: "Voice over", number: "04" },
  { id: "storyboard", label: "Storyboard", number: "05" },
  { id: "images", label: "Scene images", number: "06" },
  { id: "thumbnail", label: "Thumbnail", number: "07" },
  { id: "videos", label: "Scene videos", number: "08" },
  { id: "sound", label: "Sound design", number: "09" },
  { id: "music", label: "Music", number: "10" },
  { id: "description", label: "Description", number: "11" },
  { id: "publish", label: "Publish", number: "12" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export type Scene = {
  id: string;
  title: string;
  beat: string;
  camera?: string;
  storyboardPrompt: string;
  imagePrompt: string;
  videoPrompt: string;
};

export type TrackedOutput = {
  content: string;
  prompt: string;
  recommendations: string[];
};

export type PublishCheck = {
  id: string;
  label: string;
  done: boolean;
};

export type PublishOutput = TrackedOutput & {
  checks: PublishCheck[];
};

export type Project = {
  id: string;
  title: string;
  createdAt: string;
  currentStage: StageId;
  idea: {
    raw: string;
    refined: string;
    prompt: string;
    recommendations: string[];
  };
  titles: TrackedOutput;
  script: TrackedOutput;
  voiceOver: TrackedOutput;
  scenes: Scene[];
  storyboardRecommendations: string[];
  imageRecommendations: string[];
  videoRecommendations: string[];
  thumbnail: TrackedOutput;
  soundDesign: TrackedOutput;
  music: TrackedOutput;
  description: TrackedOutput;
  publish: PublishOutput;
};

const STORAGE_KEY = "aempy-projects";

function migrateProject(project: Project): Project {
  const scenes = project.scenes.map((scene) => {
    const needsSplit =
      !scene.storyboardPrompt &&
      Boolean(scene.imagePrompt?.startsWith("Storyboard panel"));
    const storyboardPrompt =
      scene.storyboardPrompt ||
      (needsSplit
        ? scene.imagePrompt
        : `Storyboard panel. Shot: ${scene.title}. Camera: ${scene.camera ?? "16:9"}. Action: ${scene.beat}`);
    const imagePrompt = needsSplit
      ? `Photoreal cinematic still, 16:9, matching the storyboard. Shot: ${scene.title}. Camera: ${scene.camera ?? "16:9"}. Action: ${scene.beat} No text, no watermark.`
      : scene.imagePrompt;
    return {
      ...scene,
      storyboardPrompt,
      imagePrompt,
    };
  });

  const known = STAGES.some((stage) => stage.id === project.currentStage);
  const currentStage: StageId = known
    ? project.currentStage === "images" && !project.storyboardRecommendations
      ? "storyboard"
      : project.currentStage
    : "idea";
  const subject = project.idea?.raw || project.title;

  const defaultStoryboardRecs = [
    "Keep all four panels the same aspect ratio and character design so the board reads as one episode.",
    "If a panel is unclear, rewrite the action in one sentence: who does what, in which direction.",
    "Match the closer's camera to the cold open so the storyboard loops.",
  ];
  const defaultImageRecs = [
    "Match each still to its storyboard panel — same camera, wardrobe, and location.",
    "Keep faces readable at mobile size — YouTube is watched in a small frame.",
    "If a still feels generic, add one specific prop from the script and regenerate only that scene.",
  ];

  const storyboardRecommendations =
    project.storyboardRecommendations ??
    (project.imageRecommendations?.some((item) => /panel/i.test(item))
      ? project.imageRecommendations
      : defaultStoryboardRecs);
  const imageLooksLikeBoard = project.imageRecommendations?.some(
    (item) => /panel/i.test(item) && !/still to its storyboard/i.test(item),
  );
  const imageRecommendations = imageLooksLikeBoard
    ? defaultImageRecs
    : (project.imageRecommendations ?? defaultImageRecs);

  return {
    ...project,
    currentStage,
    scenes,
    storyboardRecommendations,
    imageRecommendations,
    voiceOver: project.voiceOver ?? voiceOverFor(subject),
    soundDesign: project.soundDesign ?? soundDesignFor(subject),
    music: project.music ?? musicFor(subject),
    titles: project.titles ?? titlesFor(subject),
    thumbnail: project.thumbnail ?? thumbnailFor(subject),
    description: project.description ?? descriptionFor(subject),
    publish: project.publish ?? publishFor(subject),
  };
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function titleFromIdea(idea: string) {
  const words = idea.replace(/\s+/g, " ").trim().split(" ").slice(0, 8).join(" ");
  if (!words) return "Untitled video";
  return words.length > 52 ? `${words.slice(0, 52)}…` : words;
}

function voiceOverFor(subject: string): TrackedOutput {
  return {
    content: [
      "VOICE OVER — dry read, close mic, intimate, no room reverb",
      "",
      "COLD OPEN",
      `"Don't quit tonight."`,
      "",
      "TURN",
      `We came here because of: ${subject}. One choice. The diner already knows.`,
      "",
      "PROOF",
      "Stay for the work. Stay for the scene you have not made yet.",
      "",
      "CLOSER",
      "If this is the last video, make it the one they remember. If it is not — even better.",
    ].join("\n"),
    prompt: `Write a YouTube voice-over read from this episode. Short sentences. Conversational, cinematic, no sponsor energy. Mark breaths. Concept: ${subject}`,
    recommendations: [
      "Cut any line the picture already says. VO should add subtext, not captions.",
      "Record the cold-open line as a whisper-close take so the hook feels private.",
      "Leave 0.4s of air before the closer so music can enter underneath.",
    ],
  };
}

function soundDesignFor(subject: string): TrackedOutput {
  return {
    content: [
      "SOUND DESIGN — diegetic first, score second",
      "",
      "COLD OPEN: neon buzz, distant highway, one ceramic cup set down.",
      "TURN: door chime, leather booth, a lighter that does not catch.",
      "PROOF: notebook pages, rain on glass, muffled kitchen pass.",
      `CLOSER: the room rings out. ${subject} sits in the silence for a beat, then the diner returns.`,
      "",
      "Beds: 60Hz fridge hum. Hits: cup, chime, lighter. No stock whooshes.",
    ].join("\n"),
    prompt: `Design a YouTube sound bed for this episode. List diegetic FX, room tone, and one signature sound per beat. No trailer whooshes. Story: ${subject}`,
    recommendations: [
      "Give each beat one signature sound so the mix is memorable, not busy.",
      "Duck FX 2dB under VO; never compete with consonants.",
      "Build a 1-second tail into the closer so music can take the last word.",
    ],
  };
}

function musicFor(subject: string): TrackedOutput {
  return {
    content: [
      "MUSIC — sparse, nocturnal, analog",
      "",
      "Theme: slow minor-key Rhodes + muted guitar. 72 BPM. No lyrics.",
      "OPEN: enter at 0:03 under the first VO breath, -18 LUFS.",
      "TURN: add a two-note bass figure when the door chime hits.",
      "PROOF: pull drums (if any) — leave keys and room.",
      "CLOSER: resolve to a held fourth. End dry. No big swell.",
      "",
      `Mood reference: late diner, ${subject}, hope without triumph.`,
    ].join("\n"),
    prompt: `Compose a YouTube underscore for this episode. Instrumental, 70–80 BPM, nocturnal, no lyrics, cue points for cold open, turn, proof, closer. Story: ${subject}`,
    recommendations: [
      "Keep the theme under the VO. If you cannot hear the words, the cue is too loud.",
      "Avoid a trailer swell on the closer — resolve small.",
      "Reuse one motif from the open in the last four bars so the episode feels finished.",
    ],
  };
}

function titlesFor(subject: string): TrackedOutput {
  const working = titleFromIdea(subject);
  return {
    content: [
      "WORKING TITLE + ALTS — pick one before you design the thumbnail",
      "",
      `A. ${working}`,
      "B. Don't Quit Tonight — The Diner Cut",
      "C. The Video That Decides If You Stay",
      "D. One Booth. One Choice. One Episode.",
      "",
      "Rules: under 60 characters if possible. Curiosity, not clickbait. Match the thumbnail face/object.",
    ].join("\n"),
    prompt: `Write 6 YouTube titles for this episode. Mix curiosity and specificity. Under 70 characters. No all-caps, no year spam. Concept: ${subject}`,
    recommendations: [
      "Lead with the emotion or the choice, not the format (\"my story\").",
      "Test one title that names the place or object from the cold open.",
      "If the title needs a subtitle, put the subtitle in the first description line instead.",
    ],
  };
}

function thumbnailFor(subject: string): TrackedOutput {
  return {
    content: [
      "THUMBNAIL — 1280×720, face or object readable at mobile size",
      "",
      "A. Face in the booth, neon red, 3-word overlay: DON'T QUIT.",
      "B. Empty diner, one lit booth, no text — title does the talking.",
      "C. Close-up notebook \"Episode 1\", hand mid-write, high contrast.",
      "",
      `Pull the still from scene images. Story: ${subject}`,
      "Safe zone: keep the subject out of YouTube's timestamp corner.",
    ].join("\n"),
    prompt: `Design 3 YouTube thumbnails for this episode, 1280x720. High contrast, one focal point, max 3 words of text, readable at 160px wide. Match the storyboard stills. Story: ${subject}`,
    recommendations: [
      "Never put more than three words on the image. The title already talks.",
      "Export a version with no text in case you A/B test later.",
      "Match the thumbnail's color to the cold-open still so the click feels honest.",
    ],
  };
}

function descriptionFor(subject: string): TrackedOutput {
  return {
    content: [
      "YOUTUBE DESCRIPTION",
      "",
      `First line (search + pinned): A late-night episode about ${subject}.`,
      "",
      "0:00 Cold open",
      "0:08 The turn",
      "0:45 The proof",
      "2:30 The closer",
      "",
      "What this is",
      "A cinematic YouTube story — not a recap. If you are deciding whether to keep making videos, this one is for you.",
      "",
      "Links",
      "Next episode →",
      "Studio notes → aempy.com/studio",
      "",
      "Tags",
      "youtube creator, filmmaking, storytelling, late night, diner, creative block",
    ].join("\n"),
    prompt: `Write a YouTube description for this episode: hook line, timestamps/chapters, 2-sentence summary, links, and 8 tags. No keyword stuffing. Concept: ${subject}`,
    recommendations: [
      "Put the search sentence in line one. YouTube truncates fast.",
      "Chapters must match the VO beats or they feel like a lie.",
      "Repeat the working title's phrasing once so search and packaging agree.",
    ],
  };
}

function publishFor(subject: string): PublishOutput {
  return {
    content: [
      "PUBLISH CHECKLIST",
      `Episode: ${subject}`,
      "",
      "Lock title + thumbnail together. Captions before premiere. End screen on the last 5 seconds. Pin a comment that asks one question.",
    ].join("\n"),
    prompt: `Create a YouTube upload checklist for this episode covering captions, chapters, tags, playlist, end screen, cards, pinned comment, and schedule. Concept: ${subject}`,
    recommendations: [
      "Don't schedule until captions and the thumbnail are final.",
      "End screen should point to the next episode in the series, not a random upload.",
      "Pin a comment that continues the closer's question — that is the community tab in miniature.",
    ],
    checks: [
      { id: "title", label: "Title locked with the thumbnail", done: false },
      { id: "thumb", label: "Thumbnail uploaded (1280×720)", done: false },
      { id: "captions", label: "Captions / auto-captions reviewed", done: false },
      { id: "chapters", label: "Chapters match the description", done: false },
      { id: "tags", label: "Tags and playlist set", done: false },
      { id: "endscreen", label: "End screen + cards (last 5 seconds)", done: false },
      { id: "pin", label: "Pinned comment drafted", done: false },
      { id: "schedule", label: "Premiere or schedule time set", done: false },
    ],
  };
}

function sceneBeats(subject: string): Scene[] {
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

  return beats.map((beat, index) => ({
    id: `scene-${index + 1}`,
    title: beat.title,
    beat: beat.beat,
    camera: beat.camera,
    storyboardPrompt: `Storyboard panel ${index + 1} of 4, 16:9, clean production sketch. Story: ${subject}. Shot: ${beat.title}. Camera: ${beat.camera}. Action: ${beat.beat} Same character continuity across panels. No photoreal render, no text, no watermark.`,
    imagePrompt: `Photoreal cinematic still, 16:9 YouTube frame, matching storyboard panel ${index + 1}. Story: ${subject}. Shot: ${beat.title}. Camera: ${beat.camera}. Action: ${beat.beat} Motivated practical light, shallow depth of field, grounded wardrobe, continuity of character and location, film grain, no text, no watermark.`,
    videoPrompt: `5–8 second cinematic clip, 16:9, 24fps, matching scene image ${index + 1} and storyboard panel ${index + 1}. Story: ${subject}. Beat: ${beat.title} — ${beat.beat} Camera: ${beat.camera}. Ambient world sound, no jump cuts, no on-screen text, no watermark.`,
  }));
}

export function buildProject(rawIdea: string): Project {
  const raw = rawIdea.trim();
  const subject = raw || "an untold YouTube story";
  const scenes = sceneBeats(subject);

  return {
    id: uid(),
    title: titleFromIdea(raw),
    createdAt: new Date().toISOString(),
    currentStage: "idea",
    idea: {
      raw,
      refined: `${subject.charAt(0).toUpperCase()}${subject.slice(1)} — told as a short cinematic episode: cold open, turn, proof, closer. Built for YouTube retention, not a talking-head recap.`,
      prompt: `You are a YouTube showrunner. Turn this creator idea into one iconic episode concept with a hook, protagonist, conflict, and ending image. Keep it specific and filmable. Idea: ${subject}`,
      recommendations: [
        "Name the viewer in the first line: who this episode is for, and why they should stay.",
        "Make the conflict visible on screen — not only described in voiceover.",
        "Write one signature image the audience could screenshot and remember.",
      ],
    },
    script: {
      content: [
        `TITLE: ${titleFromIdea(raw)}`,
        "",
        "COLD OPEN (0:00–0:08)",
        `We open on the world of: ${subject}. No intro bumper. One image, one sound, one question.`,
        "",
        "TURN (0:08–0:45)",
        "The complication arrives. The creator (or character) has to choose. Hold the camera a beat too long.",
        "",
        "PROOF (0:45–2:30)",
        "Scene-by-scene evidence. Each cut earns the next. Voiceover only when the picture cannot say it.",
        "",
        "CLOSER (2:30–end)",
        "Pay off the opening image. Invite the next episode with a leftover question, not a generic subscribe line.",
      ].join("\n"),
      prompt: `Write a YouTube video script from this episode concept. Structure: cold open, turn, proof, closer. Include spoken lines and visual directions. Concept: ${subject}`,
      recommendations: [
        "Cut any sentence that restates what the picture already shows.",
        "Put a pattern interrupt (a new location, object, or question) before the 30-second mark.",
        "End on a visual callback to the cold open so the episode feels designed, not compiled.",
      ],
    },
    scenes,
    storyboardRecommendations: [
      "Keep all four panels the same aspect ratio and character design so the board reads as one episode.",
      "If a panel is unclear, rewrite the action in one sentence: who does what, in which direction.",
      "Match the closer's camera to the cold open so the storyboard loops.",
    ],
    imageRecommendations: [
      "Match each still to its storyboard panel — same camera, wardrobe, and location.",
      "Keep faces readable at mobile size — YouTube is watched in a small frame.",
      "If a still feels generic, add one specific prop from the script and regenerate only that scene.",
    ],
    videoRecommendations: [
      "Match each clip's first frame to its scene image so the edit can intercut without a style break.",
      "Keep clips under eight seconds; YouTube pacing dies in long generative takes.",
      "Regenerate with a slower push-in if motion looks floaty or video-game smooth.",
    ],
    voiceOver: voiceOverFor(subject),
    soundDesign: soundDesignFor(subject),
    music: musicFor(subject),
    titles: titlesFor(subject),
    thumbnail: thumbnailFor(subject),
    description: descriptionFor(subject),
    publish: publishFor(subject),
  };
}

export const SAMPLE_IDEA =
  "A late-night diner where creators go to decide whether to quit YouTube or make the video that defines them";

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? parsed.map(migrateProject) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
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

export function nextStage(stage: StageId): StageId | null {
  const index = STAGES.findIndex((item) => item.id === stage);
  return STAGES[index + 1]?.id ?? null;
}

export function applyRecommendation(text: string, recommendation: string) {
  const note = `Refinement: ${recommendation}`;
  if (text.includes(note)) return text;
  return `${text.trim()}\n\n${note}`;
}

export function stageIndex(stage: StageId) {
  return STAGES.findIndex((item) => item.id === stage);
}
