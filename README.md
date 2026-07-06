# Felix Noth — personal website

A static site for GitHub Pages. No build step, no framework. Publications
live in `.bib` files and are rendered in the browser, so keeping the site
current means editing a `.bib` file and pushing.

## Files

| File | What it holds |
|---|---|
| `index.html` | Home page structure; About + Bio text is edited here directly |
| `cv.html` | CV page (same design); all CV sections except publications are edited here directly |
| `style.css` | All styling (shared by both pages) |
| `bib.js` | Renders the `.bib` files on the home page (you rarely touch this) |
| `cv.js` | Renders the `.bib` files on the CV page (you rarely touch this) |
| `working-papers.bib` | Working papers (shared by home page + CV) |
| `publications.bib` | Refereed publications, auto-numbered (shared by home page + CV) |
| `other-publications.bib` | Policy notes, reports, chapters (shared by home page + CV) |
| `assets/profile.jpg` | Your photo |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

The home page and the CV share the same three `.bib` files, so adding a paper
updates **both** at once.

## Add a publication

Open `publications.bib`, copy an existing entry to the **top** of the file,
and edit the fields:

```bibtex
@article{noth2026shortkey,
  author  = {Coauthor, A. and Noth, F.},
  title   = {The paper title},
  year    = {2026},
  journal = {Journal Name 12, 1-20.},
  url     = {https://doi.org/....}
}
```

Then commit and push. That's it — the number `[27]` is assigned
automatically, so nothing below needs renumbering.

- Your name is bolded automatically wherever "Noth" appears.
- For a **working paper**, edit `working-papers.bib` instead. Add
  `abstract = {...}` for a collapsible abstract, and `note = {Revise &
  Resubmit: Journal of X.}` for a status line.
- For **press coverage** on a publication, add a `media` field:
  `media = {Covered by FAZ on ... @@ https://... ;; Second item @@ https://...}`
  (entries separated by `;;`, label and link separated by `@@`).
- Special characters use LaTeX form in the `.bib` (e.g. `\"u` → ü,
  `\ss` → ß, `\&` → &); they are converted for display.

## Add your photo

Drop a portrait image named `profile.jpg` into the `assets/` folder
(roughly 5:6 portrait works best). Until you do, a neutral grey block shows
in its place.

## Edit About / Bio text

These are plain HTML in `index.html` — search for `id="about"` and
`id="bio"` and edit the text between the tags.

## The CV page

The CV lives at `cv.html` and is reachable from the home page's "Curriculum
Vitae" button (and directly at `felixnoth.github.io/cv.html`). It shares the
site's design and pulls its Publications, Working Papers, and Other
Publications from the same `.bib` files — so those stay in sync automatically.

Everything else on the CV (About, Talks, Education, Professional Experience,
Awards, Grants, Affiliations, Refereeing, PhD Supervision, Teaching) is plain
HTML in `cv.html`. To edit, open `cv.html`, find the relevant `<h2>` section,
and edit the lines below it. The patterns are:

- **A dated experience/education row:**
  ```html
  <div class="entry"><div><div class="what">Title</div><div class="with">Institution — Location</div></div><div class="when">2020–today</div></div>
  ```
- **A list item** (talks, awards, teaching, etc.): just add another
  `<li>...</li>` inside the surrounding `<ul>`.

Then commit and push like anything else.

### Getting a PDF of the CV

Open the CV in a browser and click **Download PDF** (top-right), or press
`Cmd/Ctrl + P` → "Save as PDF". A print stylesheet formats it cleanly for
A4 — the toolbar and buttons are automatically hidden in the PDF.

## Deploy to GitHub Pages (one time)

1. Create a **public** repository named exactly `felixnoth.github.io`.
2. Upload the contents of this folder to the repo — either drag the files
   into the "Add file → Upload files" box on github.com, or with git:
   ```
   cd personal-website
   git init
   git add .
   git commit -m "initial site"
   git branch -M main
   git remote add origin https://github.com/felixnoth/felixnoth.github.io.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages**. Under "Build and deployment", set
   Source to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. Wait 1–2 minutes. Your site is live at `https://felixnoth.github.io`.

After that, every push updates the live site automatically.

## Local preview

Because the page fetches the `.bib` files, open it through a small server,
not by double-clicking the file:

```
cd personal-website
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Custom domain (optional, later)

If you buy a domain, add it under Settings → Pages → Custom domain, then
create a `CNAME` file in the repo containing just the domain name, and point
your DNS to GitHub. Ask and I'll walk you through it.
