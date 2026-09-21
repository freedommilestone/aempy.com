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

const capabilities = [
  ["✦", "Develop", "Your Story"],
  ["▧", "Visualize", "Your World"],
  ["▷", "Generate", "& Animate"],
  ["☷", "Edit", "and Polish"],
] as const;

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

      <section className="story-showcase" id="coming-soon" aria-label="Possible Aempy story styles">
        <div className="story-track">
          {[...stories, ...stories].map(([name, style], index) => (
            <article className={`story-card ${style}`} key={`${name}-${index}`}>
              <div className="card-art" aria-hidden="true" />
              <p>{name}</p>
            </article>
          ))}
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
