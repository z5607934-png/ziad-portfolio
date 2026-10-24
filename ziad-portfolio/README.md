# Ziad Mohammed Aref — Front-End Portfolio

A static portfolio site built with plain HTML, CSS and JavaScript (no frameworks, no build step).
It contains three front-end demos a reviewer can open and use immediately.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8080
# then visit http://localhost:8080
```

Serving over HTTP is recommended: some browsers restrict `localStorage` on `file://`.

## Structure

```
index.html                  home page: hero, about, skills, projects, contact
assets/styles.css           design tokens + home page layout
assets/project.css          shell shared by the three demos (top bar, controls, toast)
assets/theme.js             dark / light theme, persisted in localStorage
assets/main.js              nav, scroll spy, reveal, counters, skill bars, contact form
projects/gym/               gym landing page — timetable filter, price switch, BMI tool
projects/clinic/            clinic — specialty filter, 3-step booking wizard, saved visits
projects/store/             supplies shop — search, filters, sorts, persistent cart drawer
```

Each demo is a standalone page: it can be opened directly and linked on its own, and each one
inherits the design tokens from `assets/styles.css` then overrides only its own brand accent.

## Contact details

Already filled in: phone `01274961835`, email `z5607934@gmail.com` (in the `index.html` contact list
and as `EMAIL` in `assets/main.js`, which builds the `mailto:` for the contact form), and
GitHub `https://github.com/z5607934-png`. There is no LinkedIn row.

Still worth a look before sending the link:

| Where | What |
| --- | --- |
| `index.html` hero | the exact job title you want shown (`data-roles` on `#roleType`) |
| `index.html` skills bars | the `data-fill` percentages, if you want them adjusted |
| `index.html` stats | JS/CSS line counts are measured from the files; re-measure if the code changes |

## Scope of the demos

The three projects are **front-end demos**. Their data lives in a JavaScript object or in
`localStorage` inside the visitor's own browser — there is no back end, no database, no booking
system and no payment. Nothing a visitor types is transmitted anywhere. The home page and every
demo page say so on screen.

## Notes for the reviewer

- **IronPulse Gym** — `projects/gym/index.html`. The timetable renders from a data object per day;
  each class shows remaining spots as a bar and the fully-booked ones are marked. The membership
  switch recomputes every plan at −20 %, the BMI calculator validates the range, places a marker on
  the scale and prints the healthy weight window for that height (`18.5 × h²` to `24.9 × h²`).
  The trial form checks the name and an Egyptian mobile pattern (`01[0125]\d{8}`).
- **Nile Care Clinic** — `projects/clinic/index.html`. Specialty chips plus free-text search filter
  the doctor grid. The wizard builds the next 10 days, keeps only the days that fall inside the
  selected doctor's clinic days, then generates 30-minute slots between those hours; a deterministic
  hash marks some as already taken, and anything you book blocks that slot for real. Bookings are
  stored under `nilecare-bookings` and can be cancelled from "My visits".
- **MedSupply Store** — `projects/store/index.html`. Search, category, max-price slider, backorder
  and discount toggles and four sort modes all run over the same 18-item catalogue. The cart drawer
  clamps quantities to stock, adds a flat delivery fee that disappears above EGP 1 500, applies 14 %
  VAT, and persists under `medsupply-cart`. Closing uses `Esc`, the scrim or the close button, and
  the closed drawer is set to `inert` so none of its controls stay focusable behind the page.

## Deploying

The folder is fully static — no build step, so any host works. This is the content that goes on
GitHub: `index.html`, `assets/`, `projects/` and `README.md`. `dist/` and the `*.qoder.site`
descriptor are ignored by `.gitignore` because they are generated copies.

**GitHub Pages**

```bash
git init
git add .
git commit -m "Front-End portfolio with three vanilla-JS demos"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save**.
The site appears at `https://<your-username>.github.io/<repo-name>/` after a minute or two.
A repository called `<your-username>.github.io` serves from the domain root instead, and an
`index.html` at the top level is what both cases need — nothing here has to change.

**Netlify / Vercel** — drag the folder onto Netlify Drop, or point Vercel at the repository with no
build command and no output directory override.

**Your own domain** (e.g. `ziad-mohamed.com`): buy it at Namecheap / Cloudflare / GoDaddy, then add
a `CNAME` file containing the domain to the repository root and follow the host's DNS instructions
(A or CNAME records). GitHub Pages issues the HTTPS certificate automatically.
