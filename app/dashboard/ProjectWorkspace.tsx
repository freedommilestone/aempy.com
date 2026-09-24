"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteProjectControl, { withoutProject } from "./DeleteProjectControl";
import { useEffect, useRef, useState } from "react";
import { logout } from "../login/actions";
import { Icon, Logo } from "./StudioBrand";
import { Draft, EntryKind, WorldEntry, projectArt, projectStatuses, ProjectStatus } from "./project-types";

const kinds: EntryKind[] = ["Episodes", "Characters", "Locations", "Lore", "Factions", "Timeline", "Assets", "Production"];
const sections = ["Overview", ...kinds, "Settings"];
const iconName = (name: string) => name === "Episodes" ? "Production" : name === "Overview" || name === "Settings" ? "Timeline" : name;
const art = (name?: string) => `/images/generated/${projectArt.includes(name || "") ? name : "fantasy"}.webp`;
const singular = (kind: string) => ({Episodes:"Episode",Characters:"Character",Locations:"Location",Factions:"Faction",Lore:"Lore Entry",Timeline:"Timeline Event",Assets:"Asset",Production:"Production Task"}[kind] || kind);
const dateLabel = (value: string) => new Date(value).toLocaleDateString(undefined, {month:"short",day:"numeric"});
type Editor = "project" | "overview" | "notes" | "entry" | null;

export default function ProjectWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Draft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState("Overview");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<Editor>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [entryKind, setEntryKind] = useState<EntryKind>("Episodes");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState("fantasy");
  const [status, setStatus] = useState<ProjectStatus>("Draft");
  const [entryStatus, setEntryStatus] = useState<WorldEntry["status"]>("Not started");
  const [tags, setTags] = useState("");
  const [notice, setNotice] = useState("");
  const [allActivity, setAllActivity] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function load() {
      try {
        const saved = JSON.parse(localStorage.getItem("aempy-drafts") || "[]");
        const found = Array.isArray(saved) ? saved.find(p => p?.id === projectId && typeof p.title === "string" && typeof p.idea === "string") : null;
        setProject(found || null);
      } catch { setNotice("Your projects could not be read from this browser."); }
      setLoaded(true);
    }
    load();
    const storage = (e: StorageEvent) => { if (e.key === "aempy-drafts") load(); };
    const shortcut = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); search.current?.focus(); } };
    window.addEventListener("storage", storage); window.addEventListener("keydown", shortcut);
    return () => { window.removeEventListener("storage", storage); window.removeEventListener("keydown", shortcut); };
  }, [projectId]);
  useEffect(() => { if(editor) dialog.current?.showModal(); else dialog.current?.close(); }, [editor]);
  const entries: WorldEntry[] = (Array.isArray(project?.workspace?.entries) ? project.workspace.entries : []).filter(e => e && kinds.includes(e.kind) && typeof e.title === "string");
  const activity = Array.isArray(project?.workspace?.activity) ? project.workspace.activity : [];
  const overview = project?.workspace?.overview ?? project?.idea ?? "";
  function navigate(next: string) { setSection(next); setQuery(""); setMenu(false); }
  function persist(patch: Partial<Draft>, action: string) {
    if (!project) return false;
    try {
      const saved: Draft[] = JSON.parse(localStorage.getItem("aempy-drafts") || "[]");
      if (!Array.isArray(saved) || !saved.some(p => p.id === projectId)) throw new Error("Missing project");
      const latest = saved.find(p => p.id === projectId)!;
      const now = new Date().toISOString();
      const updated = {...latest,...patch,updatedAt:now,workspace:{...latest.workspace,...patch.workspace,activity:[{id:crypto.randomUUID(),text:action,at:now},...(latest.workspace?.activity || [])].slice(0,60)}};
      localStorage.setItem("aempy-drafts", JSON.stringify(saved.map(p => p.id === projectId ? updated : p)));
      setProject(updated); setNotice("Changes saved in this browser."); return true;
    } catch { setNotice("Couldn’t save your changes. Browser storage may be full or unavailable. Keep a copy and try again."); return false; }
  }
  function edit(kind: Exclude<Editor,null>) {
    if (!project) return;
    setNotice(""); setTitle(project.title); setCover(project.cover || "fantasy"); setStatus(project.status || "Draft"); setTags((project.tags || []).join(", "));
    setBody(kind === "notes" ? project.workspace?.notes || "" : kind === "overview" ? overview : project.idea);
    setEditor(kind);
  }
  function editEntry(kind: EntryKind, entry?: WorldEntry) {
    setNotice(""); setEntryKind(kind); setEntryId(entry?.id || null); setTitle(entry?.title || ""); setBody(entry?.description || ""); setCover(entry?.cover || project?.cover || "fantasy"); setEntryStatus(entry?.status || "Not started"); setEditor("entry");
  }
  function save() {
    if (!project) return;
    let success = false;
    if (editor === "project") success = persist({title:title.trim(),idea:body.trim(),cover,status,tags:tags.split(",").map(t=>t.trim()).filter(Boolean).slice(0,10)}, "Updated project details");
    if (editor === "overview" || editor === "notes") success = persist({workspace:{...project.workspace,[editor]:body}}, `Updated project ${editor}`);
    if (editor === "entry") {
      const entry: WorldEntry = {id:entryId || crypto.randomUUID(),kind:entryKind,title:title.trim(),description:body.trim(),cover,status:entryStatus,updatedAt:new Date().toISOString()};
      const next = entryId ? entries.map(e => e.id === entryId ? entry : e) : [...entries,entry];
      success = persist({workspace:{...project.workspace,entries:next},episodes:next.filter(e=>e.kind === "Episodes").length}, `${entryId ? "Updated" : "Added"} ${singular(entryKind).toLowerCase()}: ${entry.title}`);
    }
    if (success) setEditor(null);
  }
  function deleteProject() {
    const remaining = withoutProject(projectId);
    localStorage.setItem("aempy-drafts", JSON.stringify(remaining));
    setEditor(null);setProject(null);router.replace("/dashboard/projects");return true;
  }
  function exportProject() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(project,null,2)],{type:"application/json"}));
    const link = document.createElement("a"); link.href=url;link.download="aempy-project.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function entryList(items: WorldEntry[], compact = false) {
    return items.length ? <div className={`pw-entry-list ${compact?"compact":""}`}>{items.map((entry,i) => <button className="pw-entry" key={entry.id} onClick={()=>editEntry(entry.kind,entry)}><img src={art(entry.cover)} alt=""/><span className="pw-entry-copy"><strong>{entry.kind === "Episodes" ? `Episode ${i+1}` : entry.title}</strong><span>{entry.kind === "Episodes" ? entry.title : entry.description || singular(entry.kind)}</span></span><span className={`pw-state ${entry.status === "Completed"?"complete":""}`}>{entry.status}</span><span className="pw-entry-more" aria-hidden="true">•••</span></button>)}</div> : <div className="pw-empty"><Icon name={iconName(section === "Overview" ? "Episodes" : section)} size={29}/><h3>{section === "Overview" ? "Your first episode starts here." : `Make room for your ${section.toLowerCase()}.`}</h3><p>{section === "Overview" ? "Give your next chapter a name and start shaping the story." : "Add the details that make this world yours."}</p><button className="project-secondary" onClick={()=>editEntry(section === "Overview" ? "Episodes" : section as EntryKind)}>＋ Add {singular(section === "Overview" ? "Episodes" : section)}</button></div>;
  }
  const episodes = entries.filter(e=>e.kind === "Episodes");
  const matches = entries.filter(e=>`${e.title} ${e.description} ${e.kind}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="studio project-workspace">
    {menu && <button className="studio-scrim" aria-label="Close navigation" onClick={()=>setMenu(false)}/>}
    <aside className={`studio-sidebar ${menu?"open":""}`}><Logo/><nav aria-label="Project navigation"><div className="nav-group pw-global-nav"><Link href="/"><Icon name="Home"/>Home</Link><Link className="selected" href="/dashboard/projects"><Icon name="Projects"/>Projects</Link><Link href="/dashboard"><Icon name="Create"/>Create</Link><button onClick={()=>navigate("Story Bible")}><Icon name="Lore"/>Story Bible</button></div><div className="nav-group pw-project-nav"><p>PROJECT</p><button className="pw-current-project" onClick={()=>navigate("Overview")}><img src={art(project?.cover)} alt=""/><span>{project?.title || "Your project"}</span></button>{sections.map(name=><button key={name} className={section===name?"selected":""} aria-current={section===name?"page":undefined} onClick={()=>navigate(name)}><Icon name={iconName(name)}/><span>{name}</span></button>)}</div></nav><div className="studio-plan"><div><Icon name="Check"/><span>Your creative space</span></div><p>Projects saved in this browser</p><form action={logout}><button type="submit">Log out <Icon name="Export" size={14}/></button></form></div></aside>
    <main className="studio-main"><div className="pw-banner" style={{backgroundImage:`linear-gradient(90deg,#000d18f5 0%,#000d18a8 38%,#000d1820 75%),linear-gradient(0deg,#000d18,transparent 70%),url("${art(project?.cover)}")`}}/>
      <header className="studio-topbar"><div className="studio-breadcrumb"><button className="studio-icon mobile-only" aria-label="Open navigation" onClick={()=>setMenu(true)}><Icon name="Menu"/></button><Icon name="Assets" size={19}/><Link href="/dashboard/projects">Projects</Link><span className="crumb-separator">›</span><span className="pw-crumb-title">{project?.title || "Your project"}</span></div><div className="studio-tools"><label className="studio-search"><Icon name="Search" size={17}/><input ref={search} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search this world…" aria-label="Search this project"/><kbd>⌘ K</kbd></label><button className="studio-icon" aria-label="Recent activity" onClick={()=>{navigate("Activity");setAllActivity(true);}}><Icon name="Bell"/></button><Link className="studio-avatar" href="/dashboard" aria-label="Return to studio"><img src={art("action")} alt=""/></Link></div></header>
      {!loaded ? <div className="pw-missing" role="status">Opening your world…</div> : !project ? <div className="pw-missing"><h1>Project not found in this browser.</h1><p>Open this project on the browser where you created it, or start a new world.</p><Link className="project-primary" href="/dashboard/projects">Back to My Projects</Link></div> : <>
        <section className="pw-hero"><div><p className="pw-meta">{project.format}<span>•</span>{project.style}<span>•</span>{project.status || "Draft"}</p><h1>{project.title}</h1><p className="pw-description">{project.idea}</p></div><button className="project-secondary" onClick={()=>edit("project")}><Icon name="Edit" size={17}/> Edit Project</button></section>
        <nav className="pw-tabs" aria-label="Project sections">{["Overview","Episodes","Characters","Locations","Lore","Factions","Timeline"].map(name=><button key={name} aria-current={!query && section===name?"page":undefined} onClick={()=>navigate(name)}>{name}</button>)}</nav>
        <div className="pw-content">
          {query ? <section className="pw-panel pw-search-results"><h2>Search results</h2><p>{matches.length} {matches.length===1?"result":"results"} for “{query}”</p>{matches.length?entryList(matches):<p>No matching entries. Try another name or detail.</p>}</section> : section === "Overview" ? <div className="pw-columns"><div className="pw-left"><div className="pw-stats">{["Episodes","Characters","Locations","Factions","Lore"].map(kind=><button key={kind} onClick={()=>navigate(kind)}><Icon name={iconName(kind)} size={28}/><strong>{entries.filter(e=>e.kind===kind).length}</strong><span>{kind === "Lore"?"Lore Entries":kind}</span></button>)}</div><section className="pw-continue"><h2>Continue Creating</h2><p>Where do you want to go next?</p><div className="pw-actions">{[["Episodes","New Episode","Create the next chapter"],["Characters","Add Character","Bring someone new to your story"],["Locations","Add Location","Create a new place"],["Lore","Expand Lore","Add history, factions or world details"]].map(([kind,label,description],i)=><button key={kind} className={i===0?"primary":""} onClick={()=>editEntry(kind as EntryKind)}>{i===0?<span className="pw-plus">＋</span>:<Icon name={kind} size={28}/>}<strong>{label}</strong><span>{description}</span></button>)}</div></section><section className="pw-episodes"><div className="pw-section-heading"><h2>Episodes</h2><button onClick={()=>navigate("Episodes")}>View All <Icon name="Arrow" size={18}/></button></div>{entryList(episodes.slice(0,4),true)}</section></div><div className="pw-right"><section className="pw-panel"><div className="pw-panel-heading"><h2>World Overview</h2><button onClick={()=>edit("overview")} aria-label="Edit world overview"><Icon name="Edit" size={13}/> Edit</button></div><div className="pw-panel-body"><p className="pw-overview-text">{overview || "Describe the world your story lives in."}</p><div className="project-tags">{(project.tags?.length ? project.tags : [project.format,project.style]).filter(Boolean).map((tag,i)=><span key={i}>{tag}</span>)}</div><div className="pw-world-gallery">{[project.cover || "fantasy",...entries.filter(e=>e.kind==="Locations").map(e=>e.cover)].slice(0,3).map((cover,i)=><img key={i} src={art(cover)} alt={i===0?"Project cover":"Location artwork"}/>)}</div></div></section><section className="pw-panel"><div className="pw-panel-heading"><h2>Recent Activity</h2><button onClick={()=>{setAllActivity(true);navigate("Activity");}}>View All <Icon name="Arrow" size={14}/></button></div><div className="pw-activity">{activity.length?activity.slice(0,4).map(a=><div key={a.id}><Icon name="Check" size={18}/><span>{a.text}</span><time>{dateLabel(a.at)}</time></div>):<p>Your world is ready. Your next changes will appear here.</p>}</div></section><section className="pw-panel"><div className="pw-panel-heading"><h2>Project Notes</h2><button aria-label="Edit project notes" onClick={()=>edit("notes")}><Icon name="Edit" size={13}/> Edit</button></div><div className="pw-panel-body"><p className="pw-notes">{project.workspace?.notes || "Keep your ideas, reminders, and plans for the next chapter here."}</p><small>Updated {dateLabel(project.updatedAt || project.createdAt)}</small></div></section></div></div> : section === "Settings" ? <section className="pw-panel pw-settings"><h2>Project Settings</h2><p>Make this world yours. Change its name, cover, tags, and status, or keep a copy of everything you’ve added.</p><div><button className="project-primary" onClick={()=>edit("project")}>Edit Project</button><button className="project-secondary" onClick={exportProject}><Icon name="Export" size={17}/> Export Project</button></div><DeleteProjectControl title={project.title} onDelete={deleteProject}/></section> : section === "Story Bible" ? <section className="pw-panel pw-bible"><h2>Story Bible</h2><p className="pw-notes">{overview}</p>{kinds.slice(1,6).map(kind=><div key={kind}><div className="pw-section-heading"><h2>{kind}</h2><button onClick={()=>editEntry(kind)}>＋ Add {singular(kind)}</button></div>{entries.filter(e=>e.kind===kind).length?entryList(entries.filter(e=>e.kind===kind)):<p>No {kind.toLowerCase()} added yet.</p>}</div>)}</section> : section === "Activity" ? <section className="pw-panel pw-full-activity"><h2>Project Activity</h2><div className="pw-activity">{activity.length?activity.slice(0,allActivity?60:4).map(a=><div key={a.id}><Icon name="Check"/><span>{a.text}</span><time>{dateLabel(a.at)}</time></div>):<p>Your project changes will appear here.</p>}</div></section> : <section><div className="pw-section-heading"><div><h2>{section}</h2><p>{entries.filter(e=>e.kind===section).length} entries in your world</p></div><button className="project-primary" onClick={()=>editEntry(section as EntryKind)}>＋ Add {singular(section)}</button></div>{entryList(entries.filter(e=>e.kind===section))}</section>}
          <p className="pw-save-notice" role="status">{notice}</p>
        </div>
      </>}
    </main>
    <dialog ref={dialog} className="studio-dialog project-editor" onCancel={()=>setEditor(null)}><button className="project-dialog-close" aria-label="Close editor" onClick={()=>setEditor(null)}>×</button><form onSubmit={e=>{e.preventDefault();save();}}><p className="studio-eyebrow">YOUR WORLD, YOUR STORY</p><h2>{editor === "entry" ? `${entryId?"Edit":"New"} ${singular(entryKind)}` : editor === "project" ? "Edit Project" : editor === "notes" ? "Project Notes" : "World Overview"}</h2>{(editor === "project" || editor === "entry") && <label>{editor === "project"?"Project name":"Name"}<input value={title} onChange={e=>setTitle(e.target.value)} required maxLength={100}/></label>}<label>{editor === "notes"?"Notes":editor === "overview"?"Overview":"Description"}<textarea aria-label={editor === "notes" ? "Notes" : editor === "overview" ? "Overview" : "Description"} value={body} onChange={e=>setBody(e.target.value)} maxLength={50000}/></label>{editor === "project" && <><label>Project status<select value={status} onChange={e=>setStatus(e.target.value as ProjectStatus)}>{projectStatuses.map(s=><option key={s}>{s}</option>)}</select></label><label>Tags, separated by commas<input value={tags} onChange={e=>setTags(e.target.value)} maxLength={300}/></label></>}{editor === "entry" && <label>Progress<select value={entryStatus} onChange={e=>setEntryStatus(e.target.value as WorldEntry["status"])}>{["Not started","In progress","Completed"].map(s=><option key={s}>{s}</option>)}</select></label>}{(editor === "project" || editor === "entry") && <fieldset><legend>Cover artwork</legend><div className="project-cover-choices">{projectArt.map(name=><button type="button" key={name} aria-label={`${name} cover`} aria-pressed={cover===name} className={cover===name?"selected":""} onClick={()=>setCover(name)}><img src={art(name)} alt=""/></button>)}</div></fieldset>}<button className="project-primary" type="submit">Save Changes <Icon name="Arrow" size={18}/></button><p className="project-editor-note" role="status">{notice}</p>{editor === "project" && project && <DeleteProjectControl title={project.title} onDelete={deleteProject}/>}</form></dialog>
  </div>;
}
