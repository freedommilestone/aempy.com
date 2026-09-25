"use client";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { Icon, Logo } from "./StudioBrand";
import { logout } from "../login/actions";
import { projectArt, type Draft } from "./project-types";

export const studioGroups = [
  {label:"",items:["Home","Create","Projects"]},
  {label:"LIBRARY",items:["Assets","Templates","Community"]},
];
const projectGroups = [
  {label:"",items:["Overview","Episodes","Story Bible"]},
  {label:"PRODUCTION",items:["Storyboard","Production","Edit"]},
  {label:"LIBRARY",items:["Assets"]},
];
const bibleLinks = ["Characters","Locations","Relationships","Factions","Lore","Timeline","Visual Style","References"];
export const projectSections = ["Overview","Story Bible","Characters","Locations","Relationships","Factions","Lore","Timeline","Episodes","Storyboard","Production","Edit","Export","Assets","Settings","Activity","Analytics","Team","Visual Style","References"];
export const sectionHash = (name:string) => name.toLowerCase().replaceAll(" ","-");
export function rememberProject(id:string) { try {localStorage.setItem("aempy-active-project",id);window.dispatchEvent(new Event("aempy-active-project-change"));}catch{/* Opening a project does not require storage. */} }
export default function StudioSidebar({section,open,onClose,onNavigate,project,projects}:{section:string;open:boolean;onClose:()=>void;onNavigate:(name:string)=>void;project?:Draft|null;projects?:Draft[]}) {
  // Only the project route can provide project context. A remembered project never
  // changes the global sidebar or the destination of the global asset library.
  const active=project||null;
  const [bibleOpen,setBibleOpen]=useState(true);
  const inBible=section==="Story Bible"||bibleLinks.includes(section);
  useEffect(()=>{if(section==="Story Bible"||bibleLinks.includes(section))setBibleOpen(true);},[section,active?.id]);
  const base=active?`/dashboard/projects/${encodeURIComponent(active.id)}`:null;
  function href(name:string){if(name==="Home")return "/";if(name==="Create")return "/dashboard";if(name==="Projects")return "/dashboard/projects";if(base&&projectSections.includes(name))return `${base}#${sectionHash(name)}`;return `/dashboard#${sectionHash(name)}`;}
  function click(e:MouseEvent<HTMLAnchorElement>,name:string){if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(name==="Story Bible")setBibleOpen(true);onClose();const target=new URL(e.currentTarget.href);if(target.pathname===window.location.pathname&&target.pathname!=="/"){e.preventDefault();onNavigate(target.pathname==="/dashboard/projects"?"Projects":name);}}
  function item(name:string){return <Link key={name} href={href(name)} className={section===name?"selected":""} aria-current={section===name?"page":undefined} onClick={e=>click(e,name)}><Icon name={name==="Episodes"?"Production":name==="Overview"||name==="Settings"?"Timeline":name}/><span>{name}</span>{name==="Projects"&&!!projects?.length&&<small>{projects.length}</small>}</Link>;}
  function navigationItem(name:string) {
    if(!active||name!=="Story Bible")return item(name);
    return <div className="studio-bible-group" key={name}>
      <div className={`studio-bible-heading ${inBible?"contains-current":""}`}>{item(name)}<button type="button" className="studio-bible-toggle" aria-label={bibleOpen?"Collapse Story Bible":"Expand Story Bible"} aria-expanded={bibleOpen} aria-controls="studio-bible-sections" onClick={()=>setBibleOpen(v=>!v)}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div>
      <div id="studio-bible-sections" className="studio-bible-children" hidden={!bibleOpen}>{bibleLinks.map(item)}</div>
    </div>;
  }
  return <>{open&&<button className="studio-scrim" aria-label="Close navigation" onClick={onClose}/>}<aside className={`studio-sidebar ${open?"open":""}`}><Logo/><nav aria-label="Studio navigation">{active&&<><Link className="studio-back-projects" href="/dashboard/projects" onClick={onClose}>‹ All Projects</Link><div className="studio-project-context"><p>{active.title}</p><div className="studio-project-row"><Link href={`${base}#overview`} className="studio-project-link" aria-label={`Open project: ${active.title}`} onClick={e=>click(e,"Overview")}><img src={`/images/generated/${projectArt.includes(active.cover||"")?active.cover:"fantasy"}.webp`} alt=""/><span>{active.title}</span></Link><Link href={`${base}#settings`} className="studio-project-settings" aria-label="Project settings" onClick={e=>click(e,"Settings")}><Icon name="Timeline" size={15}/></Link></div></div></>}{(active?projectGroups:studioGroups).map((group,index)=><div className="nav-group" key={index}>{group.label&&<p>{group.label}</p>}{group.items.map(navigationItem)}</div>)}</nav><div className="studio-plan"><form action={logout}><button className="studio-signout" type="submit">Log out <Icon name="Export" size={14}/></button></form><div><Icon name="Check" size={21}/><span>Your creative space</span></div><p>Projects saved in this browser</p></div></aside></>;
}
