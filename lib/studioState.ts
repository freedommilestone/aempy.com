import {
  applyRecommendation,
  STAGES,
  uid,
  type ChatMessage,
  type Project,
  type ProjectFiles,
  type Scene,
  type StageId,
  type StageVersion,
} from "@/lib/projects";

export function stagePrompt(project: Project, stage: StageId) {
  if (stage === "idea") return project.idea.prompt;
  if (stage === "titles") return project.titles.prompt;
  if (stage === "script") return project.script.prompt;
  if (stage === "voiceover") return project.voiceOver.prompt;
  if (stage === "thumbnail") return project.thumbnail.prompt;
  if (stage === "sound") return project.soundDesign.prompt;
  if (stage === "music") return project.music.prompt;
  if (stage === "description") return project.description.prompt;
  if (stage === "publish") return project.publish.prompt;
  if (stage === "storyboard") {
    return project.scenes
      .map(
        (scene, index) =>
          `PANEL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.storyboardPrompt}`,
      )
      .join("\n\n");
  }
  if (stage === "images") {
    return project.scenes
      .map(
        (scene, index) =>
          `STILL ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.imagePrompt}`,
      )
      .join("\n\n");
  }
  return project.scenes
    .map(
      (scene, index) =>
        `CLIP ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.videoPrompt}`,
    )
    .join("\n\n");
}

export function recsFor(project: Project, stage: StageId) {
  if (stage === "idea") return project.idea.recommendations;
  if (stage === "titles") return project.titles.recommendations;
  if (stage === "script") return project.script.recommendations;
  if (stage === "voiceover") return project.voiceOver.recommendations;
  if (stage === "thumbnail") return project.thumbnail.recommendations;
  if (stage === "sound") return project.soundDesign.recommendations;
  if (stage === "music") return project.music.recommendations;
  if (stage === "description") return project.description.recommendations;
  if (stage === "publish") return project.publish.recommendations;
  if (stage === "storyboard") return project.storyboardRecommendations;
  if (stage === "images") return project.imageRecommendations;
  return project.videoRecommendations;
}

export function stageContent(project: Project, stage: StageId) {
  if (stage === "idea") return project.idea.refined;
  if (stage === "titles") return project.titles.content;
  if (stage === "script") return project.script.content;
  if (stage === "voiceover") return project.voiceOver.content;
  if (stage === "thumbnail") return project.thumbnail.content;
  if (stage === "sound") return project.soundDesign.content;
  if (stage === "music") return project.music.content;
  if (stage === "description") return project.description.content;
  if (stage === "publish") return project.publish.content;
  const kind =
    stage === "storyboard" ? "PANEL" : stage === "images" ? "STILL" : "CLIP";
  return project.scenes
    .map(
      (scene, index) =>
        `${kind} ${String(index + 1).padStart(2, "0")} · ${scene.title}\n${scene.beat}`,
    )
    .join("\n\n");
}

function withTracked(
  project: Project,
  stage: StageId,
  patch: { prompt?: string; content?: string },
): Project {
  function apply<T extends { prompt: string; content: string }>(output: T): T {
    return {
      ...output,
      ...(patch.prompt != null ? { prompt: patch.prompt } : {}),
      ...(patch.content != null ? { content: patch.content } : {}),
    };
  }

  if (stage === "idea") {
    return {
      ...project,
      idea: {
        ...project.idea,
        prompt: patch.prompt ?? project.idea.prompt,
        refined: patch.content ?? project.idea.refined,
      },
    };
  }
  if (stage === "titles") return { ...project, titles: apply(project.titles) };
  if (stage === "script") return { ...project, script: apply(project.script) };
  if (stage === "voiceover") {
    return { ...project, voiceOver: apply(project.voiceOver) };
  }
  if (stage === "thumbnail") {
    return { ...project, thumbnail: apply(project.thumbnail) };
  }
  if (stage === "sound") {
    return { ...project, soundDesign: apply(project.soundDesign) };
  }
  if (stage === "music") return { ...project, music: apply(project.music) };
  if (stage === "description") {
    return { ...project, description: apply(project.description) };
  }
  if (stage === "publish") {
    return { ...project, publish: { ...project.publish, ...apply(project.publish) } };
  }
  return project;
}

function splitPromptBlocks(prompt: string, count: number) {
  const blocks = prompt
    .split(/\n\n(?=(?:PANEL|STILL|CLIP) )/i)
    .map((block) => block.replace(/^(?:PANEL|STILL|CLIP) \d+ · [^\n]+\n?/i, "").trim());
  while (blocks.length < count) blocks.push("");
  return blocks.slice(0, count);
}

export function withStagePrompt(
  project: Project,
  stage: StageId,
  prompt: string,
): Project {
  if (stage === "storyboard" || stage === "images" || stage === "videos") {
    const blocks = splitPromptBlocks(prompt, project.scenes.length);
    return {
      ...project,
      scenes: project.scenes.map((scene, index) => {
        const next = blocks[index] || scene.storyboardPrompt;
        if (stage === "storyboard") return { ...scene, storyboardPrompt: next };
        if (stage === "images") return { ...scene, imagePrompt: next };
        return { ...scene, videoPrompt: next };
      }),
    };
  }
  return withTracked(project, stage, { prompt });
}

export function withStageContent(
  project: Project,
  stage: StageId,
  content: string,
): Project {
  if (stage === "storyboard" || stage === "images" || stage === "videos") {
    return {
      ...project,
      notes: { ...project.notes, [stage]: content },
    };
  }
  return withTracked(project, stage, { content });
}

export function withSceneBeat(
  project: Project,
  sceneId: string,
  beat: string,
): Project {
  return {
    ...project,
    scenes: project.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, beat } : scene,
    ),
  };
}

export function withPromptRefinement(
  project: Project,
  stage: StageId,
  recommendation: string,
): Project {
  if (stage === "storyboard" || stage === "images" || stage === "videos") {
    return {
      ...project,
      scenes: project.scenes.map((scene) => {
        if (stage === "storyboard") {
          return {
            ...scene,
            storyboardPrompt: applyRecommendation(
              scene.storyboardPrompt,
              recommendation,
            ),
          };
        }
        if (stage === "images") {
          return {
            ...scene,
            imagePrompt: applyRecommendation(scene.imagePrompt, recommendation),
          };
        }
        return {
          ...scene,
          videoPrompt: applyRecommendation(scene.videoPrompt, recommendation),
        };
      }),
    };
  }
  return withStagePrompt(
    project,
    stage,
    applyRecommendation(stagePrompt(project, stage), recommendation),
  );
}

export function captureVersion(project: Project, stage: StageId): Project {
  const version: StageVersion = {
    id: uid(),
    at: new Date().toISOString(),
    prompt: stagePrompt(project, stage),
    content: stageContent(project, stage),
    scenes: project.scenes.map((scene) => ({ ...scene })),
    ideaRaw: project.idea.raw,
    ideaRefined: project.idea.refined,
  };
  const existing = project.history[stage] ?? [];
  return {
    ...project,
    history: {
      ...project.history,
      [stage]: [version, ...existing].slice(0, 20),
    },
  };
}

export function restoreVersion(
  project: Project,
  stage: StageId,
  versionId: string,
): Project {
  const version = (project.history[stage] ?? []).find(
    (item) => item.id === versionId,
  );
  if (!version) return project;
  let next = withStagePrompt(project, stage, version.prompt);
  next = withStageContent(next, stage, version.content);
  if (version.scenes) next = { ...next, scenes: version.scenes.map((s) => ({ ...s })) };
  if (stage === "idea") {
    next = {
      ...next,
      idea: {
        ...next.idea,
        raw: version.ideaRaw ?? next.idea.raw,
        refined: version.ideaRefined ?? version.content,
        prompt: version.prompt,
      },
    };
  }
  return next;
}

export function appendChat(
  project: Project,
  message: Omit<ChatMessage, "id" | "at"> & { id?: string; at?: string },
): Project {
  return {
    ...project,
    chat: [
      ...project.chat,
      {
        id: message.id ?? uid(),
        at: message.at ?? new Date().toISOString(),
        role: message.role,
        text: message.text,
        stage: message.stage,
      },
    ],
  };
}

export function remapFiles(from: Project, to: Project): ProjectFiles {
  const files: ProjectFiles = {
    stills: {},
    clips: {},
    thumbs: { ...from.files.thumbs },
    voiceOver: from.files.voiceOver,
  };
  from.scenes.forEach((scene, index) => {
    const next = to.scenes[index];
    if (!next) return;
    if (from.files.stills[scene.id]) files.stills[next.id] = from.files.stills[scene.id];
    if (from.files.clips[scene.id]) files.clips[next.id] = from.files.clips[scene.id];
  });
  return files;
}

export function stageLabel(stage: StageId) {
  return STAGES.find((item) => item.id === stage)?.label ?? stage;
}

export type ProjectBackup = {
  v: 1;
  project: Project;
  files: Record<string, string>;
};
