/* ============================================================
   cv.js — renders the publication sections of the CV from the
   same .bib files used by the main site (single source of
   truth). Self-contained so the main site's bib.js is untouched.
   You should not need to edit this file to add papers — just
   edit the .bib files.
   ============================================================ */

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
  out = out.replace(/[{}]/g, "");
  return out.trim();
}

function parseBib(text) {
  const entries = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    const at = text.indexOf("@", i);
    if (at === -1) break;
    const brace = text.indexOf("{", at);
    if (brace === -1) break;
    let j = brace + 1;
    while (j < n && text[j] !== ",") j++;
    const entry = { _type: text.slice(at + 1, brace).trim().toLowerCase() };
    i = j + 1;
    while (i < n) {
      while (i < n && /[\s,]/.test(text[i])) i++;
      if (text[i] === "}") { i++; break; }
      let f = i;
      while (i < n && text[i] !== "=" && text[i] !== "}") i++;
      if (text[i] === "}") { i++; break; }
      const field = text.slice(f, i).trim().toLowerCase();
      i++;
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

function fmtAuthors(raw) {
  const parts = deLatex(raw).split(/\s+and\s+/).map(s => s.trim());
  let joined;
  if (parts.length === 1) joined = parts[0];
  else joined = parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];
  return joined.replace(/\bNoth\b/g, "<strong>Noth</strong>");
}

function titleHtml(e) {
  const t = deLatex(e.title);
  if (e.url) return `<a href="${e.url}" target="_blank" rel="noopener">${t}</a>`;
  return t;
}

/* --- CV renderers: compact, print-friendly (no abstracts) --- */
function renderCvPublications(entries, el) {
  const total = entries.length;
  el.innerHTML = entries.map((e, idx) => `
    <div class="cv-pub">
      <span class="num">[${total - idx}]</span>
      <span class="cite">${fmtAuthors(e.author)} (${e.year}). ${titleHtml(e)}. ${e.journal ? deLatex(e.journal) : ""}</span>
    </div>`).join("");
}

function renderCvWorkingPapers(entries, el) {
  el.innerHTML = entries.map(e => `
    <div class="cv-pub">
      <span class="cite">${fmtAuthors(e.author)} (${e.year}). ${titleHtml(e)}. ${e.journal ? deLatex(e.journal) : ""}${e.note ? ` <span class="status">${deLatex(e.note)}</span>` : ""}</span>
    </div>`).join("");
}

function renderCvOther(entries, el) {
  const byYear = {};
  entries.forEach(e => { (byYear[e.year] = byYear[e.year] || []).push(e); });
  const years = Object.keys(byYear).sort((a, b) => b - a);
  el.innerHTML = years.map(y => `
    <div class="cv-year-group">
      <span class="cv-year">${y}</span>
      <div>
        ${byYear[y].map(e => `
          <div class="cv-pub">
            <span class="cite">${fmtAuthors(e.author)}. ${titleHtml(e)}. ${e.journal ? deLatex(e.journal) : ""}</span>
          </div>`).join("")}
      </div>
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
    renderCvPublications(pubs, document.getElementById("cv-publications"));
    renderCvWorkingPapers(wp, document.getElementById("cv-working-papers"));
    renderCvOther(other, document.getElementById("cv-other"));
  } catch (err) {
    console.error(err);
    document.querySelectorAll(".bib-target").forEach(el => {
      el.innerHTML = `<p class="err">Publications load over http (GitHub Pages or a local server), not when opening the file directly.</p>`;
    });
  }
});
