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

  return (
    <div className="waitlist-page">
      <main className="waitlist-container">
        <div className="waitlist-content">
          <h1 className="waitlist-logo">aempy</h1>
          <p className="kicker">YouTube content creation</p>
          <h2 className="waitlist-title">Create the next iconic story.</h2>
          <p className="waitlist-description">
            aempy helps people turn an idea into a cinematic YouTube narrative
            — using professional prompts to board the scenes, generate stills,
            and cut the video clips that carry the plot.
          </p>

          {submitted ? (
            <div className="waitlist-success">
              <p>✓ You're on the list</p>
              <p className="waitlist-success-message">
                We'll reach out when aempy is ready.
              </p>
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={onSubmit}>
              <label htmlFor="email" className="visually-hidden">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <button className="button primary" type="submit">
                Join waitlist
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="waitlist-footer">
        <p>© 2026 aempy</p>
      </footer>
    </div>
  );
}
