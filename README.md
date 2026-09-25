# Fab Path

Free, interactive lessons and games on semiconductors, microfabrication, and
devices, built for students heading into the chip industry.

**Courses**

- **Sand to Chip**: how a chip gets made, from quartz sand, purification, crystal
  growth, and wafers to the cleanroom, then the layer-building tools
  (oxidation, deposition, etch, and CMP), lithography, doping, the CMOS
  process flow, yield and metrology, packaging and test, and the industry
  itself (all eight parts live, 48 short units, each a few slides and a
  quiz, plus 8 games).
- **MEMS & Microfabrication**: cleanroom practice, lithography, deposition,
  etching, real MEMS processes, and packaging (54 lessons in 33 short units, 8 games).
- **Supercapacitors**: charge storage, materials, geometries, electrolytes,
  testing, fabrication, and applications (42 lessons, 8 games).
- **BioFETs & MOSFETs**: how a transistor works, building toward biosensing
  (all four parts live, 25 short units).

Each course follows the same loop: illustrated study slides, quizzes,
hands-on games, and practice that targets the questions you miss.

## Running it

It's a static site with no build step:

```
python -m http.server 5737
```

Then open http://localhost:5737. Progress is stored in the browser's
`localStorage`, and synced to Supabase only for learners who sign in.

## Layout

- `index.html`, `about.html`, `careers.html`: the public pages.
- `learn.html`, `supercap-learn.html`, `fet-learn.html`, `chip-learn.html`: each
  course's path.
- `unitN.html`, `lessonN.html`, `gameN.html` (plus `supercap*`, `fet*`, and
  `chip*` equivalents): study slides, quizzes, and games.
- `*-course-data.js`, `*-questions-data.js`: course structure and quiz content.
- `style.css`: shared styles, including the brand and design tokens at the end.
- `fonts/`: self-hosted Inter and JetBrains Mono (SIL Open Font License).

## Deployment

The site is set up for `fab-path.com`: every page has a canonical URL, the
`og-image.png` / `twitter:image` tags on `index.html`, `about.html`, and
`careers.html` use the absolute `https://fab-path.com/og-image.png` URL, and
`robots.txt` / `sitemap.xml` (361 URLs) live at the repo root pointing at
that domain. It's a static build with no server-side code, so any static
host (Vercel, Netlify, Cloudflare Pages, GitHub Pages) can serve it directly
from this repo with no build command.

Fab Path is an independent educational project and is not affiliated with any
company mentioned on the site.
