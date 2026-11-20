# Henok Neknikie — Portfolio

A single-page portfolio built with Next.js 16 App Router, React 19, strict TypeScript, CSS Modules, and Lucide icons. The design is a dark-first “liquid glass” system with a polished light theme; no Tailwind, database, analytics, or UI framework.

---

## Quick start

Requires **Node.js 20.9 or newer**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run typecheck  # TypeScript, no emit
npm run lint       # ESLint
npm run build      # production build
npm run start      # serve the production build
```

---

## Content and remaining placeholders

All editable copy lives in **`data/content.json`**. The TypeScript files in `data/` re-export it so existing import paths keep working. The visual editor, SEO metadata, and structured data all read from this one source.

| Placeholder | Where to change it |
| --- | --- |
| `SITE_URL` | Vercel environment variable (or `.env.local`); `VERCEL_URL` is detected automatically |
| LinkedIn | `data/content.json` → `profile.linkedin` |
| Project screenshots | `public/projects/` and `data/content.json` → `projects[].image` / `projects[].images` |
| Experience, education, certifications | `data/content.json` → `experience`, `education`, `certifications` |
| Project links and screenshots | `data/content.json` → `projects`, `public/projects/` |
| Skills, navigation, SEO description | `data/content.json` → `skills`, `site` |

The live portrait is `public/images/henok-portrait.jpg`. The editor can replace it with another approved photograph; `profile.portrait.isPlaceholder` should stay `false`. Replace remaining placeholders with verified details only.

---

## Environment variables

Copy `.env.example` to `.env.local` for local development. **Never commit real values.** All secrets are server-only; no `RESEND_API_KEY`, `GITHUB_TOKEN`, or `PUBLISH_PASSWORD` is ever sent to the browser.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | Recommended | Canonical URL used by metadata, robots, sitemap, and Open Graph. `VERCEL_URL` is used automatically when present. `NEXT_PUBLIC_SITE_URL` remains a legacy alias. |
| `PUBLISH_PASSWORD` | For publishing | Server-only publishing password. The editor keyword does **not** grant access. |
| `PUBLISH_SESSION_SECRET` | Recommended | Signs session tokens. Set a long random value to keep sessions independent of the password. |
| `GITHUB_TOKEN` | For publishing | Fine-grained token with **Contents: read and write** on this repository only. |
| `GITHUB_REPO` | For publishing | Repository in `owner/repository-name` form. |
| `GITHUB_BRANCH` | No | Deployed branch; defaults to `main`. |
| `GITHUB_CONTENT_PATH` | No | Content file to commit; defaults to `data/content.json`. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Recommended in production | Shared rate-limit counters on serverless. `KV_REST_API_URL` / `KV_REST_API_TOKEN` are accepted as aliases. |
| `RESEND_API_KEY` | No | Enables server-side contact delivery. |
| `CONTACT_TO_EMAIL` | No | Inbox for contact messages. |
| `CONTACT_FROM_EMAIL` | No | Verified Resend sender, e.g. `Portfolio Contact <contact@your-domain.com>`. |

Without a Redis/KV configuration, rate limiting falls back to a per-instance in-memory bucket. That is fine locally, but **not sufficient on Vercel**, where requests may hit different instances. Configure the shared store before relying on the limits.

---

## Contact form

- The server component `app/page.tsx` decides whether email delivery is configured and passes a boolean to the client form. Client code never reads private environment variables.
- With Resend configured, `app/api/contact/route.ts` validates input, checks origin, rate-limits requests, escapes HTML, strips CRLF from the subject, and sends via the Resend REST API.
- Without Resend, the form still validates and then opens an honest prefilled `mailto:` draft. It never claims the message was sent.
- Validation rules are shared by client and server in `lib/contact.ts`. A hidden honeypot field discards bot submissions.

---

## Visual editor

Type **`Henok`** anywhere outside a form field. This harmless keyword only opens the password dialog; it is shipped to the browser and is **not** an authentication secret.

### Security model

1. The password is checked by the server against `PUBLISH_PASSWORD` using a constant-time comparison.
2. On success, the server issues an **HttpOnly**, **SameSite=Strict**, **Secure** (in production) session cookie with a two-hour expiry.
3. A separate readable CSRF cookie is echoed in a header for every publish request.
4. `/api/publish` verifies the session, CSRF token, and request origin before parsing the body.
5. **Exit** calls `/api/auth/logout`, clearing both cookies immediately.

No password is stored in `localStorage` or `sessionStorage`, and no password is included in publish requests.

### What you can edit

Every name, role, heading, description, paragraph, tag, project, skill, experience entry, education item, certification (including an optional verification link), link, profile photo, organization logo, and per-project preview image. Projects can also hold up to three additional screenshots, which render as a switchable gallery.

- **Drafts** — changes update the page instantly and are saved in `localStorage`. They are private to your browser until published.
- **Download JSON** — saves the current draft as `content.json` so edits can be copied into the project manually when GitHub publishing is not configured.
- **Reset** — discards the private draft and restores published content.
- **Publish** — validates the whole content tree, verifies uploaded image signatures and sizes, writes safe asset paths, and commits `data/content.json` plus any changed images to GitHub. Vercel then rebuilds the site.
- **Duplicate protection** — unchanged files are skipped, so repeated publishes do not create empty commits.

### Publishing setup

Add `PUBLISH_PASSWORD`, and ideally `PUBLISH_SESSION_SECRET`, plus the GitHub variables listed above. Use a fine-grained GitHub token scoped to **Contents: read and write** on the single portfolio repository. Treat the token as a secret and never place it in a `NEXT_PUBLIC_` variable.

Raw GitHub errors are not returned to the client; failures are reported as sanitised status messages.

---

## Design and accessibility

- **Dark first** — first-time visitors get dark; the saved choice is applied before paint to avoid flashing. A polished light theme is available.
- **Glass levels** — reusable surfaces with specular edges; legacy `--glass-bg` aliases are preserved.
- **Typography** — Geist and Geist Mono with fluid editorial headings.
- **Background motion** — aurora ribbons, orbs, halo, beam, sweep, particles, shooting stars, a drifting grid, and the hero blueprint. Animations pause when the tab is hidden, and blur cost is reduced on small screens.
- **Pointer lighting** — one passive listener updates only the hovered glass surface; disabled on touch and reduced-motion devices.
- **Scroll reveal** — progressive enhancement through one `IntersectionObserver`. Content stays visible without JavaScript.
- **Preferences** — `prefers-reduced-motion` disables decorative motion; `prefers-reduced-transparency` swaps glass for opaque surfaces.
- **Keyboard support** — skip link, visible focus rings, labelled icon buttons, and the editor dialog traps focus for the password prompt.

---

## Deployment

1. The repository is hosted at `https://github.com/henazx/henok-portfolio`. Push changes to `main` before deploying; Vercel builds from that branch.
2. Import it into Vercel with the default Next.js preset.
3. Add the environment variables described above. At minimum, set `SITE_URL` (or rely on `VERCEL_URL`) and every variable needed for the features you want enabled.
4. Set your custom domain in Vercel and make `SITE_URL` match it exactly.
5. Replace the remaining real-world placeholders listed earlier.

---

## Project structure

```
app/
├── api/
│   ├── auth/login/route.ts     # password verification + session cookie
│   ├── auth/logout/route.ts    # session clearing
│   ├── auth/session/route.ts   # server-verified session restore
│   ├── contact/route.ts        # validated, rate-limited email delivery
│   └── publish/route.ts        # authenticated, validated GitHub publishing
├── globals.css                 # design tokens and utilities
├── layout.tsx                  # fonts, metadata, theme bootstrap, JSON-LD
├── page.tsx                    # single-page composition
├── robots.ts / sitemap.ts
└── opengraph-image.tsx

components/
├── editor/                     # hidden editor, auth dialog, content provider
├── interaction/                # pointer glow, magnetic actions
├── layout/                     # navbar, footer, backdrop, scroll reveal
├── sections/                   # hero, about, experience, projects, skills, credentials, contact
└── ui/                         # shared headings and social links

data/                           # content.json + re-export modules
lib/
├── server/                     # server-only auth, HTTP, validation, GitHub, rate limit
├── publish-client.ts           # browser-side session/CSRF plumbing
├── contact.ts                  # shared contact validation
└── editor.ts                   # keyword, drafts, path helpers

public/                         # CV, portrait, project previews
types/                          # shared TypeScript contracts
```
