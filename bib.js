/* ============================================================
   bib.js — loads the .bib files and renders the publication
   lists. You should not need to edit this file to add papers;
   just edit the .bib files. Touch this only to change how
   entries are formatted.
   ============================================================ */

/* --- Minimal LaTeX -> Unicode cleanup for display --- */
function deLatex(s) {
  if (!s) return "";
  const map = [
    [/\\"a/g, "ä"], [/\\"o/g, "ö"], [/\\"u/g, "ü"],
    [/\\"A/g, "Ä"], [/\\"O/g, "Ö"], [/\\"U/g, "Ü"],
    [/\\ss(\{\})?/g, "ß"], [/\\ss /g, "ß "],
    [/\\&/g, "&"], [/\\%/g, "%"], [/\\\$/g, "$"], [/\\#/g, "#"], [/\\_/g, "_"],
    [/``/g, "“"], [/''/g, "”"],
    [/---/g, "—"], [/--/g, "–"],
    [/\\'/g, "'"], [/~/g, " "]
  ];
  let out = s;
  for (const [re, rep] of map) out = out.replace(re, rep);
  // strip any remaining single braces used for grouping
  out = out.replace(/[{}]/g, "");
  return out.trim();
}

/* --- Parse a .bib string into an array of entry objects --- */
function parseBib(text) {
  const entries = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    // find next @
    const at = text.indexOf("@", i);
    if (at === -1) break;
    const brace = text.indexOf("{", at);
    if (brace === -1) break;
    // read up to the citekey comma
    let j = brace + 1;
    while (j < n && text[j] !== ",") j++;
    const entry = { _type: text.slice(at + 1, brace).trim().toLowerCase() };
    i = j + 1;
    // read fields until the matching closing brace of the entry
    while (i < n) {
      // skip whitespace and commas
      while (i < n && /[\s,]/.test(text[i])) i++;
      if (text[i] === "}") { i++; break; }
      // read field name
      let f = i;
      while (i < n && text[i] !== "=" && text[i] !== "}") i++;
      if (text[i] === "}") { i++; break; }
      const field = text.slice(f, i).trim().toLowerCase();
      i++; // skip =
      while (i < n && /\s/.test(text[i])) i++;
      let value = "";
      if (text[i] === "{") {
        let depth = 0;
        while (i < n) {
          const c = text[i];
          if (c === "{") { depth++; if (depth === 1) { i++; continue; } }
          else if (c === "}") { depth--; if (depth === 0) { i++; break; } }
          value += c; i++;
        }
      } else if (text[i] === '"') {
        i++;
        while (i < n && text[i] !== '"') { value += text[i]; i++; }
        i++;
      } else {
        while (i < n && text[i] !== "," && text[i] !== "}") { value += text[i]; i++; }
      }
      entry[field] = value.trim();
    }
    if (entry.title) entries.push(entry);
  }
  return entries;
}

/* --- Format an author string ("A and B and C") for display --- */
function fmtAuthors(raw) {
  const parts = deLatex(raw).split(/\s+and\s+/).map(s => s.trim());
  let joined;
  if (parts.length === 1) joined = parts[0];
  else joined = parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];
  // bold Felix Noth
  return joined.replace(/\bNoth\b/g, "<strong>Noth</strong>");
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* --- Title, linked if a url is present --- */
function titleHtml(e) {
  const t = deLatex(e.title);
  if (e.url) return `<a href="${e.url}" target="_blank" rel="noopener">${t}</a>`;
  return t;
}

function mediaHtml(raw) {
  if (!raw) return "";
  const items = raw.split(/\s*;;\s*/).map(chunk => {
    const [label, url] = chunk.split(/\s*@@\s*/);
    if (url) return `<li><a href="${url.trim()}" target="_blank" rel="noopener">${deLatex(label)}</a></li>`;
    return `<li>${deLatex(label)}</li>`;
  });
  return `<ul class="media">${items.join("")}</ul>`;
}

/* --- Renderers --- */
function renderWorkingPapers(entries, el) {
  el.innerHTML = entries.map(e => `
    <article class="pub">
      <p class="cite">${fmtAuthors(e.author)} (${e.year}). ${titleHtml(e)}. ${e.journal ? deLatex(e.journal) : ""}
      ${e.note ? `<span class="status">${deLatex(e.note)}</span>` : ""}</p>
      ${mediaHtml(e.media)}
      ${e.abstract ? `<details><summary>Abstract</summary><p class="abstract">${deLatex(e.abstract)}</p></details>` : ""}
    </article>`).join("");
}

function renderPublications(entries, el) {
  const total = entries.length;
  el.innerHTML = entries.map((e, idx) => `
    <article class="pub numbered">
      <span class="num">[${total - idx}]</span>
      <div>
        <p class="cite">${fmtAuthors(e.author)} (${e.year}). ${titleHtml(e)}. ${e.journal ? deLatex(e.journal) : ""}</p>
        ${mediaHtml(e.media)}
      </div>
    </article>`).join("");
}

function renderOther(entries, el) {
  // group by year, descending
  const byYear = {};
  entries.forEach(e => { (byYear[e.year] = byYear[e.year] || []).push(e); });
  const years = Object.keys(byYear).sort((a, b) => b - a);
  el.innerHTML = years.map(y => `
    <div class="year-group">
      <h3 class="year">${y}</h3>
      ${byYear[y].map(e => `
        <article class="pub">
          <p class="cite">${fmtAuthors(e.author)} (${e.year}). ${titleHtml(e)}. ${e.journal ? deLatex(e.journal) : ""}</p>
        </article>`).join("")}
    </div>`).join("");
}

async function load(file) {
  const res = await fetch(file, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Could not load ${file}`);
  return parseBib(await res.text());
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [wp, pubs, other] = await Promise.all([
      load("working-papers.bib"),
      load("publications.bib"),
      load("other-publications.bib")
    ]);
    renderWorkingPapers(wp, document.getElementById("working-papers-list"));
    renderPublications(pubs, document.getElementById("publications-list"));
    renderOther(other, document.getElementById("other-list"));
  } catch (err) {
    console.error(err);
    document.querySelectorAll(".pub-list").forEach(el => {
      el.innerHTML = `<p class="err">The publication list must be viewed over http (e.g. GitHub Pages or a local server), not opened directly as a file.</p>`;
    });
  }
});
