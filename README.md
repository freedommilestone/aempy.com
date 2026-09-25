# Aempy

A responsive Next.js homepage based on the supplied anime studio design.

## Local development

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` followed by `npm start`.

The homepage includes responsive navigation, a keyboard- and touch-accessible genre carousel, reduced-motion support, and optimized artwork. The waitlist is a visual preview: submission does not save or send email addresses and explicitly tells visitors that registration is not connected.

## Artwork

`public/images/generated/` contains the original generated PNG artwork and compressed WebP versions used by the page. Generation prompts are recorded in `ARTWORK-PROMPTS.md`. The original images from the repository are preserved.

The hero uses the original still artwork with a darker overlay behind the text.

Email storage remains deferred; the form does not collect addresses. Production is hosted on Vercel at https://www.aempy.com.

## Studio dashboard

Visit `/dashboard` for the local studio preview. It includes format/style selection, a reference-image preview, example world details, local draft creation and search, and JSON export. Drafts persist under `aempy-drafts` in browser localStorage; uploaded reference images remain session-only and are not transmitted.

The studio is protected by a temporary shared access code checked on the server. Successful login at `/login` sets a signed, HTTP-only, eight-hour session cookie and redirects to `/dashboard`. Logout clears the cookie. This is a shared preview gate, not individual user accounts; Supabase authentication will replace it later.

Configure `STUDIO_ACCESS_CODE` and a random `STUDIO_SESSION_SECRET` in `.env.local` for development and in Vercel for production. Never commit either value. Drafts still live only in the current browser, and AI generation is not connected. Sample world content is labeled throughout the UI.

## Projects

The protected `/dashboard/projects` page shares the studio sidebar and logo. New visitors see a first-project welcome screen; saved drafts appear in a searchable library with status tabs, sorting, grid/list views, editable names and covers, and archive/restore. Text and Markdown stories can be imported into local drafts. Opening and saving an existing project updates that draft instead of creating a duplicate. No example projects are added to user storage.

Projects use browser localStorage, not individual accounts or cloud storage. The temporary shared-code session also protects the direct projects route.

Individual projects open at `/dashboard/projects/[id]` from the project card or Open Project button. Each workspace shows its own cover in the banner and sidebar, plus an overview, notes, activity, and editable episode/world entries. Entry counts reflect saved content; new projects begin empty. Project settings support names, cover art, tags, status, and JSON export. All workspace changes are stored with that project in the same browser; unavailable project IDs show a recovery link instead of sample content.

Projects can be permanently deleted from library project settings or the individual workspace's Edit Project / Settings controls. A confirmation names the project and explains that its episodes, notes, and world details are removed. Cancel leaves storage unchanged, failed writes keep the project visible, and deleting the final project returns to the first-project welcome screen.

The project Characters section has a dedicated illustrated empty state and cast library. Character records support cast role, Draft/Ready status, and traits; category tabs, text search, status filtering, and sorting operate on the project's saved entries. The active project section is retained in the URL fragment for reload/back navigation. The shared website logo remains unchanged.

Once a project has characters, its cast appears in a compact selectable grid with a detail panel. The panel has Overview, Story, Relationships, Appearances, and Notes tabs. Profile fields, goals, and personality traits are editable from the panel or card menu and persist with the character; empty fields remain explicitly unset. Importance sorting follows cast categories, with optional alphabetical/date sorting and Draft/Ready filters. On narrow screens the selected profile appears above the card grid.

All studio screens share `StudioSidebar` and the existing logo. Outside a project, the menu is Home, Create, Projects, then Library (Assets, Templates, Community). Opening a project changes the sidebar to that project's thumbnail/name, Overview, Episodes, Story Bible, Characters, Locations, Relationships, Factions, Lore, Timeline, Production tools, and project Assets. All Projects returns to global navigation. Project context comes only from the project route, never from `aempy-active-project`; legacy global world-section hashes lead to the project picker. Global Assets and project Assets have separate destinations.

## Story Bible architecture

**Project → Story Bible → world knowledge.** Each project's `workspace` owns its records, custom notes, canon decisions, and activity. No account-wide Story Bible or cross-project record collection is used. Characters retain their dedicated cast editor; Locations, Relationships, Factions, Lore, Timeline, Visual Style, and References expose categories of the same project's Story Bible. Characters, locations, factions, lore, and timeline entries added through the bible use the existing project records. Older custom entries in these categories are consolidated by ID when loaded, preserving canon decisions and data. Relationships combine character profile connections and custom relationship entries.

Canon decisions are keyed by entry ID and source revision within the owning project; source edits return an entry to Pending Review. Custom entries can reference an episode in that same project; this provenance is displayed in recent updates. Creators manually add/review episode-introduced world details and explicitly approve canon. Automatic episode analysis and AI generation are not connected. Category counts, searches, reviews, summaries, imports, and project-named Markdown exports use only that project's data. Text/Markdown note imports are limited to 200 KB / 50,000 characters. All data is still saved in this browser pending Supabase integration.
