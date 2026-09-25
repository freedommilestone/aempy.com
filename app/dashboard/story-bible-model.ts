import { type BibleCategory, type Draft, type EntryKind, type WorldEntry } from "./project-types";

export const bibleEntryKinds: Partial<Record<BibleCategory,EntryKind>> = {
  Characters:"Characters", Locations:"Locations", Factions:"Factions", "Lore & History":"Lore", Timeline:"Timeline",
};
export const bibleSections: Record<string,BibleCategory> = {
  Characters:"Characters", Locations:"Locations", Relationships:"Relationships", Factions:"Factions", Lore:"Lore & History", Timeline:"Timeline", "Visual Style":"Visual Style", References:"References",
};
// Preserve IDs (and canon decisions) when consolidating older custom entries.
// Each record remains inside its owning project; no account-wide bible exists.
export function normalizeProjectBible(project:Draft):Draft {
  const entries=[...(project.workspace?.entries||[])];
  const notes=[];
  for(const entry of project.workspace?.bibleEntries||[]){
    const kind=bibleEntryKinds[entry.category];
    if(!kind){notes.push(entry);continue;}
    if(!entries.some(e=>e.id===entry.id)) entries.push({...entry,kind,status:"Not started"} as WorldEntry);
  }
  return {...project,workspace:{...project.workspace,entries,bibleEntries:notes}};
}
