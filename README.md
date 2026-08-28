# TraceNet — Citizen Web

Next.js 14 (App Router) + Tailwind CSS. Public marketing dashboard, citizen
sign-up/sign-in, and an authenticated reporting flow (missing/found person,
cases, alerts) — web-limited to file upload instead of live camera capture.

## Project structure

```
tracenet-web/
├── app/                          # Next.js App Router — one folder = one route
│   ├── layout.js                 # Root layout: loads Manrope/Inter, global metadata
│   ├── globals.css               # Tailwind base + a couple of shared utility classes
│   ├── page.js                   # "/" — the public landing/marketing dashboard
│   ├── sign-up/page.js           # "/sign-up"
│   ├── sign-in/page.js           # "/sign-in"
│   ├── dashboard/page.js         # "/dashboard" — authenticated citizen home
│   ├── report-missing/page.js    # "/report-missing"
│   ├── report-found/page.js      # "/report-found"
│   ├── cases/page.js             # "/cases"
│   └── alerts/page.js            # "/alerts"
├── components/
│   ├── Navbar.js                 # Public site header
│   ├── Footer.js                 # Public site footer
│   ├── DashboardShell.js         # Sidebar + topbar wrapper for authenticated pages
│   ├── ui/                       # Reusable primitives
│   │   ├── Button.js
│   │   ├── Card.js
│   │   └── Input.js              # Field, Input, Textarea, Select, FileUpload
│   └── landing/                  # Sections that make up the "/" page
│       ├── Hero.js
│       ├── HowItHelps.js
│       ├── Coverage.js
│       └── CtaBand.js
├── public/                       # Static assets, served as-is
│   ├── logo-icon.png
│   ├── logo-full.png
│   └── favicon.png
├── package.json
├── next.config.js
├── tailwind.config.js            # Brand colors/fonts live here (navy/blue/teal)
├── postcss.config.js
├── jsconfig.json                 # "@/..." import alias → project root
└── .gitignore
```

**Why this shape:** Next.js's App Router turns folders under `app/` directly
into routes — no separate router config needed. `components/` is split by
what's public (landing, Navbar/Footer) vs. what's behind sign-in
(DashboardShell + its pages), so it's obvious at a glance where a change
belongs. `ui/` holds only generic, unopinionated pieces (Button, Card,
form inputs) that don't know anything about TraceNet specifically.

## Design tokens

All brand colors, fonts, and spacing live in `tailwind.config.js` — navy
(`navy-950/900/800`), brand blue (`brand-700…100`), and the logo's teal
(`teal-500/100`, reserved for AI-related UI only). Fonts are Manrope
(headings, `font-head`) and Inter (body, default `font-sans`), loaded via
`next/font/google` in `app/layout.js` — self-hosted at build time, no
external font requests at runtime.

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Getting this into GitHub

1. Unzip this project locally.
2. From inside the `tracenet-web` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — TraceNet citizen web"
   ```
3. Create a new empty repository on GitHub (no README/gitignore — you
   already have them).
4. ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

`node_modules` and `.next` are already excluded via `.gitignore` — don't
commit those.

## Deploying on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Import the GitHub repo you just pushed. Vercel auto-detects Next.js —
   no configuration needed (build command, output directory, install
   command are all inferred).
3. Click **Deploy**. You'll get a live `*.vercel.app` URL in a couple of
   minutes.
4. Every future `git push` to `main` auto-deploys. Pushes to other
   branches get their own preview URL — handy for showing draft changes
   to your team/panel before merging.

## Current limitations (by design, for this stage)

- Forms don't submit anywhere yet — no backend/database wired up. That's
  the next layer once the front end is approved.
- "Sign in" / "Create account" don't persist a session — `/dashboard` and
  its sub-pages are reachable directly, not actually access-gated yet.
- File upload accepts an existing photo only — no live camera capture on
  web (matches what was asked: uploading is fine, capture is mobile-app
  only).
