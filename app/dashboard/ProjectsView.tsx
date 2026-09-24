"use client";
import DeleteProjectControl, { withoutProject } from "./DeleteProjectControl";
import { useEffect, useRef, useState } from "react";
import { Draft, ProjectStatus, projectArt, projectStatuses } from "./project-types";

const image = (name: string) => `/images/generated/${name}.webp`;
const tabs = ["All Projects", "In Production", "Drafts", "Completed", "Archived"];
function Arrow() { return <span aria-hidden="true">→</span>; }
function relativeDate(value: string) { const days = Math.max(0, Math.floor((Date.now()-Date.parse(value))/86400000)); return !Number.isFinite(days) ? "Recently" : days === 0 ? "Today" : days === 1 ? "1 day ago" : days < 7 ? `${days} days ago` : `${Math.floor(days/7)} ${days < 14 ? "week" : "weeks"} ago`; }

type Props = { projects: Draft[]; loaded: boolean; query: string; onCreate: () => void; onOpen: (draft: Draft) => void; onChange: (projects: Draft[]) => boolean; onClearSearch: () => void };
export default function ProjectsView({ projects, loaded, query, onCreate, onOpen, onChange, onClearSearch }: Props) {
  const [tab, setTab] = useState("All Projects");
  const [sort, setSort] = useState("updated");
  const [view, setView] = useState("grid");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Draft");
  const [cover, setCover] = useState("fantasy");
  const [importing, setImporting] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [story, setStory] = useState("");
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const importDialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => { editing ? dialog.current?.showModal() : dialog.current?.close(); }, [editing]);
  useEffect(() => { importing ? importDialog.current?.showModal() : importDialog.current?.close(); }, [importing]);
  function edit(project: Draft) { setNotice("");setEditing(project);setTitle(project.title);setStatus(project.status || "Draft");setCover(project.cover || "fantasy"); }
  function saveEdit() {
    if (!editing || !title.trim()) return;
    const next = projects.map(p => p.id === editing.id ? {...p,title:title.trim(),status,cover,updatedAt:new Date().toISOString()} : p);
    if (onChange(next)) { setEditing(null);setNotice("Project updated."); } else setNotice("Browser storage is unavailable. Your previous project is unchanged.");
  }
  function deleteProject() {
    if (!editing) return false;
    if (!onChange(withoutProject(editing.id))) return false;
    setEditing(null);setNotice("Project deleted.");return true;
  }
  async function readFile(file?: File) {
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name) || file.size > 1024*1024) { setNotice("Choose a .txt or .md story file smaller than 1 MB.");return; }
    try { const text=await file.text(); if(text.length>50000){setNotice("Keep imported stories under 50,000 characters.");return;}setStory(text);if(!storyTitle)setStoryTitle(file.name.replace(/\.(txt|md)$/i,""));setNotice(""); } catch {setNotice("We couldn’t read that file. Try pasting your story instead.");}
  }
  function importStory() {
    if(!story.trim() || !storyTitle.trim())return;
    const now=new Date().toISOString();
    const draft: Draft={id:crypto.randomUUID(),title:storyTitle.trim(),idea:story.trim(),format:"Existing Story",style:"Not selected",createdAt:now,updatedAt:now,status:"Draft",cover:"fantasy"};
    if(onChange([draft,...projects])) {setImporting(false);setStory("");setStoryTitle("");setTab("All Projects");onClearSearch();setNotice("Story imported. Your new draft is saved in this browser.");} else setNotice("Browser storage is unavailable. Copy your story somewhere safe and try again.");
  }
  const filtered=projects.filter(p=>{
    const s=p.status||"Draft";
    const matches=tab==="All Projects" ? s!=="Archived" : tab==="Drafts" ? s==="Draft" : s===tab;
    return matches && `${p.title} ${p.idea} ${p.format} ${p.style} ${(p.tags||[]).join(" ")}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a,b)=>sort==="name" ? a.title.localeCompare(b.title) : (Date.parse(sort==="created"?b.createdAt:b.updatedAt||b.createdAt)||0)-(Date.parse(sort==="created"?a.createdAt:a.updatedAt||a.createdAt)||0));
  const empty=projects.length===0;
  return <div className={`projects-page ${empty ? "first-project" : "has-projects"}`}>
    <section className="projects-hero"><h1>My Projects</h1><h2>{empty ? "Your first world starts here." : "Your worlds. Your stories. Bring them to life."}</h2>{empty && <p>Start with a few sentences. Shape your idea into characters,<br className="projects-desktop-break"/> locations, lore, scenes, and a story you can bring to life.</p>}<blockquote>{empty ? <>“Every great story<br/>begins with a single idea.”</> : <>“Different worlds.<br/>Same endless possibilities.”</>}</blockquote></section>
    {!loaded ? <div className="projects-loading" role="status">Opening your worlds…</div> : empty ? <>
      <section className="first-world-card">
        <div className="first-world-copy"><span className="new-creator-badge"><span aria-hidden="true">✦</span> New to Aempy?</span><h2>Create Your First Project</h2><p>Have an idea? That’s all you need.</p><div className="first-world-actions"><button className="project-primary" onClick={onCreate}>Create a New World <Arrow/></button><div className="project-or"><span/>or<span/></div><button className="project-secondary" onClick={()=>setImporting(true)}><span aria-hidden="true">▤</span> Bring an Existing Story</button></div><ul className="supported-formats">{["TV Series","Animated Series","Film","Novel","Game"].map(f=><li key={f}><span aria-hidden="true">✓</span>{f}</li>)}</ul></div><p className="first-world-script">Same idea.<br/>New worlds.</p>
      </section>
      <section className="project-onboarding" aria-label="How to begin">{[["1","Share your idea","A simple idea, a scene, or even a feeling. Start with whatever you’re imagining.","◌"],["2","Build your world","Bring together your characters, locations, lore, and the foundations of your story.","✦"],["3","You decide what becomes canon","Review, refine, and make it yours. Then start shaping episodes, scenes, or content.","☷"]].map(([number,label,description,icon])=><article key={number}><span className="onboarding-number">{number}</span><div><span className="onboarding-icon" aria-hidden="true">{icon}</span><h3>{label}</h3><p>{description}</p></div></article>)}</section><div className="projects-closing"><span/><p>Different worlds. Same endless possibilities.</p><span/></div>
    </> : <>
      <div className="projects-toolbar"><div className="project-tabs" role="tablist" aria-label="Project status">{tabs.map(name=><button key={name} role="tab" aria-selected={tab===name} tabIndex={tab===name?0:-1} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=tabs[(tabs.indexOf(name)+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];setTab(next);(e.currentTarget.parentElement?.children[tabs.indexOf(next)] as HTMLElement)?.focus();}}} onClick={()=>setTab(name)}>{name}</button>)}</div><div className="project-controls"><label><span>Sort:</span><select aria-label="Sort projects" value={sort} onChange={e=>setSort(e.target.value)}><option value="updated">Last Updated</option><option value="created">Date Created</option><option value="name">Name A–Z</option></select></label><label><span>View:</span><select aria-label="Project view" value={view} onChange={e=>setView(e.target.value)}><option value="grid">Grid</option><option value="list">List</option></select></label><button className="project-primary" onClick={onCreate}><span aria-hidden="true">＋</span> New Project</button></div></div>
      {!filtered.length ? <div className="projects-no-results"><h2>{query ? "No worlds found." : "Nothing here just yet."}</h2><p>{query ? `No projects match “${query}”. Try another name or story detail.` : `Projects with this status will appear here.`}</p><button className="project-secondary" onClick={()=>{onClearSearch();setTab("All Projects");}}>Show all active projects</button></div> : <div className={`world-library ${view==="list"?"list-view":""}`} role="tabpanel" aria-label={tab}>{filtered.map((p,index)=>{const status=p.status||"Draft";const tags=[p.format,p.style,...(p.tags||[])].filter(t=>t&&t!=="Not selected").slice(0,3);return <article className="world-project-card" key={p.id} onClick={e=>{if (!(e.target as HTMLElement).closest("button,a")) onOpen(p);}}><div className="project-cover"><img src={image(projectArt.includes(p.cover||"")?p.cover!:"fantasy")} alt="" loading={index>2?"lazy":"eager"}/><span className={`project-status-pill status-${status.toLowerCase().replaceAll(" ","-")}`}><i/>{status}</span><button className="project-options" aria-label={`Manage ${p.title}`} onClick={()=>edit(p)}>•••</button></div><div className="project-card-body"><h2><button className="project-title-link" onClick={()=>onOpen(p)}>{p.title}</button></h2><p className="project-summary">{p.idea}</p><div className="project-tags">{tags.map((tag,i)=><span key={`${tag}-${i}`}>{tag}</span>)}</div><div className="project-card-bottom"><div className="project-facts"><span>▧ &nbsp;{p.episodes||0} {(p.episodes||0)===1?"Episode":"Episodes"}</span><span>◷ &nbsp;Updated {relativeDate(p.updatedAt||p.createdAt)}</span></div><button className="open-project" onClick={()=>onOpen(p)}>Open Project <Arrow/></button></div></div></article>;})}<div className="new-world-card"><span className="new-world-plus">＋</span><strong>New Project</strong><p>Start a new story, or bring an existing<br/>world to Aempy.</p><button className="new-world-button" onClick={onCreate}>＋ &nbsp; Create New Project</button><button className="import-world-link" onClick={()=>{setNotice("");setImporting(true);}}>Bring an existing story</button></div></div>}
      <p className="project-storage-note">Your projects are saved in this browser.</p>
    </>}
    <p className="project-notice" role="status">{notice}</p>
    <dialog ref={dialog} className="studio-dialog project-editor" onCancel={()=>setEditing(null)} onClick={e=>{if(e.target===e.currentTarget)setEditing(null);}}><button className="project-dialog-close" aria-label="Close project settings" onClick={()=>setEditing(null)}>×</button><form onSubmit={e=>{e.preventDefault();saveEdit();}}><p className="studio-eyebrow">MAKE IT YOURS</p><h2>Project settings</h2><label>Project name<input value={title} maxLength={100} onChange={e=>setTitle(e.target.value)} required/></label><label>Status<select aria-label="Project status" value={status} onChange={e=>setStatus(e.target.value as ProjectStatus)}>{projectStatuses.map(s=><option key={s}>{s}</option>)}</select></label><fieldset><legend>Cover artwork</legend><div className="project-cover-choices">{projectArt.map(name=><button type="button" key={name} aria-label={`${name} cover`} aria-pressed={cover===name} className={cover===name?"selected":""} onClick={()=>setCover(name)}><img src={image(name)} alt=""/></button>)}</div></fieldset><button className="project-primary" type="submit">Save Changes <Arrow/></button><p className="project-editor-note" role="status">{notice}</p><p className="project-editor-note">Choose Archived to put a project away. You can restore it from the Archived tab.</p>{editing && <DeleteProjectControl key={editing.id} title={editing.title} onDelete={deleteProject}/>}</form></dialog>
    <dialog ref={importDialog} className="studio-dialog project-editor" onCancel={()=>setImporting(false)} onClick={e=>{if(e.target===e.currentTarget)setImporting(false);}}><button className="project-dialog-close" aria-label="Close story import" onClick={()=>setImporting(false)}>×</button><form onSubmit={e=>{e.preventDefault();importStory();}}><p className="studio-eyebrow">YOUR STORY BELONGS HERE</p><h2>Bring an Existing Story</h2><label>Story title<input value={storyTitle} onChange={e=>setStoryTitle(e.target.value)} required maxLength={100}/></label><label>Your story<textarea value={story} onChange={e=>setStory(e.target.value)} required maxLength={50000} placeholder="Paste your story, outline, or world notes…"/></label><input className="visually-hidden" ref={fileInput} aria-label="Import story file" type="file" accept=".txt,.md,text/plain,text/markdown" onChange={e=>readFile(e.target.files?.[0])}/><button className="project-secondary" type="button" onClick={()=>fileInput.current?.click()}>Choose a .txt or .md file</button><p className="project-editor-note">{notice || "Your story stays in this browser. Up to 50,000 characters."}</p><button className="project-primary" type="submit">Import Story <Arrow/></button></form></dialog>
  </div>;
}
