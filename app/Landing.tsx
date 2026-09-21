"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const stories = [
  ["Fantasy", "fantasy"],
  ["Sci-Fi", "scifi"],
  ["Slice of Life", "slice"],
  ["Action", "action"],
  ["Cozy", "cozy"],
  ["Drama", "drama"],
  ["Adventure", "adventure"],
  ["Cyberpunk", "cyberpunk"],
  ["Historical", "historical"],
  ["Comedy", "comedy"],
] as const;

const capabilities = [
  ["✦", "Develop", "Your Story"],
  ["▧", "Visualize", "Your World"],
  ["▷", "Generate", "& Animate"],
  ["☷", "Edit", "and Polish"],
] as const;

function StoryCard({ name, style }: { name: string; style: string }) {
  return (
    <article className="story-card">
      <div className="story-card-tilt">
        <div className="card-art">
          <img src={`/images/stories/${style}.jpg`} alt="" />
        </div>
        <p>{name}</p>
      </div>
    </article>
  );
}

export default function Landing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const showcaseRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const showcase = showcaseRef.current;
    const track = trackRef.current;
    if (!showcase || !track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let offset = 0;

    const render = () => {
      const sequence = track.querySelector<HTMLElement>(".story-sequence");
      const loopWidth = (sequence?.offsetWidth ?? 0) + 18;
      if (!reducedMotion.matches && loopWidth > 18) {
        offset = (offset + 0.45) % loopWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      const showcaseRect = showcase.getBoundingClientRect();
      const center = showcaseRect.left + showcaseRect.width / 2;
      track.querySelectorAll<HTMLElement>(".story-card").forEach((card) => {
        const tilt = card.querySelector<HTMLElement>(".story-card-tilt");
        if (!tilt) return;
        const visualCenter = showcaseRect.left + card.offsetLeft + card.offsetWidth / 2 - offset;
        const distance = (visualCenter - center) / card.offsetWidth;
        const limited = Math.max(-4.5, Math.min(4.5, distance));
        const depth = Math.abs(limited);
        tilt.style.transform = `translateY(${-depth * depth * 5}px) translateZ(${-depth * 42}px) rotateY(${limited * -16}deg) scale(${1 - Math.min(depth, 2.4) * 0.045})`;
        tilt.style.opacity = `${Math.max(0.45, 1 - Math.max(0, depth - 2.6) * 0.22)}`;
        card.style.zIndex = `${100 - Math.round(depth * 12)}`;
      });

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <main className="aempy-landing">
      <div className="ambient-stars" aria-hidden="true" />
      <header className="aempy-header">
        <a className="aempy-brand" href="/" aria-label="Aempy home">
          <span className="aempy-mark">A</span>
          <span>Aempy</span>
        </a>
        <nav aria-label="Primary navigation">
          <a className="active" href="/">Home</a>
          <a href="#about">About</a>
          <a href="#coming-soon">Coming Soon</a>
        </nav>
        <a className="header-cta" href="#waitlist">Join Waitlist</a>
      </header>

      <section className="aempy-hero" id="about">
        <div className="hero-copy">
          <p className="eyebrow">AI STUDIO FOR STORYTELLERS</p>
          <h1>
            Turn Your Ideas<br />
            Into <em>Animated Worlds.</em>
          </h1>
          <p className="hero-description">
            Aempy will help you develop, visualize, and create original anime,
            animated stories, and more — with AI that understands story,
            characters, and cinematic direction.
          </p>
          <p className="prompt-note">No prompt expertise required.</p>

          <form className="waitlist-form" id="waitlist" onSubmit={joinWaitlist}>
            {submitted ? (
              <p className="form-success" role="status">
                You’re on the list. We’ll let you know when Aempy is ready.
              </p>
            ) : (
              <>
                <label className="email-field">
                  <span aria-hidden="true">✉</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email address"
                  />
                </label>
                <button type="submit">Join Waitlist <span>→</span></button>
              </>
            )}
          </form>
          {!submitted && (
            <p className="privacy-note">
              Be the first to know when we launch. No spam, just updates.
            </p>
          )}
        </div>

        <div
          className="hero-world"
          role="img"
          aria-label="A creator and companion overlooking a fantastical city at sunset"
        >
          <p className="hero-script">Same<br />Stories.<br />Bigger<br />Worlds.</p>
        </div>
      </section>

      <section className="capability-row" aria-label="Aempy capabilities">
        {capabilities.map(([symbol, first, second]) => (
          <div className="capability" key={first}>
            <span className="capability-icon" aria-hidden="true">{symbol}</span>
            <p>{first}<br />{second}</p>
          </div>
        ))}
      </section>

      <section className="story-showcase" id="coming-soon" aria-label="Possible Aempy story styles" ref={showcaseRef}>
        <div className="story-stage">
          <div className="story-track" ref={trackRef}>
            <div className="story-sequence">
              {stories.map(([name, style]) => (
                <StoryCard name={name} style={style} key={name} />
              ))}
            </div>
            <div className="story-sequence" aria-hidden="true">
              {stories.map(([name, style]) => (
                <StoryCard name={name} style={style} key={name} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <span />
        <p>For Dreamers. For Creators. For the Next Generation of Stories.</p>
        <span />
      </footer>
    </main>
  );
}
