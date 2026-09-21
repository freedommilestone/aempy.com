# Aempy Landing Page

A premium, cinematic pre-launch waitlist landing page for Aempy - an AI creative studio for storytellers.

## Overview

Aempy helps ordinary people, writers, storytellers, and aspiring animators turn ideas into original anime, animated stories, films, and visual narratives without animation expertise or prompt engineering knowledge.

This is a **PRE-LAUNCH WAITLIST** page focused on:
- Testing market demand
- Collecting email addresses from interested users
- Building anticipation for the product launch

## Features

### Design
- **Premium dark cinematic aesthetic** with deep navy background
- Purple/indigo accent colors with subtle glow effects
- Sophisticated serif display font (Playfair Display) for headlines
- Clean sans-serif for body copy
- Spacious, elegant layout
- Fully responsive (desktop, tablet, mobile)

### Components
- **Header**: Fixed navigation with CTA button
- **Hero**: Split-layout with compelling headline and hero artwork
- **Waitlist Form**: Email capture with validation and success states
- **Capabilities**: 4-column feature showcase
- **Story Showcase**: Infinite auto-scrolling carousel demonstrating creative possibilities
- **Footer**: Minimal footer with links

### Key Interactions
- Smooth animations with respect for `prefers-reduced-motion`
- Hover effects on all interactive elements
- Auto-scrolling carousel that pauses on hover
- Form validation and error handling
- Success state after email submission

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **CSS** - Custom styling (no dependencies)
- **Vanilla JavaScript** - Carousel and form interactions

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
/workspace
├── app/
│   ├── components/
│   │   ├── Header.tsx          # Fixed header navigation
│   │   ├── Hero.tsx            # Hero section with artwork
│   │   ├── WaitlistForm.tsx    # Email capture form
│   │   ├── Capabilities.tsx    # Feature icons section
│   │   ├── StoryShowcase.tsx   # Infinite carousel
│   │   └── Footer.tsx          # Footer links
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts        # Waitlist API endpoint
│   ├── page.tsx                # Main landing page
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── landing.css             # Landing page styles
├── public/
│   └── images/
│       └── hero-art.jpg        # Hero artwork
└── package.json
```

## Waitlist Integration

The waitlist form is currently set up with a basic API endpoint at `/api/waitlist` that logs submissions.

### Next Steps for Production:

1. **Database Integration**: 
   - Connect to a database (PostgreSQL, MongoDB, etc.)
   - Store email, timestamp, source, IP, and user agent

2. **Email Service**:
   - Integrate with ConvertKit, Mailchimp, or similar
   - Send welcome/confirmation emails
   - Set up email sequences

3. **Analytics**:
   - Add Google Analytics or similar
   - Track conversion events:
     - `page_view`
     - `waitlist_email_started`
     - `waitlist_joined`
     - `showcase_viewed`

4. **Anti-Spam**:
   - Add rate limiting
   - Implement CAPTCHA (hCaptcha, reCAPTCHA)
   - Email validation/verification

## Content Guidelines

### What NOT to Add:
- ❌ Fake testimonials
- ❌ Fake customer logos
- ❌ Fake user counts
- ❌ Fake reviews
- ❌ Pricing (product isn't ready yet)
- ❌ Claims that product is available
- ❌ Made-up statistics

### What to Focus On:
- ✅ Story-first messaging
- ✅ Creative possibilities
- ✅ Aspirational imagery
- ✅ Simple, clear CTA
- ✅ Honest "coming soon" messaging

## Customization

### Update Hero Artwork
Replace `/public/images/hero-art.jpg` with your own cinematic artwork.

### Add Carousel Images
Update the `storyCards` array in `/app/components/StoryShowcase.tsx` with actual artwork showcasing different styles and genres.

### Modify Colors
Edit CSS variables in `/app/landing.css`:
```css
:root {
  --color-accent: #8b5cf6;        /* Purple accent */
  --color-bg: #0a0e1a;            /* Dark navy background */
  --color-text: #ffffff;          /* White text */
  /* ... more colors ... */
}
```

## Accessibility

- Semantic HTML structure
- ARIA labels on form inputs
- Keyboard navigation support
- Focus-visible states
- Respects `prefers-reduced-motion`
- High contrast support

## Performance

- Static page generation
- Lazy loading for carousel images
- Optimized fonts with `font-display: swap`
- Minimal JavaScript bundle
- No external dependencies beyond React/Next.js

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari
- Chrome Mobile

## License

© 2026 Aempy. All rights reserved.

## Support

For questions or issues, contact: hello@aempy.com
