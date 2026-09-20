export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="logo" href="#top">
          aempy
        </a>
        <nav aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#for-creators">For creators</a>
          <a className="nav-cta" href="#start">
            Start a story
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <p className="kicker">YouTube content creation</p>
          <h1>Create the next iconic story.</h1>
          <p className="lede">
            aempy helps people turn an idea into a cinematic YouTube narrative
            — using professional prompts to generate the scene images and video
            clips that carry the plot.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#start">
              Start creating
            </a>
            <a className="button ghost" href="#how">
              See the workflow
            </a>
          </div>
        </section>

        <section className="storyboard" aria-label="Example storyboard">
          <article className="frame">
            <span className="frame-label">Scene 01 · Image</span>
            <strong>The cold open</strong>
            <p>A deserted diner at 3 a.m. Neon buzz. One empty booth.</p>
          </article>
          <article className="frame">
            <span className="frame-label">Scene 02 · Clip</span>
            <strong>The turn</strong>
            <p>Door chime. A figure steps in. The camera holds too long.</p>
          </article>
          <article className="frame">
            <span className="frame-label">Scene 03 · Image</span>
            <strong>The reveal</strong>
            <p>Close-up: a notebook titled “Episode 1.” Cut to black.</p>
          </article>
        </section>

        <section id="how" className="section">
          <h2>From prompt to publishable scene</h2>
          <p className="section-lede">
            Professional prompts do the directing. You stay in the editor’s
            chair.
          </p>
          <ol className="steps">
            <li>
              <h3>Write the story</h3>
              <p>
                Start with the YouTube video you want to make — hook, beats,
                ending. aempy shapes it into a scene-by-scene outline.
              </p>
            </li>
            <li>
              <h3>Generate scene images</h3>
              <p>
                Each beat gets a directed still: lighting, framing, wardrobe,
                and mood written as a professional image prompt.
              </p>
            </li>
            <li>
              <h3>Cut video clips</h3>
              <p>
                Turn key scenes into motion — short clips you can sequence into
                the iconic story your audience remembers.
              </p>
            </li>
          </ol>
        </section>

        <section id="for-creators" className="section alt">
          <h2>Built for YouTube storytellers</h2>
          <ul className="grid">
            <li>
              <h3>Hooks that look like films</h3>
              <p>
                Open with a still or clip that feels directed, not stock — so
                viewers stay past the first three seconds.
              </p>
            </li>
            <li>
              <h3>Prompts with craft</h3>
              <p>
                Camera language, color, pacing, and character continuity are
                baked into every prompt, not left to chance.
              </p>
            </li>
            <li>
              <h3>A story, not a pile of assets</h3>
              <p>
                Images and clips are generated as scenes in sequence, so the
                episode holds together when you edit.
              </p>
            </li>
          </ul>
        </section>

        <section id="start" className="cta">
          <h2>Your next iconic story starts with a scene.</h2>
          <p>
            Bring the idea. aempy writes the professional prompts and generates
            the images and clips that put it on screen.
          </p>
          <a className="button primary" href="mailto:hello@aempy.com">
            Get early access
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 aempy. YouTube content creation.</p>
      </footer>
    </>
  );
}
