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
