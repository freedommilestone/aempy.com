import type { WorldEntry } from "./project-types";
export const episodeStages=["Planned","In Development","In Production","Completed"] as const;
export type EpisodeStage=typeof episodeStages[number];
export function episodeStage(entry:WorldEntry):EpisodeStage {
  return entry.episodeStage || (entry.status==="Completed"?"Completed":entry.status==="In progress"?"In Production":"Planned");
}
export type EpisodeTemplate={name:string;length:string;description:string;cover:string;outline:string};
export const episodeTemplates:EpisodeTemplate[]=[
  {name:"Standard Episode",length:"20–30 min",description:"Most common format",cover:"fantasy",outline:"Opening\n\nAct 1 — The setup\n\nAct 2 — The complication\n\nAct 3 — The resolution\n\nClosing hook\n"},
  {name:"Short Episode",length:"10–15 min",description:"Side stories, character focus",cover:"adventure",outline:"A character wants…\n\nSomething stands in the way…\n\nA choice changes things…\n\nClosing moment\n"},
  {name:"Special Episode",length:"30–60 min",description:"Major events, season finale",cover:"historical",outline:"Previously in this world\n\nOpening event\n\nThe stakes rise\n\nThe turning point\n\nClimax\n\nAftermath and new canon to review\n"},
  {name:"Pilot Episode",length:"20–40 min",description:"Introduce your world and cast",cover:"slice",outline:"Meet the protagonist\n\nIntroduce the world\n\nThe inciting incident\n\nA decision to move forward\n\nPromise of the series\n"},
  {name:"Character Episode",length:"15–25 min",description:"Explore a personal journey",cover:"drama",outline:"What this character believes\n\nA relationship under pressure\n\nA difficult choice\n\nWhat changes\n"},
];
