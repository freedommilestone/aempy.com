import { blobToDataUrl, dataUrlToBlob, getAsset, putAsset } from "@/lib/assets";
import { uid, upsertProject, migrateProject, type Project } from "@/lib/projects";
import type { ProjectBackup } from "@/lib/studioState";

export async function downloadProjectBackup(project: Project) {
  const files: Record<string, string> = {};
  const ids = [
    ...Object.values(project.files.stills),
    ...Object.values(project.files.clips),
    ...Object.values(project.files.thumbs),
    project.files.voiceOver,
  ].filter(Boolean) as string[];
  for (const assetId of ids) {
    const blob = await getAsset(assetId);
    if (blob) files[assetId] = await blobToDataUrl(blob);
  }
  const backup: ProjectBackup = { v: 1, project, files };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.title.replace(/\s+/g, "-").slice(0, 40)}-aempy.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProjectBackup(file: File) {
  const parsed = JSON.parse(await file.text()) as ProjectBackup | Project;
  const backup: ProjectBackup =
    "v" in parsed && parsed.v === 1
      ? parsed
      : { v: 1, project: parsed as Project, files: {} };
  const project = migrateProject({
    ...backup.project,
    id: uid(),
    createdAt: new Date().toISOString(),
  });
  for (const [assetId, dataUrl] of Object.entries(backup.files ?? {})) {
    await putAsset(assetId, await dataUrlToBlob(dataUrl));
  }
  upsertProject(project);
  return project.id;
}
