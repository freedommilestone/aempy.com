import type { TimelineDetails } from "./timeline-model";
export const projectStatuses = ["Draft", "Planning", "In Production", "Completed", "On Hold", "Archived"] as const;
export type ProjectStatus = typeof projectStatuses[number];
export type Draft = { id: string; title: string; idea: string; format: string; style: string; createdAt: string; updatedAt?: string; status?: ProjectStatus; cover?: string; tags?: string[]; episodes?: number; workspace?: ProjectWorkspaceData };
export const projectArt = ["fantasy", "scifi", "action", "historical", "adventure", "cyberpunk", "slice", "drama", "cozy", "comedy"];

export type EntryKind = "Episodes" | "Characters" | "Locations" | "Lore" | "Factions" | "Timeline" | "Assets" | "Production";
export type WorldEntry = { id: string; kind: EntryKind; title: string; description: string; status: "Not started" | "In progress" | "Completed"; cover: string; updatedAt: string; timeline?: TimelineDetails; sourceEpisodeId?: string; dueDate?: string; createdAt?: string; episodeStage?: "Planned" | "In Development" | "In Production" | "Completed"; archived?: boolean; episodeTags?: string[]; outline?: string; script?: string; productionProgress?: number; episodeTemplate?: string; characterRole?: CharacterRole; characterState?: "Draft" | "Ready"; characterTraits?: string; characterProfile?: CharacterProfile };
export type ProjectWorkspaceData = { overview?: string; notes?: string; entries?: WorldEntry[]; bibleEntries?: BibleEntry[]; canon?: Record<string, {status: CanonStatus; revision: string}>; activity?: { id: string; text: string; at: string }[] };

export const characterRoles = ["Main Cast", "Supporting", "Minor", "Antagonists"] as const;
export type CharacterRole = typeof characterRoles[number];

export type CharacterProfile = { fullName?: string; race?: string; storyRole?: string; age?: string; affiliation?: string; lifeStatus?: string; specialty?: string; goals?: string; story?: string; relationships?: string; appearances?: string; notes?: string };

export const bibleCategories = ["World", "Characters", "Locations", "Relationships", "Factions", "Lore & History", "Timeline", "Visual Style", "References", "Canon Rules"] as const;
export type BibleCategory = typeof bibleCategories[number];
export const canonStatuses = ["Pending Review", "Confirmed Canon", "Needs Clarification", "Contradictions"] as const;
export type CanonStatus = typeof canonStatuses[number];
export type BibleEntry = {id:string;title:string;description:string;category:BibleCategory;sourceEpisodeId?:string;cover:string;updatedAt:string};
