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
