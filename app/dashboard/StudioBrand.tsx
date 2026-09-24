import AempyMark from "../components/AempyMark";

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
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

export function Logo() {
  return <a className="studio-brand" href="/" aria-label="Aempy home"><AempyMark/><span>Aempy<small>Create. Tell. Belong.</small></span></a>;
}

