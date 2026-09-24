"use client";

import AempyMark from "../components/AempyMark";
import { logout } from "../login/actions";
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
const navigation = [
  { label: "", items: ["Home", "Create", "Projects", "Story Bible"] },
  { label: "BUILD", items: ["Characters", "Locations", "Relationships", "Factions", "Lore", "Timeline"] },
  { label: "PRODUCTION", items: ["Storyboard", "Production", "Edit", "Export"] },
  { label: "LIBRARY", items: ["Assets", "Templates", "Community"] },
];
type Draft = { id: string; title: string; idea: string; format: string; style: string; createdAt: string };
type Detail = { title: string; description: string; image?: string };

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    Home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
    Create: <><path d="M8 17c0-3-4-4-4-8a8 8 0 0 1 16 0c0 4-4 5-4 8Z"/><path d="M9 20h6M10 23h4"/></>,
    Projects: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2h6v5H9ZM9 11h6M9 15h6"/></>,
    Characters: <><circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3ZM16 5a3 3 0 0 1 0 6M18 14c3 0 4 2 4 5v2"/></>,
    Locations: <><path d="M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13Z"/><circle cx="12" cy="9" r="3"/></>,
    Relationships: <path d="M12 21 3 12C-3 3 8-1 12 6c4-7 15-3 9 6Z"/>,
    Factions: <path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z"/>,
    Lore: <><path d="M12 5v17M12 5C6 1 2 3 2 3v16s5-2 10 3c5-5 10-3 10-3V3s-4-2-10 2Z"/></>,
    Timeline: <><path d="M8 5h14M8 12h10M8 19h14"/><circle cx="3" cy="5" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="3" cy="19" r="1.5"/></>,
    Assets: <><path d="M3 5h7l2 3h9v13H3Z"/><path d="m4 18 5-5 4 3 3-2 4 4"/></>,
    Production: <path d="m5 3 16 9-16 9Z"/>,
    Edit: <><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m7 7 10 10M7 17 17 7"/></>,
    Export: <><path d="M5 7H3v15h18V7h-2M12 17V2m-5 5 5-5 5 5"/></>,
    Templates: <><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M10 2v20M6 7h1M6 12h1M14 7h4M14 12h4"/></>,
    Search: <><circle cx="10" cy="10" r="7"/><path d="m16 16 6 6"/></>,
    Help: <><circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 1 1 4 3v3M12 18h.01"/></>,
    Bell: <><path d="M4 17h16l-2-4V9a6 6 0 0 0-12 0v4ZM10 21h4M12 1v2"/></>,
    Spark: <><path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z"/></>,
    Arrow: <path d="M3 12h18m-7-7 7 7-7 7"/>,
    Shuffle: <><path d="M2 5h4l12 14h4m-4-4 4 4-4 4M2 19h4l4-5m4-4 4-5h4m-4-4 4 4-4 4"/></>,
    Check: <path d="m5 12 4 4L19 6"/>,
    Image: <><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8" cy="8" r="2"/><path d="m3 19 6-7 5 5 4-4 3 3"/></>,
    Close: <path d="m5 5 14 14M5 19 19 5"/>,
    Menu: <path d="M3 5h18M3 12h18M3 19h18"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths[name === "Community" ? "Relationships" : name === "Story Bible" ? "Lore" : "Assets"]}</svg>;
}

function Logo() {
  return <a className="studio-brand" href="/" aria-label="Aempy home"><AempyMark/><span>Aempy<small>Create. Tell. Belong.</small></span></a>;
}

export default function Dashboard() {
  const [section, setSection] = useState("Create");
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
    try { const value = JSON.parse(localStorage.getItem("aempy-drafts") || "[]"); if (Array.isArray(value)) setDrafts(value.filter(d => d && typeof d.id === "string" && typeof d.title === "string" && typeof d.idea === "string" && typeof d.format === "string" && typeof d.style === "string" && typeof d.createdAt === "string")); } catch { /* Start with an empty workspace if storage is unavailable. */ }
    setLoaded(true);
    const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); search.current?.focus(); } };
    window.addEventListener("keydown", shortcut);
    return () => { window.removeEventListener("keydown", shortcut); if (buildTimer.current) clearInterval(buildTimer.current); };
  }, []);

  useEffect(() => {
    if (detail) dialog.current?.showModal();
    else dialog.current?.close();
  }, [detail]);
  useEffect(() => () => { if (reference) URL.revokeObjectURL(reference); }, [reference]);

  function navigate(next: string) { setSection(next); setMenuOpen(false); setQuery(""); }
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
        const draft: Draft = { id: crypto.randomUUID(), title: idea.trim().split(/[.!?]/)[0].split(/\s+/).slice(0,8).join(" "), idea: idea.trim(), format, style, createdAt: new Date().toISOString() };
        const next = [draft, ...drafts]; setDrafts(next);
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
  const filtered = drafts.filter(d => `${d.title} ${d.idea} ${d.format}`.toLowerCase().includes(query.toLowerCase()));
  const progress = Math.round(step / stages.length * 100);
  const allStyles = moreStyles ? [...styles, ...extraStyles] : styles;

  return <div className="studio">
    {menuOpen && <button className="studio-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)}/>}
    <aside className={`studio-sidebar ${menuOpen ? "open" : ""}`}>
      <Logo/>
      <nav aria-label="Studio navigation">{navigation.map(group => <div className="nav-group" key={group.label}>{group.label && <p>{group.label}</p>}{group.items.map(item => item === "Home" ? <a href="/" key={item}><Icon name={item}/><span>{item}</span></a> : <button key={item} className={section === item ? "selected" : ""} aria-current={section === item ? "page" : undefined} onClick={() => navigate(item)}><Icon name={item}/><span>{item}</span>{item === "Projects" && drafts.length > 0 && <small>{drafts.length}</small>}</button>)}</div>)}</nav>
      <div className="studio-plan"><form action={logout}><button className="studio-signout" type="submit">Log out <Icon name="Export" size={14}/></button></form><div><Icon name="Check" size={21}/><span>Your creative space</span></div><p>Local preview · No credits used</p><button onClick={() => show("Your Aempy account", "This is a local dashboard preview. Individual accounts, plans, and billing have not been connected. Your story drafts are saved only in this browser.")}>Explore Creator Plan <Icon name="Arrow" size={16}/></button></div>
    </aside>
    <div className="studio-main">
      <div className="studio-banner" aria-hidden="true"/>
      <header className="studio-topbar">
        <div className="studio-breadcrumb"><button className="studio-icon mobile-only" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Icon name="Menu"/></button><Icon name="Assets" size={19}/><span>{section}</span><span className="crumb-separator">›</span><span>{section === "Create" ? "New Project" : "Your Workspace"}</span></div>
        <div className="studio-tools"><label className="studio-search"><Icon name="Search" size={17}/><input ref={search} value={query} onChange={e => { setQuery(e.target.value); if(e.target.value) setSection("Projects"); }} placeholder="Search your projects…" aria-label="Search projects"/><kbd>⌘ K</kbd></label><button className="studio-icon" aria-label="Help" onClick={() => show("A little idea. A whole universe.", "Start with a few sentences, pick a format and a visual style, then build a local draft. The world on the right is an illustrative example. AI generation and individual accounts will be connected in a later step.")}><Icon name="Help"/></button><button className="studio-icon" aria-label="Notifications" onClick={() => show("You’re all caught up", "No notifications yet. Your creative adventure starts with your first story.")}><Icon name="Bell"/></button><button className="studio-avatar" aria-label="Account" onClick={() => show("Welcome, creator", "You have temporary shared-code access to Aempy Studio. Drafts stay in this browser. Individual accounts will be added with Supabase.")}><img src={art("comedy")} alt=""/></button></div>
      </header>
      <section className="studio-intro"><p className="studio-eyebrow">CREATE ORIGINAL WORLDS</p><h1>{section === "Create" ? "Turn Your Idea Into a World." : section === "Projects" ? "Your next world starts here." : `Your ${section.toLowerCase()}. Your universe.`}</h1><h2>{section === "Create" ? "A few sentences. A whole universe." : "A home for every part of your story."}</h2><p className="intro-description">{section === "Create" ? "Tell us your idea and shape the story, characters, locations, lore, and episodes that bring it to life." : "Create, collect, and connect the details that make your world yours."}</p><blockquote>“Every great story<br/>starts with a single idea.”</blockquote></section>
      <div className="studio-preview-label"><span/> Studio preview <span className="preview-divider">/</span> Local drafts · Shared preview access</div>
      {section === "Create" ? <div className="studio-workspace">
        <section className="creation-panel" aria-label="Create a story">
          <fieldset disabled={building}>
            <div className="step-heading"><span className="step-number">1</span><div><h2>Tell us your idea</h2><p>Write a few sentences about your story. Be as simple or detailed as you like.</p></div><button className="text-action random-idea" onClick={() => { setIdea(ideas[(ideas.indexOf(idea) + 1) % ideas.length]); setBuilt(false); }}>Not sure? <span>Try a random idea</span><Icon name="Shuffle" size={15}/></button></div>
            <div className="idea-input"><textarea aria-label="Your story idea" maxLength={2000} value={idea} onChange={e => {setIdea(e.target.value);setBuilt(false);}} placeholder="Every world begins with an idea. What’s yours?"/><span>{idea.length.toLocaleString()} / 2,000</span></div>
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
        {section === "Projects" ? <>{!loaded ? <p>Loading your drafts…</p> : filtered.length ? <div className="project-grid">{filtered.map(draft => <button className="project-card" key={draft.id} onClick={() => { setIdea(draft.idea);setFormat(draft.format);setStyle(draft.style);setBuilt(false);navigate("Create");setMessage("Draft opened. You can revise your idea and save a new version."); }}><img src={art("fantasy")} alt=""/><span className="project-meta">LOCAL DRAFT · {draft.format}</span><h3>{draft.title}</h3><p>{draft.idea}</p><small>{draft.style} · {new Date(draft.createdAt).toLocaleDateString()}</small></button>)}</div> : <div className="studio-empty"><Icon name="Projects" size={40}/><h3>{query ? "No matching projects" : "Your first world is waiting."}</h3><p>{query ? "Try another name or story detail." : "Create a story to save your first draft in this browser."}</p></div>}</> : section === "Export" ? <div className="studio-empty"><Icon name="Export" size={40}/><h3>Keep a copy of your ideas.</h3><p>Download your {drafts.length} local story {drafts.length === 1 ? "draft" : "drafts"} as a JSON file.</p><button className="small-primary" disabled={!drafts.length} onClick={exportDrafts}>Download drafts</button></div> : ["Characters","Locations","Lore","Story Bible","Factions","Timeline","Assets","Templates"].includes(section) ? <><p className="section-note">Example library · These are sample assets, not AI-generated results for your idea.</p><div className="project-grid">{(section === "Characters" ? [["Ren","action"],["Seren","drama"]] : section === "Locations" ? [["Mountain Village","slice"],["Silverwood Forest","historical"],["Unknown Kingdom","fantasy"]] : section === "Timeline" ? [["The Forest Encounter","historical"],["A Kingdom Returns","fantasy"]] : [["The Lost Kingdom","fantasy"],["A New Adventure","adventure"],["Stories of Tomorrow","scifi"]]).map(([name,image]) => <button className="project-card" key={name} onClick={() => show(name, `Sample ${section.toLowerCase()} entry. This illustrates the workspace; story-specific generation will be connected later.`,image)}><img src={art(image)} alt=""/><span className="project-meta">EXAMPLE {section.toUpperCase()}</span><h3>{name}</h3><p>A starting point for a world of possibilities.</p></button>)}</div></> : <div className="studio-empty"><Icon name={section} size={42}/><h3>Your {section.toLowerCase()} workspace is coming next.</h3><p>This area will connect to your story when the full studio is ready. Start by saving a story draft.</p><button className="small-primary" onClick={() => navigate("Create")}>Create a story <Icon name="Arrow" size={16}/></button></div>}
      </section>}
      <footer className="studio-footer">A little idea. An extraordinary world. <span>Made for storytellers.</span></footer>
    </div>
    <dialog ref={dialog} className="studio-dialog" onCancel={() => setDetail(null)} onClick={e => {if(e.target === e.currentTarget)setDetail(null);}}>{detail && <><button className="dialog-close studio-icon" aria-label="Close dialog" onClick={() => setDetail(null)}><Icon name="Close"/></button>{detail.image && <img className="dialog-image" src={art(detail.image)} alt=""/>}<div className="dialog-copy"><p className="studio-eyebrow">AEMPY STUDIO</p><h2>{detail.title}</h2><p>{detail.description}</p><button className="small-primary" onClick={() => setDetail(null)}>Got it</button></div></>}</dialog>
  </div>;
}
