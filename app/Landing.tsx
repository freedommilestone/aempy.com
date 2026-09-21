"use client";

import { FormEvent, useState } from "react";

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

const iconProps = {
  width: 36,
  height: 36,
  viewBox: "0 0 36 36",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const capabilities = [
  {
    name: "Develop Your Story",
    icon: (
      <svg {...iconProps}>
        <rect x="1.2" y="1.2" width="33.6" height="33.6" rx="8" />
        <path d="M18 9.2a5.3 5.3 0 0 0-3.1 9.5c.5.4.8 1 .8 1.6v.9h4.6v-.9c0-.6.3-1.2.8-1.6A5.3 5.3 0 0 0 18 9.2Z" />
        <path d="M15.7 23.4h4.6M16.3 25.6h3.4" />
      </svg>
    ),
  },
  {
    name: "Visualize Your World",
    icon: (
      <svg {...iconProps}>
        <rect x="1.2" y="1.2" width="33.6" height="33.6" rx="8" />
        <rect x="9" y="10.5" width="18" height="15" rx="2" />
        <circle cx="13.2" cy="14.6" r="1.3" />
        <path d="m10.2 23.2 5.1-4.4 3.3 2.8 2.2-1.8 5 3.4" />
      </svg>
    ),
  },
  {
    name: "Generate & Animate",
    icon: (
      <svg {...iconProps}>
        <rect x="1.2" y="1.2" width="33.6" height="33.6" rx="8" />
        <circle cx="18" cy="18" r="6.2" />
        <path d="M16.4 15.2v5.6l4.6-2.8-4.6-2.8Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Edit and Polish",
    icon: (
      <svg {...iconProps}>
        <rect x="1.2" y="1.2" width="33.6" height="33.6" rx="8" />
        <path d="M11 14.2h14M11 21.8h14" />
        <circle cx="15.2" cy="14.2" r="2.1" fill="#030b19" />
        <circle cx="21.4" cy="21.8" r="2.1" fill="#030b19" />
      </svg>
    ),
  },
];

export default function Landing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <main className="aempy-landing">
      <div className="ambient-stars" aria-hidden="true" />
      <header className="aempy-header">
        <a className="aempy-brand" href="/" aria-label="Aempy home">
          <svg className="aempy-mark" viewBox="0 0 32 32" aria-hidden="true">
            <defs>
              <linearGradient id="aempy-logo" x1="4" y1="30" x2="28" y2="2" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6d46ff" />
                <stop offset="1" stopColor="#4d9dff" />
              </linearGradient>
            </defs>
            <path fill="url(#aempy-logo)" d="M16 2.4 29.2 29h-6.1l-2.5-5.4H11.4L8.9 29H2.8L16 2.4Zm0 10.2-3.1 6.8h6.2L16 12.6Z" />
          </svg>
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
        {capabilities.map((capability) => (
          <div className="capability" key={capability.name}>
            <span className="capability-icon">{capability.icon}</span>
            <p>{capability.name.replace(" ", "\n")}</p>
          </div>
        ))}
      </section>

      <section className="story-showcase" id="coming-soon" aria-label="Possible Aempy story styles">
        <div className="story-track">
          <div className="story-sequence">
            {stories.map(([name, style]) => (
              <article className="story-card" key={name}>
                <div className="card-art">
                  <img src={`/images/stories/${style}.jpg`} alt="" />
                </div>
                <p>{name}</p>
                <div className="card-reflection" aria-hidden="true">
                  <img src={`/images/stories/${style}.jpg`} alt="" />
                </div>
              </article>
            ))}
          </div>
          <div className="story-sequence" aria-hidden="true">
            {stories.map(([name, style]) => (
              <article className="story-card" key={name}>
                <div className="card-art">
                  <img src={`/images/stories/${style}.jpg`} alt="" />
                </div>
                <p>{name}</p>
                <div className="card-reflection" aria-hidden="true">
                  <img src={`/images/stories/${style}.jpg`} alt="" />
                </div>
              </article>
            ))}
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
