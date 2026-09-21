"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  const genres = [
    { name: "Fantasy", image: "🏰" },
    { name: "Sci-Fi", image: "🚀" },
    { name: "Slice of Life", image: "🌸" },
    { name: "Action", image: "⚔️" },
    { name: "Cozy", image: "☕" },
    { name: "Drama", image: "🎭" },
    { name: "Adventure", image: "🗺️" },
    { name: "Cyberpunk", image: "🌃" },
    { name: "Historical", image: "🏛️" },
    { name: "Comedy", image: "😄" },
  ];

  return (
    <div className="animated-home">
      <header className="animated-header">
        <div className="animated-header-content">
          <a href="/" className="animated-logo">
            <span className="logo-icon">A</span>
            <span className="logo-text">Aempy</span>
          </a>
          <nav className="animated-nav">
            <a href="/">Home</a>
            <a href="#about">About</a>
            <a href="#coming-soon">Coming Soon</a>
          </nav>
          <a href="#waitlist" className="nav-join-btn">Join Waitlist</a>
        </div>
      </header>

      <main className="animated-main">
        <div className="hero-background"></div>
        
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <p className="hero-kicker">AI STUDIO FOR STORYTELLERS</p>
              <h1 className="hero-title">
                Turn Your Ideas<br />
                Into <span className="gradient-text">Animated Worlds.</span>
              </h1>
              <p className="hero-description">
                Aempy will help you develop, visualize, and create original
                anime, animated stories, and more — with AI that understands
                story, characters, and cinematic direction.
              </p>
              <p className="hero-subtext">No prompt expertise required.</p>

              {submitted ? (
                <div className="hero-success">
                  <p>✓ You're on the list!</p>
                  <p className="success-subtext">We'll reach out when Aempy is ready.</p>
                </div>
              ) : (
                <form className="hero-form" onSubmit={onSubmit} id="waitlist">
                  <div className="email-input-wrapper">
                    <span className="email-icon">✉</span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button className="hero-join-btn" type="submit">
                    Join Waitlist →
                  </button>
                </form>
              )}

              <p className="hero-footnote">
                Be the first to know when we launch. No spam, just updates.
              </p>
            </div>

            <div className="hero-tagline">
              <p>Same</p>
              <p>Stories.</p>
              <p>Bigger</p>
              <p>Worlds.</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="feature">
            <div className="feature-icon">💡</div>
            <div className="feature-text">
              <h3>Develop</h3>
              <p>Your Story</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🖼️</div>
            <div className="feature-text">
              <h3>Visualize</h3>
              <p>Your World</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">▶️</div>
            <div className="feature-text">
              <h3>Generate</h3>
              <p>& Animate</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">✨</div>
            <div className="feature-text">
              <h3>Edit</h3>
              <p>and Polish</p>
            </div>
          </div>
        </section>

        <section className="genres-section">
          <div className="genres-carousel">
            {genres.map((genre, index) => (
              <div key={index} className="genre-card">
                <div className="genre-image">{genre.image}</div>
                <p className="genre-name">{genre.name}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="animated-footer">
          <p>For Dreamers. For Creators. For the Next Generation of Stories.</p>
        </footer>
      </main>
    </div>
  );
}
