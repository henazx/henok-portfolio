# Personal Portfolio

A production-ready personal portfolio for a Computer Science graduate and IT Specialist working across IT support, software development, and UX/UI design.

Built with the Next.js App Router, React, TypeScript, CSS Modules, and Lucide icons. The visual language is a dark-first "liquid glass" system: layered translucent surfaces, specular edges, a restrained aurora backdrop, technical grid lines, and monospace metadata accents.

---

## Quick start

Requires **Node.js 20.9 or newer**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
```

---

## Before you deploy: replace the placeholders

All personal content is centralised in `data/`. Nothing is hardcoded inside components.

| Placeholder | Where to change it |
| --- | --- |
| CV file (still a placeholder) | `public/cv/your-name-cv.pdf` and `data/profile.ts` → `cv` |
| Portrait (still a placeholder) | `public/images/portrait-placeholder.svg` and `data/profile.ts` → `portrait` |
| LinkedIn (hidden while empty) | `data/profile.ts` → `linkedin` |
| `https://your-domain.com` | `NEXT_PUBLIC_SITE_URL` (see below) |
| Experience, education, certifications | `data/experience.ts`, `data/education.ts` |
| Project links and screenshots | `data/projects.ts`, `public/projects/` |
| Skills | `data/skills.ts` |
| Navigation and SEO description | `data/site.ts` |

Name, monogram, and email are already set to **Henok Neknikie**, **HN**, and **henokneknikiezx@gmail.com**. Everything else reads from the files above, so no component code needs editing.

The portrait component shows a "Portrait placeholder" label while `portrait.isPlaceholder` is `true`. Set it to `false` after adding a real photograph.

---

## Environment variables

Copy `.env.example` to `.env.local` for local development. All variables are optional; the site builds without them.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used by metadata, sitemap, and Open Graph. Falls back to `https://your-domain.com`. |
| `RESEND_API_KEY` | Optional. Enables server-side contact form delivery through [Resend](https://resend.com). |
| `CONTACT_TO_EMAIL` | Inbox that receives contact messages. |
| `CONTACT_FROM_EMAIL` | Verified Resend sender, e.g. `Portfolio Contact <contact@your-domain.com>`. |

### Contact form behaviour

- With all three Resend variables set, submissions are validated and sent by `app/api/contact/route.ts`.
- Without them, the form still validates, then opens a prefilled `mailto:` draft in the visitor's email app. An inline notice explains this instead of pretending the message was sent.
- Validation rules live in `lib/contact.ts` and are shared by the client form and the API route.

---

## Editing content

```
data/
├── profile.ts      # name, role, summary, about, contact, CV, portrait, social links
├── projects.ts     # project cards, categories, repo/demo links
├── experience.ts   # work history
├── education.ts    # degree and certifications
├── skills.ts       # six skill groups and icons
└── site.ts         # canonical URL, SEO description, navigation
```

Adding a project: copy an object in `data/projects.ts`, give it a unique `slug`, use one of the existing `category` values, add a preview image under `public/projects/`, and fill in `repository` and/or `demo`.

If a project has a `demo` URL, it becomes the full-width featured card when the **All** filter is active. SmartCV is featured this way today.

---

## Design and accessibility

- **Dark first** — new visitors get the dark theme; the choice persists in `localStorage` and is applied before paint to avoid flashing.
- **Glass levels** — three reusable surface levels (`--glass-1-bg` … `--glass-3-bg`) plus specular edge highlights. Legacy aliases (`--glass-bg`, `--glass-bg-strong`) are preserved.
- **Technical layer** — the hero copy sits over a faint schematic overlay of circuit traces, nodes, crosshair markers, dot matrix, and coordinate annotations. It is decorative, `aria-hidden`, and adapts to both themes.
- **Motion** — scroll reveal is progressive enhancement through one `IntersectionObserver`. Content is visible without JavaScript.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables transitions, reveals, and decorative animation.
- **Reduced transparency** — `prefers-reduced-transparency: reduce` swaps glass for opaque surfaces.
- **No backdrop blur** — an `@supports` fallback uses solid surfaces so the layout never depends on `backdrop-filter`.
- **Keyboard support** — skip link, visible focus rings, focus trap and Escape handling in the mobile menu, labelled icon buttons.
- **Responsive** — verified at 1440, 1280, 1024, 820, 390, and 360 px with no horizontal overflow.

---

## Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Build liquid glass portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
2. Framework preset: **Next.js** (auto-detected). No build settings need changing.
3. Add `NEXT_PUBLIC_SITE_URL` with your production domain. Add the Resend variables if you want server-side email.
4. Deploy.

### 3. After the first deploy

- Set the custom domain in Vercel, then update `NEXT_PUBLIC_SITE_URL` to match and redeploy.
- Replace the remaining placeholders listed above.
- Optionally add a `public/og-image` override; the Open Graph image is generated from `app/opengraph-image.tsx`.

---

## Project structure

```
app/
├── api/contact/route.ts   # contact endpoint (Resend)
├── globals.css            # tokens, glass system, utilities
├── layout.tsx             # fonts, metadata, theme bootstrap
├── page.tsx               # single-page composition
├── icon.svg               # favicon
├── opengraph-image.tsx    # generated social image
├── robots.ts / sitemap.ts
└── not-found.tsx

components/
├── layout/                # Navbar, Footer, Backdrop, ThemeToggle, ScrollReveal
├── sections/              # Hero, About, Experience, Projects, Skills, Credentials, Contact
└── ui/                    # SectionHeading, SocialLinks, Reveal helpers

data/                      # all editable content
lib/                       # shared validation
types/                     # shared TypeScript types
public/                    # CV, portrait, project previews
```

---

## Notes

- No Tailwind, no database, no analytics scripts.
- Images are static assets; project previews are stylised SVGs sized 1200 × 750.
- The site is a single page with anchor navigation and a client-side project filter.
