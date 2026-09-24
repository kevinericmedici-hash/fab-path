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
`localStorage`; there are no accounts.

## Layout

- `index.html`, `about.html`, `careers.html`: the public pages.
- `learn.html`, `supercap-learn.html`, `fet-learn.html`, `chip-learn.html`: each
  course's path.
- `unitN.html`, `lessonN.html`, `gameN.html` (plus `supercap*`, `fet*`, and
  `chip*` equivalents): study slides, quizzes, and games.
- `*-course-data.js`, `*-questions-data.js`: course structure and quiz content.
- `style.css`: shared styles, including the brand and design tokens at the end.
- `fonts/`: self-hosted Inter and JetBrains Mono (SIL Open Font License).

## Before going public

- `og-image.png` is referenced with a relative path in the social tags on
  `index.html`, `about.html`, and `careers.html`. Link previews on most
  platforms need an absolute URL, so change those three `og:image` and
  `twitter:image` values to `https://<your-domain>/og-image.png` once the site
  has a home.
- Add a canonical URL, `robots.txt`, and a sitemap once the domain is known.

Fab Path is an independent educational project and is not affiliated with any
company mentioned on the site.
