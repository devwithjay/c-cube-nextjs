# C Cube Club Website — Frontend Phase

A modern, light-themed club website for **C Cube (Character, Competence, and Culture)** at VIT Pune, built with:

- React
- Tailwind CSS
- GSAP + ScrollTrigger
- Vite

The project is intentionally structured so the frontend can later connect to a **Node.js + Express + SQLite** backend.

## 1. Requirements

Install:

- Node.js 18+ (Node 20 LTS recommended)
- npm
- VS Code

Check:

```bash
node -v
npm -v
```

## 2. Install and run

Open the project folder in VS Code, then:

```bash
npm install
npm run dev
```

Vite will show a local URL such as:

```text
http://localhost:5173
```

Open it in the browser.

## 3. Production build

```bash
npm run build
npm run preview
```

## 4. Important folders

```text
c-cube-website/
│
├── public/
│   └── assets/
│       ├── club-logo.svg
│       ├── vit-logo.png
│       ├── events/
│       │   ├── event-placeholder-1.svg
│       │   └── ...
│       └── team/
│           ├── member-placeholder-1.svg
│           └── ...
│
├── src/
│   ├── components/
│   │   ├── EventCard.jsx
│   │   ├── Footer.jsx
│   │   ├── LogoLockup.jsx
│   │   ├── Navbar.jsx
│   │   ├── PillarCard.jsx
│   │   ├── SectionTitle.jsx
│   │   └── TeamCard.jsx
│   ├── data/
│   │   └── clubData.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## 5. Replace images

The VIT logo in `public/assets/vit-logo.png` was extracted from the supplied club formation document.

Replace:

- `public/assets/club-logo.svg` with the final C Cube logo when ready.
- `public/assets/events/event-placeholder-*.svg` with real event photographs.
- `public/assets/team/member-placeholder-*.svg` with actual team member photographs.

Keep the same filenames, or update the paths in `src/data/clubData.js`.

## 6. Update team details

Open:

```text
src/data/clubData.js
```

The document gives the six core roles/names:

- President — Atharv Jambhule
- Vice President — Soham Dode
- Secretary — Deven Kumbhar
- Treasurer — Prem Mankar
- Event Coordinator — Shreyas Landge
- Public Relations Officer — Tushar Mohale

Branch/year are intentionally marked `to be updated` where they were not supplied in the source document.

## 7. Current frontend behaviour

Implemented:

- Floating glass-style navbar
- Responsive mobile menu
- Animated C Cube hero logo
- Hero entrance animation
- Decorative floating elements
- Smooth scrolling
- ScrollTrigger section-heading animation
  - oversized title appears around the centre
  - title shrinks away
  - normal section title docks toward the left
  - section content then reveals
- About section
- Character / Competence / Culture cards
- Vision section
- Mission section
- All 7 proposed activities from the official activity plan
- Event image placeholders
- Circular core-team profiles
- GSAP hover "player intro" popup
- Faculty mentor block
- Contact section
- Responsive design
- Reduced-motion support

## 8. Source-based club information

The content is based on the supplied C Cube Club Formation Form AY 2026–27.

Important source facts used in the website:

- Club: C Cube — Character, Competence, and Culture
- Campus: VIT Pune
- Faculty Mentor: Prof. Vijay Gaikwad
- Target audience: students
- 7 proposed activities:
  1. 3Q Online Assessment Test — September 2026
  2. DYS — Discover Yourself Series — September 2026
  3. MMC — Mentorship and Mindset Connect — November 2026
  4. C Cube Mentoring Program — November 2026
  5. Book Reading Sessions — December 2026
  6. Study Enhancement Sessions — December 2026
  7. Sankalpa Camp — January 2027

## 9. Phase 2 — Node + Express + SQLite

Do not add the backend yet. First make sure this frontend is stable.

The planned backend can later expose APIs such as:

```text
GET    /api/events
GET    /api/team
GET    /api/club
POST   /api/contact
POST   /api/events
POST   /api/team
PUT    /api/events/:id
DELETE /api/events/:id
```

A possible SQLite database later:

```text
club
events
team_members
contacts
gallery
```

The React UI is already separated into components/data so moving the hardcoded arrays to API calls will be straightforward.

## 10. Recommended next improvements

After the frontend is working:

1. Add real C Cube logo.
2. Add actual event photos.
3. Add actual member photos + branch/year.
4. Add a gallery.
5. Add event detail modal/page.
6. Build Node + Express API.
7. Add SQLite schema.
8. Replace `clubData.js` hardcoded arrays with API requests.
9. Add admin authentication.
10. Add an admin dashboard for events/team/gallery.
