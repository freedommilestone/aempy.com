export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="logo" href="/">
          aempy
        </a>
        <nav aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="/studio">Studio</a>
          <a className="nav-cta" href="/studio">
            Open studio
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <p className="kicker">YouTube content creation</p>
          <h1>Create the next iconic story.</h1>
          <p className="lede">
            aempy helps people turn an idea into a cinematic YouTube narrative
            — using professional prompts to board the scenes, generate stills,
            and cut the video clips that carry the plot.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/studio">
              Open studio
            </a>
            <a className="button ghost" href="#how">
              See the workflow
            </a>
          </div>
        </section>

        <section className="storyboard" aria-label="Example storyboard">
          <article className="frame">
            <span className="frame-label">Panel 01</span>
            <strong>The cold open</strong>
            <p>A deserted diner at 3 a.m. Neon buzz. One empty booth.</p>
          </article>
          <article className="frame">
            <span className="frame-label">Panel 02</span>
            <strong>The turn</strong>
            <p>Door chime. A figure steps in. The camera holds too long.</p>
          </article>
          <article className="frame">
            <span className="frame-label">Panel 03</span>
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
              <h3>Lock the title and thumbnail</h3>
              <p>
                Package the click before you finish the cut — working titles
                and thumbnail frames that match the storyboard stills.
              </p>
            </li>
            <li>
              <h3>Record the voice over</h3>
              <p>
                Turn the script into a dry read — breaths, subtext, and timing
                the picture can cut to.
              </p>
            </li>
            <li>
              <h3>Board the scenes</h3>
              <p>
                Each beat becomes a storyboard panel: camera, action, and
                continuity — not a pile of generated stills.
              </p>
            </li>
            <li>
              <h3>Generate scene images</h3>
              <p>
                After the board is locked, each panel becomes a directed still
                — lighting, framing, and wardrobe matching the storyboard.
              </p>
            </li>
            <li>
              <h3>Cut video clips</h3>
              <p>
                Turn key scenes into motion — short clips you can sequence into
                the iconic story your audience remembers.
              </p>
            </li>
            <li>
              <h3>Design sound and music</h3>
              <p>
                Layer signature FX, room tone, and an underscore so the episode
                feels finished — not silent picture.
              </p>
            </li>
            <li>
              <h3>Track the whole project</h3>
              <p>
                Keep the episode on one board through description, captions,
                end screen, and publish — so you always know what is left.
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
                Storyboard panels and clips are built as scenes in sequence, so
                the episode holds together when you edit.
              </p>
            </li>
          </ul>
        </section>

        <section id="start" className="cta">
          <h2>Your next iconic story starts with a scene.</h2>
          <p>
            Open studio and add only what this video needs — a title, a
            thumbnail, a board, or the full YouTube set if you want it.
          </p>
          <a className="button primary" href="/studio">
            Go to studio
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 aempy. YouTube content creation.</p>
      </footer>
    </>
  );
}
