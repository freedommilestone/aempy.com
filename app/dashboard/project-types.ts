export const projectStatuses = ["Draft", "Planning", "In Production", "Completed", "On Hold", "Archived"] as const;
export type ProjectStatus = typeof projectStatuses[number];
export type Draft = { id: string; title: string; idea: string; format: string; style: string; createdAt: string; updatedAt?: string; status?: ProjectStatus; cover?: string; tags?: string[]; episodes?: number; workspace?: ProjectWorkspaceData };
export const projectArt = ["fantasy", "scifi", "action", "historical", "adventure", "cyberpunk", "slice", "drama", "cozy", "comedy"];

export type EntryKind = "Episodes" | "Characters" | "Locations" | "Lore" | "Factions" | "Timeline" | "Assets" | "Production";
export type WorldEntry = { id: string; kind: EntryKind; title: string; description: string; status: "Not started" | "In progress" | "Completed"; cover: string; updatedAt: string; characterRole?: CharacterRole; characterState?: "Draft" | "Ready"; characterTraits?: string; characterProfile?: CharacterProfile };
export type ProjectWorkspaceData = { overview?: string; notes?: string; entries?: WorldEntry[]; activity?: { id: string; text: string; at: string }[] };

export const characterRoles = ["Main Cast", "Supporting", "Minor", "Antagonists"] as const;
export type CharacterRole = typeof characterRoles[number];

export type CharacterProfile = { fullName?: string; race?: string; storyRole?: string; age?: string; affiliation?: string; lifeStatus?: string; specialty?: string; goals?: string; story?: string; relationships?: string; appearances?: string; notes?: string };
