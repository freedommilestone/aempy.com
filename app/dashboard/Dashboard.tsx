"use client";

import ProjectsView from "./ProjectsView";
import { projectStatuses, projectArt, type Draft } from "./project-types";
import "./projects.css";
import StudioSidebar, { studioGroups, projectSections, sectionHash, rememberProject } from "./StudioSidebar";
import { Icon } from "./StudioBrand";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const art = (name: string) => `/images/generated/${name}.webp`;
const initialIdea = "A young boy lives alone in a mountain village. One morning he finds an injured elf in the forest. She tells him that a kingdom everyone thought disappeared has returned.";
const ideas = [initialIdea, "A shy apprentice discovers that the stars are letters from forgotten worlds. With a runaway cloud spirit, she sets out to answer them.", "In a city where memories power the lights, a young mechanic finds a machine that remembers the future.", "A tiny forest café opens only when it rains. Its new owner must help magical guests find their way home."];
const formats = [
  ["Animated Series", "Episodic animation of any style", "action"],
  ["Film / Series", "Cinematic, live-action style stories", "adventure"],
  ["Kids Story", "Children’s stories and educational content", "comedy"],
  ["Comic / Manga", "Comics, manga and graphic novels", "drama"],
  ["Short Film", "Standalone short-form films", "fantasy"],
  ["YouTube Video", "Story-driven videos for online creators", "cozy"],
];
const styles = [
  ["Anime", "Japanese animation-inspired", "action"],
  ["Cinematic Realism", "Film / television look", "adventure"],
  ["Stylized 3D", "Polished 3D animation", "comedy"],
  ["2D Animation", "Illustrated animation look", "slice"],
  ["Storybook", "Painterly / illustrated", "fantasy"],
  ["Comic / Manga", "Graphic art style", "drama"],
];
const extraStyles = [["Neon Noir", "Electric, atmospheric worlds", "cyberpunk"], ["Watercolor", "Soft and expressive", "historical"]];
const stages = ["Understanding your idea…", "Identifying genre and tone…", "Exploring the story concept…", "Previewing characters…", "Discovering locations…", "Organizing lore and factions…", "Mapping relationships…", "Outlining episodes and scenes…", "Preparing your draft…"];
type Detail = { title: string; description: string; image?: string };

export default function Dashboard({ initialSection = "Create" }: { initialSection?: string }) {
  const router = useRouter();
  const [section, setSection] = useState(initialSection);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [idea, setIdea] = useState(initialIdea);
  const [format, setFormat] = useState("Animated Series");
  const [style, setStyle] = useState("Anime");
  const [moreStyles, setMoreStyles] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [building, setBuilding] = useState(false);
  const [step, setStep] = useState(0);
  const [built, setBuilt] = useState(false);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const buildTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try { const value = JSON.parse(localStorage.getItem("aempy-drafts") || "[]"); if (Array.isArray(value)) setDrafts(value.filter(d => d && typeof d.id === "string" && typeof d.title === "string" && typeof d.idea === "string" && typeof d.format === "string" && typeof d.style === "string" && typeof d.createdAt === "string").map(d => ({...d, status: projectStatuses.includes(d.status) ? d.status : "Draft", cover: projectArt.includes(d.cover) ? d.cover : "fantasy", tags: Array.isArray(d.tags) ? d.tags.filter((t: unknown) => typeof t === "string") : [], episodes: typeof d.episodes === "number" && Number.isFinite(d.episodes) ? Math.max(0, Math.floor(d.episodes)) : 0, updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : d.createdAt}))); } catch { /* Start with an empty workspace if storage is unavailable. */ }
    setLoaded(true);
    const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); search.current?.focus(); } };
    const handleBack = () => setSection(window.location.pathname.endsWith("/projects") ? "Projects" : [...studioGroups.flatMap(g=>g.items),...projectSections,"Templates"].find(name=>sectionHash(name)===window.location.hash.slice(1)) || "Create");
    handleBack();
    window.addEventListener("hashchange",handleBack);
    window.addEventListener("popstate", handleBack);
    window.addEventListener("keydown", shortcut);
    return () => { window.removeEventListener("hashchange",handleBack);window.removeEventListener("popstate", handleBack); window.removeEventListener("keydown", shortcut); if (buildTimer.current) clearInterval(buildTimer.current); };
  }, []);

  useEffect(() => {
    if (detail) dialog.current?.showModal();
    else dialog.current?.close();
  }, [detail]);
  useEffect(() => () => { if (reference) URL.revokeObjectURL(reference); }, [reference]);

  useEffect(() => {
    if (loaded && projectSections.includes(section) && section !== "Assets") navigate(section);
  }, [loaded, section, drafts]);

  function navigate(next: string) {
    if (projectSections.includes(next) && next !== "Assets") {
      // A global link cannot silently choose an IP on the creator's behalf.
      next = "Projects";
    }
    const path = next === "Projects" ? "/dashboard/projects" : next === "Create" ? "/dashboard" : `/dashboard#${sectionHash(next)}`;
    if (window.location.pathname + window.location.hash !== path) window.history.pushState(null, "", path);
    setSection(next); setMenuOpen(false); setQuery("");
  }
  function persistProjects(next: Draft[]) {
    try { localStorage.setItem("aempy-drafts", JSON.stringify(next)); setDrafts(next);setMessage(""); return true; }
    catch { return false; }
  }
  function openProject(draft: Draft) { rememberProject(draft.id);router.push(`/dashboard/projects/${encodeURIComponent(draft.id)}`); }
  function newProject() { setEditingId(null);setIdea("");setFormat("Animated Series");setStyle("Anime");setReference(null);setBuilt(false);setStep(0);setMessage("");navigate("Create"); }

  function show(title: string, description: string, image?: string) { setDetail({ title, description, image }); }
  function saveDraft() {
    if (!idea.trim() || building) return;
    setBuilding(true); setBuilt(false); setStep(0); setMessage("");
    let current = 0;
    buildTimer.current = setInterval(() => {
      current += 1; setStep(current);
      if (current >= stages.length) {
        if (buildTimer.current) clearInterval(buildTimer.current);
        buildTimer.current = null;
        const existing = drafts.find(d => d.id === editingId);
        const draft: Draft = { ...existing, id: existing?.id || crypto.randomUUID(), title: existing?.title || idea.trim().split(/[.!?]/)[0].split(/\s+/).slice(0,8).join(" "), idea: idea.trim(), format, style, createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), status: existing?.status || "Draft", cover: existing?.cover || "fantasy" };
        setEditingId(draft.id);rememberProject(draft.id);
        const next = existing ? drafts.map(d => d.id === existing.id ? draft : d) : [draft, ...drafts]; setDrafts(next);
        try { localStorage.setItem("aempy-drafts", JSON.stringify(next)); setMessage("Draft saved in this browser. AI generation is not connected yet."); }
        catch { setMessage("Draft created for this session. Browser storage is unavailable; export it to keep a copy."); }
        setBuilding(false); setBuilt(true);
      }
    }, 550);
  }
  function uploadReference(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) { setMessage("Choose an image smaller than 10 MB."); return; }
    setReference(URL.createObjectURL(file)); setStyle("Your reference");
    setMessage("Reference added for this session. It stays on your device.");
  }
  function exportDrafts() {
    const blob = new Blob([JSON.stringify({ projects: drafts, exportedAt: new Date().toISOString() }, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "aempy-story-drafts.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const progress = Math.round(step / stages.length * 100);
  const allStyles = moreStyles ? [...styles, ...extraStyles] : styles;

  return <div className={`studio ${section === "Projects" ? "projects-studio" : ""}`}>
    <StudioSidebar section={section} open={menuOpen} onClose={()=>setMenuOpen(false)} onNavigate={navigate} projects={drafts}/>
    <div className="studio-main">
      <div className="studio-banner" aria-hidden="true"/>
      <header className="studio-topbar">
        <div className="studio-breadcrumb"><button className="studio-icon mobile-only" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Icon name="Menu"/></button><Icon name="Assets" size={19}/><span>{section}</span><span className="crumb-separator">›</span><span>{section === "Create" ? "New Project" : "Your Workspace"}</span></div>
        <div className="studio-tools"><label className="studio-search"><Icon name="Search" size={17}/><input ref={search} value={query} onChange={e => { setQuery(e.target.value); if(e.target.value) { setSection("Projects"); if(window.location.pathname !== "/dashboard/projects") window.history.pushState(null,"","/dashboard/projects"); } }} placeholder="Search your projects…" aria-label="Search projects"/><kbd>⌘ K</kbd></label><button className="studio-icon" aria-label="Help" onClick={() => show("A little idea. A whole universe.", "Start with a few sentences, pick a format and a visual style, then build a local draft. The world on the right is an illustrative example. AI generation and individual accounts will be connected in a later step.")}><Icon name="Help"/></button><button className="studio-icon" aria-label="Notifications" onClick={() => show("You’re all caught up", "No notifications yet. Your creative adventure starts with your first story.")}><Icon name="Bell"/></button><button className="studio-avatar" aria-label="Account" onClick={() => show("Welcome, creator", "You have temporary shared-code access to Aempy Studio. Drafts stay in this browser. Individual accounts will be added with Supabase.")}><img src={art("comedy")} alt=""/></button></div>
      </header>
      {section !== "Projects" && <><section className="studio-intro"><p className="studio-eyebrow">CREATE ORIGINAL WORLDS</p><h1>{section === "Create" ? "Turn Your Idea Into a World." : `Your ${section.toLowerCase()}. Your universe.`}</h1><h2>{section === "Create" ? "A few sentences. A whole universe." : "A home for every part of your story."}</h2><p className="intro-description">{section === "Create" ? "Tell us your idea and shape the story, characters, locations, lore, and episodes that bring it to life." : "Create, collect, and connect the details that make your world yours."}</p><blockquote>“Every great story<br/>starts with a single idea.”</blockquote></section>
      <div className="studio-preview-label"><span/> Studio preview <span className="preview-divider">/</span> Local drafts · Shared preview access</div></>}
      {section === "Projects" ? <><ProjectsView projects={drafts} loaded={loaded} query={query} onCreate={newProject} onOpen={openProject} onChange={persistProjects} onClearSearch={() => setQuery("")}/>{message && <p className="studio-status" role="status">{message}</p>}</> : section === "Create" ? <div className="studio-workspace">
        <section className="creation-panel" aria-label="Create a story">
          <fieldset disabled={building}>
            <div className="step-heading"><span className="step-number">1</span><div><h2>Tell us your idea</h2><p>Write a few sentences about your story. Be as simple or detailed as you like.</p></div><button className="text-action random-idea" onClick={() => { setIdea(ideas[(ideas.indexOf(idea) + 1) % ideas.length]); setBuilt(false); }}>Not sure? <span>Try a random idea</span><Icon name="Shuffle" size={15}/></button></div>
            <div className="idea-input"><textarea aria-label="Your story idea" maxLength={format === "Existing Story" ? 50000 : 2000} value={idea} onChange={e => {setIdea(e.target.value);setBuilt(false);}} placeholder="Every world begins with an idea. What’s yours?"/><span>{idea.length.toLocaleString()} / {format === "Existing Story" ? "50,000" : "2,000"}</span></div>
            <div className="step-heading"><span className="step-number">2</span><div><h2>What do you want to create?</h2><p>Choose the format that best matches your vision.</p></div></div>
            <div className="format-grid" role="group" aria-label="Story format">{formats.map(([name, description, image]) => <button key={name} className={`option-card ${format === name ? "chosen" : ""} ${name === "Comic / Manga" ? "monochrome" : ""}`} aria-pressed={format === name} onClick={() => setFormat(name)}><div className="option-art"><img src={art(image)} alt=""/>{format === name && <span className="choice-check"><Icon name="Check" size={13}/></span>}</div><strong>{name}</strong><p>{description}</p></button>)}</div>
            <div className="step-heading style-heading"><span className="step-number">3</span><div><h2>How should it look?</h2><p>Choose a visual style or upload a reference. You can change this later.</p></div><button className="text-action" onClick={() => {setStyle("Let Aempy choose");setMessage("Automatic style selection saved with your draft.");}}><Icon name="Spark" size={17}/><span>Let Aempy choose</span><span>›</span></button></div>
            <div className="style-grid" role="group" aria-label="Visual style">{allStyles.map(([name, description, image]) => <button key={name} className={`option-card style-card ${style === name ? "chosen" : ""} ${name === "Comic / Manga" ? "monochrome" : ""}`} aria-pressed={style === name} onClick={() => setStyle(name)}><div className="option-art"><img src={art(image)} alt=""/>{style === name && <span className="choice-check"><Icon name="Check" size={12}/></span>}</div><strong>{name}</strong><p>{description}</p></button>)}<button className="option-card utility-card" onClick={() => setMoreStyles(!moreStyles)}><span className="more-dots">•••</span><span>{moreStyles ? "Fewer" : "Show More"}<br/>Styles</span></button><button className={`option-card utility-card ${style === "Your reference" ? "chosen" : ""}`} onClick={() => upload.current?.click()}>{reference ? <img className="reference-thumb" src={reference} alt="Your reference"/> : <Icon name="Image" size={26}/>}<span>{reference ? "Change" : "Upload"}<br/>Reference</span></button></div>
            <input className="visually-hidden" ref={upload} type="file" accept="image/*" aria-label="Upload style reference" onChange={uploadReference}/>
            <button className="build-story" disabled={!idea.trim() || building} onClick={saveDraft}><Icon name="Spark" size={25}/>{building ? "Preparing Your Draft…" : "Build My Story"}<Icon name="Arrow" size={25}/></button>
          </fieldset>
          <p className="build-caption">Save your idea as a local draft and explore an example world. No AI credits required.</p>
          <p className="studio-status" role="status">{message}</p>
        </section>
        <aside className="world-panel" aria-label="World preview">
          <div className="world-title"><h2>{building ? "Preparing your story workspace…" : built ? "Your story draft is ready." : "A glimpse of your next world."}</h2><span><Icon name="Spark" size={19}/> {building ? "Demo preview" : "Example world"}</span></div>
          <p className="world-subtitle">{building ? "Saving your choices and previewing how a story comes together." : "Explore sample characters, locations, lore, and an episode structure."}</p>
          <div className="world-progress"><ol className="stage-list">{stages.map((label,index) => <li key={label} className={building && index === step ? "current" : ""}><span className={`stage-icon ${index < step || !building ? "complete" : ""}`}>{index < step || !building ? <Icon name="Check" size={16}/> : index === step ? <i/> : null}</span>{label.replace("…", building ? "…" : "")}</li>)}</ol><div className="world-cover"><img src={art("fantasy")} alt="A fantasy castle overlooking waterfalls"/><p>“Rich worlds.<br/>Unforgettable stories.”</p></div></div>
          <div className="world-preview-heading"><h2>Your World <span>(Example Preview)</span></h2><p>See how your creative workspace could come together. Sample content below.</p></div>
          <div className="world-tiles">
            <section className="world-tile"><div className="tile-title"><h3>Characters</h3><button onClick={() => navigate("Characters")}>View All <Icon name="Arrow" size={12}/></button></div><p>2 sample characters</p><div className="character-grid">{[["Ren","action","A quiet village boy whose courage grows when his home is threatened."],["Seren","drama","An injured elf carrying the secret of a kingdom returning from legend."]].map(([name,image,description]) => <button className="mini-character" key={name} onClick={() => show(name, `Example character · ${description}`, image)}><img src={art(image)} alt=""/><span>{name}<small>Sample</small></span></button>)}</div></section>
            <section className="world-tile"><div className="tile-title"><h3>Locations</h3><button onClick={() => navigate("Locations")}>View All <Icon name="Arrow" size={12}/></button></div><p>3 sample locations</p><div className="location-grid">{[["Mountain Village","slice"],["Silverwood Forest","historical"],["Unknown Kingdom","fantasy"]].map(([name,image]) => <button className="mini-character" key={name} onClick={() => show(name, "Example location · A place waiting for a story. Location details will be generated when AI is connected.",image)}><img src={art(image)} alt=""/><span>{name}</span><small>Sample</small></button>)}</div></section>
            <section className="world-tile"><div className="tile-title"><h3>Lore & Factions</h3><button onClick={() => navigate("Lore")}>View All <Icon name="Arrow" size={12}/></button></div><p>2 sample entries</p>{["The Lost Kingdom","Ancient Bloodline"].map(name => <button className="lore-entry" key={name} onClick={() => show(name, "Example worldbuilding entry · The vanished kingdom holds a history that connects Ren and Seren. Replace this sample with your own lore once your story workspace is connected.")}><Icon name="Lore" size={15}/>{name}<small>Sample</small></button>)}</section>
            <section className="world-tile"><div className="tile-title"><h3>Episode Structure</h3><button onClick={() => navigate("Timeline")}>View All <Icon name="Arrow" size={12}/></button></div><p>An example opening</p><button className="episode-entry" onClick={() => show("Episode 1 · The Forest Encounter", "Example outline · Ren’s quiet morning is interrupted when he discovers Seren injured among the trees. Her arrival brings news that the lost kingdom has returned.","historical")}><Icon name="Projects" size={22}/><span>Episode 1<small>The Forest Encounter</small></span></button></section>
          </div>
          <div className="world-progress-footer"><div role="progressbar" aria-label="Draft preparation" aria-valuemin={0} aria-valuemax={100} aria-valuenow={building ? progress : built ? 100 : 0}><span style={{width: `${building ? progress : built ? 100 : 0}%`}}/></div><span>{building ? `${progress}% complete` : built ? "Draft saved" : "Ready to explore"}</span></div>
        </aside>
      </div> : <section className="workspace-section">
        <div className="section-heading"><div><p className="studio-eyebrow">YOUR CREATIVE WORKSPACE</p><h2>{section}</h2></div><button className="small-primary" onClick={() => navigate("Create")}><Icon name="Spark" size={17}/> New Story</button></div>
        {section === "Export" ? <div className="studio-empty"><Icon name="Export" size={40}/><h3>Keep a copy of your ideas.</h3><p>Download your {drafts.length} local story {drafts.length === 1 ? "draft" : "drafts"} as a JSON file.</p><button className="small-primary" disabled={!drafts.length} onClick={exportDrafts}>Download drafts</button></div> : ["Characters","Locations","Lore","Story Bible","Factions","Timeline","Assets","Templates"].includes(section) ? <><p className="section-note">Example library · These are sample assets, not AI-generated results for your idea.</p><div className="project-grid">{(section === "Characters" ? [["Ren","action"],["Seren","drama"]] : section === "Locations" ? [["Mountain Village","slice"],["Silverwood Forest","historical"],["Unknown Kingdom","fantasy"]] : section === "Timeline" ? [["The Forest Encounter","historical"],["A Kingdom Returns","fantasy"]] : [["The Lost Kingdom","fantasy"],["A New Adventure","adventure"],["Stories of Tomorrow","scifi"]]).map(([name,image]) => <button className="project-card" key={name} onClick={() => show(name, `Sample ${section.toLowerCase()} entry. This illustrates the workspace; story-specific generation will be connected later.`,image)}><img src={art(image)} alt=""/><span className="project-meta">EXAMPLE {section.toUpperCase()}</span><h3>{name}</h3><p>A starting point for a world of possibilities.</p></button>)}</div></> : <div className="studio-empty"><Icon name={section} size={42}/><h3>Your {section.toLowerCase()} workspace is coming next.</h3><p>This area will connect to your story when the full studio is ready. Start by saving a story draft.</p><button className="small-primary" onClick={() => navigate("Create")}>Create a story <Icon name="Arrow" size={16}/></button></div>}
      </section>}
      <footer className="studio-footer">A little idea. An extraordinary world. <span>Made for storytellers.</span></footer>
    </div>
    <dialog ref={dialog} className="studio-dialog" onCancel={() => setDetail(null)} onClick={e => {if(e.target === e.currentTarget)setDetail(null);}}>{detail && <><button className="dialog-close studio-icon" aria-label="Close dialog" onClick={() => setDetail(null)}><Icon name="Close"/></button>{detail.image && <img className="dialog-image" src={art(detail.image)} alt=""/>}<div className="dialog-copy"><p className="studio-eyebrow">AEMPY STUDIO</p><h2>{detail.title}</h2><p>{detail.description}</p><button className="small-primary" onClick={() => setDetail(null)}>Got it</button></div></>}</dialog>
  </div>;
}
