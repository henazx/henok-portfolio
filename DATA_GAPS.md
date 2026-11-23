# Content and verification gaps

This file records information that is **not** currently published because it has not been supplied or verified. It is for internal use. Public copy deliberately avoids `[TODO]` markers and invented metrics.

## Personal and role details

- Add exact start/end dates for the Addis Mesob role if they should be displayed. The site currently shows "Present" because that is the verified value.
- Confirm whether the Addis Mesob role should say "Information Technology Specialist" or a different official title.
- Add verified numbers for staff supported, average resolution time, uptime, and recurring issues resolved. None were supplied.
- Name the specific software/project contribution at Addis Mesob and what was personally owned.

## Mesob Connect

- Confirm the correct public repository URL. `https://github.com/henazx/internal-messaging-system` returned 404; the site currently links the previously verified `https://github.com/Gololcha-Gemede/mesob-messaging-system`.
- Confirm your exact role and which features you personally implemented.
- Describe the real organizational context without exposing private data.
- Confirm whether WebAuthn was actually implemented or is only present as a dependency.
- Add adoption metrics if available: users, departments, message volume, or time saved.
- Add a real screenshot or screen recording; current previews are stylised SVGs.

## Telegram Job Board

- Confirm your exact role and personal contribution.
- The repository README is still Create React App boilerplate; add a real README describing the problem, architecture, setup, and outcome.
- Confirm whether a deployment URL exists.
- Add measured extraction accuracy for Amharic and English job posts, if available.
- Review the `testParser()` and `testSaver()` calls that run at module load in `parser.js` and `saver.js`.
- Add a real screenshot; the current preview is a stylised SVG.

## High School Counseling Website

- Add a repository, design document, Figma link, or demo URL if one exists.
- Add the final deliverable, audience feedback, or academic result.
- Add real screens or wireframes; the current preview is a stylised SVG.

## Certifications

No certificate files or official verification URLs were supplied. When available, add either an HTTPS verification URL or a file under `public/certificates/` and set `certifications[].link` in `data/content.json`.

## Portfolios and integrations not implemented

- **GitHub API activity/pinned repositories** — not implemented because `GITHUB_TOKEN` publishing access is not configured and no approved live API integration was supplied.
- **Certificate viewer** — not implemented because no certificate files or verification URLs exist.
- **Full-site Amharic translation** — not implemented. The EN/አማ switcher is scoped to the Skills section UI and key copy; approved translations for the remaining sections were not supplied.

## Configuration required for full functionality

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — required for the contact form to deliver email in Vercel Production.
- `GITHUB_TOKEN` with `Contents: Read and write` on `henazx/henok-portfolio`, plus `GITHUB_REPO` — required for visual-editor publishing.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — recommended for shared production rate limiting.
