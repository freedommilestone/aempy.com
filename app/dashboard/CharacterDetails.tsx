"use client";
import { useState } from "react";
import { Icon } from "./StudioBrand";
import { projectArt, type WorldEntry } from "./project-types";
export const characterImage = (entry: WorldEntry) => `/images/generated/${projectArt.includes(entry.cover) ? entry.cover : "action"}.webp`;
const sections = ["Overview", "Story", "Relationships", "Appearances", "Notes"];
export default function CharacterDetails({character,onEdit}:{character:WorldEntry;onEdit:(entry:WorldEntry)=>void}) {
  const [section,setSection]=useState("Overview");
  const profile=character.characterProfile || {};
  const traits=(character.characterTraits||"").split(",").map(s=>s.trim()).filter(Boolean);
  const goals=(profile.goals||"").split("\n").map(s=>s.trim()).filter(Boolean);
  const text=section==="Story"?profile.story:section==="Relationships"?profile.relationships:section==="Appearances"?profile.appearances:profile.notes;
  return <aside className="character-detail" aria-label={`Character details: ${character.title}`}>
    <div className="character-detail-image"><img src={characterImage(character)} alt=""/><button className="project-secondary" onClick={()=>onEdit(character)} aria-label={`Edit ${character.title}`}><Icon name="Edit" size={15}/> Edit</button></div>
    <div className="character-detail-title"><h2>{character.title}</h2><div className="character-tag-list">{[profile.storyRole,profile.race,profile.specialty].filter(Boolean).map((tag,i)=><span key={i}>{tag}</span>)}</div></div>
    <div className="character-detail-tabs" role="tablist" aria-label="Character details">{sections.map(name=><button key={name} role="tab" aria-selected={section===name} tabIndex={section===name?0:-1} onClick={()=>setSection(name)} onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const index=(sections.indexOf(name)+(e.key==="ArrowRight"?1:sections.length-1))%sections.length;setSection(sections[index]);(e.currentTarget.parentElement?.children[index] as HTMLElement)?.focus();}}}>{name}</button>)}</div>
    <div className="character-detail-panel" role="tabpanel" aria-label={section}>{section==="Overview"?<><dl className="character-facts">{[["Full Name",profile.fullName||character.title],["Race",profile.race],["Role",profile.storyRole||character.characterRole||"Supporting"],["Age",profile.age],["Affiliation",profile.affiliation],["Status",profile.lifeStatus]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value || "Not set"}</dd></div>)}</dl><section><h3>Description</h3><p>{character.description||"Add a description to introduce this character."}</p></section><section><h3>Personality</h3>{traits.length?<div className="character-tag-list">{traits.map((trait,i)=><span key={i}>{trait}</span>)}</div>:<p className="character-detail-placeholder">Add traits to describe their personality.</p>}</section><section><h3>Goals</h3>{goals.length?<ul>{goals.map((goal,i)=><li key={i}>{goal}</li>)}</ul>:<p className="character-detail-placeholder">What does this character want? Add their goals.</p>}</section></>:<section><h3>{section}</h3><p className={!text?"character-detail-placeholder":""}>{text || `No ${section.toLowerCase()} added yet.`}</p><button className="character-detail-add" onClick={()=>onEdit(character)}>{text?"Edit":"Add"} {section}</button></section>}</div>
  </aside>;
}
