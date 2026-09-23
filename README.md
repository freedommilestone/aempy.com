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
