export const projectStatuses = ["Draft", "Planning", "In Production", "Completed", "On Hold", "Archived"] as const;
export type ProjectStatus = typeof projectStatuses[number];
export type Draft = { id: string; title: string; idea: string; format: string; style: string; createdAt: string; updatedAt?: string; status?: ProjectStatus; cover?: string; tags?: string[]; episodes?: number };
export const projectArt = ["fantasy", "scifi", "action", "historical", "adventure", "cyberpunk", "slice", "drama", "cozy", "comedy"];
