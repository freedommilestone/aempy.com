"use client";

import { FormEvent, useState } from "react";
import Landing from "./Landing";

function LegacyHome() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  const genres = [
    { name: "Fantasy", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Sci-Fi", gradient: "linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)" },
    { name: "Slice of Life", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
    { name: "Action", gradient: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)" },
    { name: "Cozy", gradient: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)" },
    { name: "Drama", gradient: "linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)" },
    { name: "Adventure", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Cyberpunk", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "Historical", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Comedy", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  ];

  return (
    <div className="aempy-home">
      <div className="hero-backdrop"></div>
      <div className="hero-overlay"></div>
      
      <header className="main-header">
        <div className="header-container">
          <a href="/" className="brand">
            <div className="brand-icon">A</div>
            <span className="brand-name">Aempy</span>
          </a>
          <nav className="main-nav">
            <a href="/">Home</a>
            <a href="#about">About</a>
            <a href="#coming-soon">Coming Soon</a>
          </nav>
          <a href="#waitlist" className="header-cta">Join Waitlist</a>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-container">
            <div className="hero-left">
              <p className="hero-label">AI STUDIO FOR STORYTELLERS</p>
              <h1 className="hero-heading">
                Turn Your Ideas<br />
                Into <span className="gradient-heading">Animated Worlds.</span>
              </h1>
              <p className="hero-lead">
                Aempy will help you develop, visualize, and create original
                anime, animated stories, and more — with AI that understands
                story, characters, and cinematic direction.
              </p>
              <p className="hero-note">No prompt expertise required.</p>

              {submitted ? (
                <div className="success-box">
                  <div className="success-icon">✓</div>
                  <div>
                    <p className="success-title">You're on the list!</p>
                    <p className="success-text">We'll reach out when Aempy is ready.</p>
                  </div>
                </div>
              ) : (
                <form className="waitlist-form" onSubmit={onSubmit} id="waitlist">
                  <div className="form-group">
                    <div className="input-icon">✉</div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    Join Waitlist →
                  </button>
                </form>
              )}

              <p className="form-hint">
                Be the first to know when we launch. No spam, just updates.
              </p>
            </div>

            <div className="hero-right">
              <div className="tagline">
                <div className="tagline-line">Same</div>
                <div className="tagline-line">Stories.</div>
                <div className="tagline-line">Bigger</div>
                <div className="tagline-line">Worlds.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon icon-develop">💡</div>
              <div className="feature-info">
                <h3>Develop</h3>
                <p>Your Story</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-visualize">🖼️</div>
              <div className="feature-info">
                <h3>Visualize</h3>
                <p>Your World</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-generate">▶️</div>
              <div className="feature-info">
                <h3>Generate</h3>
                <p>& Animate</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-edit">✨</div>
              <div className="feature-info">
                <h3>Edit</h3>
                <p>and Polish</p>
              </div>
            </div>
          </div>
        </section>

        <section className="genres">
          <div className="genres-scroll">
            {genres.map((genre, idx) => (
              <div key={idx} className="genre-item">
                <div className="genre-thumb" style={{ background: genre.gradient }}>
                  <div className="genre-overlay"></div>
                </div>
                <p className="genre-label">{genre.name}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="main-footer">
          <p>For Dreamers. For Creators. For the Next Generation of Stories.</p>
        </footer>
      </main>
    </div>
  );
}

export default function Home() {
  return <Landing />;
}
