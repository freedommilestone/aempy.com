export const timelineCategories=["Major Events","Wars & Conflicts","Kingdoms & Empires","People","Discoveries","Other"] as const;
export type TimelineCategory=typeof timelineCategories[number];
export type TimelineDetails={year?:number;era?:string;category?:TimelineCategory;calendarDate?:string;relatedIds?:string[];episodeIds?:string[]};
export const yearLabel=(year?:number)=>year===undefined?"Date unknown":year.toLocaleString();
