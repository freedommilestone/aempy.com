"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import HeroBackdrop from "./HeroBackdrop";

const stories = [
  ["Fantasy", "fantasy"], ["Sci-Fi", "scifi"], ["Slice of Life", "slice"],
  ["Action", "action"], ["Cozy", "cozy"], ["Drama", "drama"],
  ["Adventure", "adventure"], ["Cyberpunk", "cyberpunk"],
  ["Historical", "historical"], ["Comedy", "comedy"],
] as const;

function Arrow({ left = false }: { left?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={left ? "m14 5-7 7 7 7M7 12h14" : "m10 5 7 7-7 7M17 12H3"} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CapabilityIcon({ type }: { type: number }) {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 0 && <><path d="M16 33c0-7-7-9-7-18a15 15 0 0 1 30 0c0 9-7 11-7 18l-3 3H19Z" transform="translate(0 3) scale(1 .85)"/><path d="M18 35h12M19 40h10M22 44h4"/></>}
    {type === 1 && <><rect x="4" y="5" width="40" height="37" rx="3"/><circle cx="15" cy="15" r="2"/><circle cx="33" cy="14" r="1.4"/><path d="m5 34 12-13 11 12 6-7 9 10"/></>}
    {type === 2 && <><circle cx="24" cy="24" r="20"/><path d="m20 15 13 9-13 9Z"/></>}
    {type === 3 && <><path d="M3 13h17m12 0h13M3 34h15m12 0h15M3 24h8"/><circle cx="26" cy="13" r="6"/><circle cx="24" cy="34" r="6"/></>}
  </svg>;
}

export default function Landing() {
  const [email, setEmail] = useState("");
  const [previewMessage, setPreviewMessage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      const bounds = track.getBoundingClientRect();
      track.querySelectorAll<HTMLElement>(".story-card").forEach(card => {
        const box = card.getBoundingClientRect();
        const distance = Math.max(-1, Math.min(1, (box.left + box.width / 2 - bounds.left - bounds.width / 2) / (bounds.width / 2)));
        card.style.setProperty("--lift", `${-36 * distance * distance}px`);
        card.style.setProperty("--turn", `${-12 * distance}deg`);
        card.style.setProperty("--extra-height", `${34 * distance * distance}px`);
      });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    track.addEventListener("scroll", schedule, { passive: true });
    update();
    return () => { observer.disconnect(); track.removeEventListener("scroll", schedule); cancelAnimationFrame(frame); };
  }, []);

  function moveCarousel(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    let next = track.scrollLeft + direction * Math.max(280, track.clientWidth * .55);
    if (direction > 0 && track.scrollLeft >= max - 2) next = 0;
    if (direction < 0 && track.scrollLeft <= 2) next = max;
    track.scrollTo({ left: next, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreviewMessage(true);
  }

  function focusWaitlist() {
    setMenuOpen(false);
    emailRef.current?.focus({ preventScroll: true });
  }

  return (
    <main className="aempy-landing" id="home">
      <a className="skip-link" href="#about">Skip to content</a>
      <HeroBackdrop />
      <header className="aempy-header page-width">
        <a className="aempy-brand" href="#home" aria-label="Aempy home">
          <svg className="aempy-mark" viewBox="0 0 48 52" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="logo-left" x1="9" y1="45" x2="29" y2="8" gradientUnits="userSpaceOnUse"><stop stopColor="#6234f5"/><stop offset=".55" stopColor="#8e73ff"/><stop offset="1" stopColor="#74baff"/></linearGradient>
              <linearGradient id="logo-right" x1="23" y1="10" x2="39" y2="45" gradientUnits="userSpaceOnUse"><stop stopColor="#668cff"/><stop offset=".55" stopColor="#5134b5"/><stop offset="1" stopColor="#9362ff"/></linearGradient>
            </defs>
            <path d="m8 44 16-34" stroke="url(#logo-left)" strokeWidth="12" strokeLinecap="round"/>
            <path d="m24 10 16 34" stroke="url(#logo-right)" strokeWidth="12" strokeLinecap="round"/>
            <path d="m13 35 15 5" stroke="#7757ee" strokeWidth="10" strokeLinecap="round"/>
            <path d="m8 44 5-9" stroke="#5934e6" strokeWidth="11" strokeLinecap="round"/>
          </svg>
          <span>Aempy</span>
        </a>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} id="primary-navigation" aria-label="Primary navigation">
          <a className="active" href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#coming-soon" onClick={() => setMenuOpen(false)}>Coming Soon</a>
        </nav>
        <div className="header-actions">
          <a className="button header-cta" href="#waitlist" onClick={focusWaitlist}>Join Waitlist</a>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span/><span/></button>
        </div>
      </header>

      <section className="aempy-hero page-width" id="about" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">AI STUDIO FOR STORYTELLERS</p>
          <h1 id="hero-title">Turn Your Ideas<br/><span>Into <em>Animated Worlds.</em></span></h1>
          <p className="hero-description">Aempy will help you develop, visualize, and create original anime, animated stories, and more — with AI that understands story, characters, and cinematic direction.</p>
          <p className="prompt-note">No prompt expertise required.</p>
          <form className="waitlist-form" id="waitlist" onSubmit={joinWaitlist}>
            <label className="email-field">
              <svg viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="3" width="24" height="18" rx="2"/><path d="m3 5 11 9L25 5"/></svg>
              <input ref={emailRef} type="email" required autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setPreviewMessage(false); }} placeholder="Enter your email" aria-label="Email address" aria-describedby="waitlist-note"/>
            </label>
            <button className="button" type="submit">Join Waitlist <Arrow/></button>
          </form>
          <p className="privacy-note" id="waitlist-note">{previewMessage ? "Email registration isn’t open yet. Your address hasn’t been saved." : "Be the first to know when we launch. No spam, just updates."}</p>
          <p className="preview-note" role="status">{previewMessage ? "Waitlist registration will be available when we launch." : "Email signup opens soon."}</p>
        </div>
        <p className="hero-script" aria-label="Same stories. Bigger worlds.">Same<br/><span>Stories.</span><br/>Bigger<br/><span>Worlds.</span></p>
      </section>

      <section className="capability-row" aria-label="Aempy capabilities">
        {[["Develop", "Your Story"], ["Visualize", "Your World"], ["Generate", "& Animate"], ["Edit", "and Polish"]].map(([first, second], index) => <div className="capability" key={first}><CapabilityIcon type={index}/><p>{first}<br/>{second}</p></div>)}
      </section>

      <section className="story-showcase" id="coming-soon" aria-label="Explore story genres">
        <div className="story-track" ref={trackRef} tabIndex={0} role="region" aria-label="Story genres. Use left and right arrow keys to explore." onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); moveCarousel(event.key === "ArrowRight" ? 1 : -1); } }}>
          {[...stories, ...stories].map(([name, style], index) => <figure className="story-card" key={`${style}-${index}`} aria-hidden={index >= stories.length ? true : undefined}>
            <div className="card-art"><img src={`/images/generated/${style}.webp`} alt="" width="512" height="768" loading="eager" draggable="false"/></div>
            <figcaption>{name}</figcaption>
            <div className="card-reflection" aria-hidden="true"><img src={`/images/generated/${style}.webp`} alt="" width="512" height="768" draggable="false"/></div>
          </figure>)}
        </div>
        <button className="carousel-arrow previous" type="button" onClick={() => moveCarousel(-1)} aria-label="Previous genres"><Arrow left/></button>
        <button className="carousel-arrow next" type="button" onClick={() => moveCarousel(1)} aria-label="Next genres"><Arrow/></button>
      </section>

      <footer className="aempy-footer"><span/><p>For Dreamers. For Creators. For the Next Generation of Stories.</p><span/></footer>
    </main>
  );
}
