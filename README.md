# Felix Noth — personal website

A static site for GitHub Pages. No build step, no framework. Publications
live in `.bib` files and are rendered in the browser, so keeping the site
current means editing a `.bib` file and pushing.

## Files

| File | What it holds |
|---|---|
| `index.html` | Page structure; About + Bio text is edited here directly |
| `style.css` | All styling |
| `bib.js` | Loads and formats the `.bib` files (you rarely touch this) |
| `working-papers.bib` | Working papers |
| `publications.bib` | Refereed publications (auto-numbered) |
| `other-publications.bib` | Policy notes, reports, chapters (grouped by year) |
| `assets/profile.jpg` | Your photo (add this file — see below) |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

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
