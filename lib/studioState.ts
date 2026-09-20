import {
  applyRecommendation,
  patchTrack,
  uid,
  type ChatMessage,
  type Project,
  type Scene,
  type Track,
  type TrackVersion,
} from "@/lib/projects";

export function captureVersion(project: Project, trackId: string): Project {
  return patchTrack(project, trackId, (track) => {
    const version: TrackVersion = {
      id: uid(),
      at: new Date().toISOString(),
      prompt: track.prompt,
      content: track.content,
      scenes: track.scenes.map((scene) => ({ ...scene })),
    };
    return {
      ...track,
      history: [version, ...track.history].slice(0, 20),
    };
  });
}

export function restoreVersion(
  project: Project,
  trackId: string,
  versionId: string,
): Project {
  return patchTrack(project, trackId, (track) => {
    const version = track.history.find((item) => item.id === versionId);
    if (!version) return track;
    return {
      ...track,
      prompt: version.prompt,
      content: version.content,
      scenes: version.scenes?.map((scene) => ({ ...scene })) ?? track.scenes,
    };
  });
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
        trackId: message.trackId,
      },
    ],
  };
}

export function withPromptRefinement(
  project: Project,
  trackId: string,
  recommendation: string,
): Project {
  return patchTrack(project, trackId, (track) => ({
    ...track,
    prompt: applyRecommendation(track.prompt, recommendation),
  }));
}

export function addScene(project: Project, trackId: string): Project {
  const scene: Scene = {
    id: uid(),
    title: "New beat",
    beat: "",
    prompt: "",
  };
  return patchTrack(project, trackId, (track) => ({
    ...track,
    scenes: [...track.scenes, scene],
  }));
}

export function removeScene(
  project: Project,
  trackId: string,
  sceneId: string,
): Project {
  return patchTrack(project, trackId, (track) => ({
    ...track,
    scenes: track.scenes.filter((scene) => scene.id !== sceneId),
  }));
}

export function patchScene(
  project: Project,
  trackId: string,
  sceneId: string,
  patch: Partial<Scene>,
): Project {
  return patchTrack(project, trackId, (track) => ({
    ...track,
    scenes: track.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, ...patch } : scene,
    ),
  }));
}

export function trackById(project: Project, trackId: string | null) {
  return project.tracks.find((track) => track.id === trackId) ?? null;
}

export function chatContentFor(track: Track) {
  if (track.kind === "storyboard" || track.kind === "images" || track.kind === "videos") {
    return track.content;
  }
  return track.content;
}

export type ProjectBackup = {
  v: 1;
  project: Project;
  files: Record<string, string>;
};
