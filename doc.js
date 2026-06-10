// ===== Go Deeper — themed viewer for the content/*.md companion docs =====
// Fetches a whitelisted markdown file and renders it with a small converter,
// so the long-form docs match the site instead of opening as raw plain text.

const DOCS = {
  timeline:    { file: 'content/timeline.md',           title: 'The Full Timeline',        desc: 'The original prose history, era by era, in narrative form.' },
  glossary:    { file: 'content/glossary.md',           title: 'Plain-English Glossary',   desc: 'Every bit of jargon — Transformer, RLHF, MoE, agents — decoded.' },
  predictions: { file: 'content/future-predictions.md', title: 'Predictions, Expanded',    desc: 'CEO timelines and the five real constraints, in depth.' },
  sources:     { file: 'content/sources.md',            title: 'Full Bibliography',        desc: 'The complete primary-source list behind every claim.' },
};

const params = new URLSearchParams(window.location.search);
const docId = DOCS[params.get('doc')] ? params.get('doc') : 'timeline';
const doc = DOCS[docId];

document.title = 'hAIstory · ' + doc.title;
document.body.classList.add('doc-' + docId); // per-doc styling hook (e.g. glossary card grid)
document.getElementById('doc-title').textContent = doc.title;
document.getElementById('doc-desc').textContent = doc.desc;

// ----- doc switcher chips -----
const nav = document.getElementById('doc-nav');
Object.entries(DOCS).forEach(([id, d]) => {
  const a = document.createElement('a');
  a.className = 'chip' + (id === docId ? ' active' : '');
  a.href = 'doc.html?doc=' + id;
  a.textContent = d.title;
  if (id === docId) a.setAttribute('aria-current', 'page');
  nav.appendChild(a);
});

// ----- tiny markdown renderer (just what these four docs use) -----
const escapeHtml = s => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const safeHref = u => (/^https?:\/\//i.test(u) ? u : '#');
const prettyUrl = u => {
  const short = u.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  return short.length > 64 ? short.slice(0, 61) + '…' : short;
};

function inline(s) {
  // links go through NUL-delimited placeholder tokens so the bold/italic passes
  // can't mangle URLs (markdown text itself never contains \x00)
  const tokens = [];
  const token = html => '\x00' + (tokens.push(html) - 1) + '\x00';
  const anchor = (href, text) =>
    '<a href="' + safeHref(href) + '" target="_blank" rel="noopener">' + text + '</a>';
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => token(anchor(u, t)));
  s = s.replace(/https?:\/\/[^\s<>()]+[^\s<>().,;]/g, m => token(anchor(m, prettyUrl(m))));
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/\*([^*]+)\*/g, '<i>$1</i>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s.replace(/\x00(\d+)\x00/g, (m, i) => tokens[+i]);
}

function renderMarkdown(md) {
  const lines = escapeHtml(md.replace(/\r\n/g, '\n')).split('\n');
  const out = [];
  let i = 0;
  let skippedTitle = false; // the hero already shows the doc title — drop the first H1

  const isTableLine = l => /^\s*\|.*\|\s*$/.test(l);
  const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (/^# /.test(line)) {
      if (!skippedTitle) { skippedTitle = true; i++; continue; }
      out.push('<h1>' + inline(line.slice(2)) + '</h1>'); i++; continue;
    }
    if (/^## /.test(line)) { out.push('<h2>' + inline(line.slice(3)) + '</h2>'); i++; continue; }
    if (/^### /.test(line)) { out.push('<h3>' + inline(line.slice(4)) + '</h3>'); i++; continue; }
    if (/^---+\s*$/.test(line)) { out.push('<hr />'); i++; continue; }

    if (/^&gt; ?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^&gt; ?/.test(lines[i])) {
        quote.push(inline(lines[i].replace(/^&gt; ?/, '')));
        i++;
      }
      out.push('<blockquote>' + quote.join('<br />') + '</blockquote>');
      continue;
    }

    if (isTableLine(line) && i + 1 < lines.length && /^\s*\|[\s|:-]+\|\s*$/.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableLine(lines[i])) { rows.push(cells(lines[i])); i++; }
      out.push('<div class="doc-table-wrap"><table>'
        + '<thead><tr>' + head.map(h => '<th>' + inline(h) + '</th>').join('') + '</tr></thead>'
        + '<tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody>'
        + '</table></div>');
      continue;
    }

    if (/^[-*] /.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push('<li>' + inline(lines[i].trim().slice(2)) + '</li>');
        i++;
      }
      out.push('<ul>' + items.join('') + '</ul>');
      continue;
    }

    if (/^\d+\. /.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push('<li>' + inline(lines[i].trim().replace(/^\d+\. /, '')) + '</li>');
        i++;
      }
      out.push('<ol>' + items.join('') + '</ol>');
      continue;
    }

    // glossary entries ("**Term** — definition.") become definition cards
    const def = docId === 'glossary' && line.trim().match(/^\*\*([^*]+)\*\*\s*—\s*(.+)$/);
    if (def) {
      out.push('<div class="def-item"><div class="def-term">' + inline(def[1])
        + '</div><div class="def-text">' + inline(def[2]) + '</div></div>');
      i++; continue;
    }

    // paragraph — gather consecutive plain lines
    const para = [];
    while (i < lines.length && lines[i].trim()
      && !/^(#{1,3} |---|&gt;|[-*] |\d+\. )/.test(lines[i].trim())
      && !isTableLine(lines[i])) {
      para.push(inline(lines[i].trim()));
      i++;
    }
    out.push('<p>' + para.join(' ') + '</p>');
  }
  return out.join('\n');
}

// ----- load -----
const body = document.getElementById('doc-body');
fetch(doc.file)
  .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
  .then(md => { body.innerHTML = renderMarkdown(md); })
  .catch(() => {
    body.innerHTML = '<p class="doc-error">Couldn’t load this document — if you opened the site as a local file, '
      + 'serve the folder instead (<code>python -m http.server 8765</code>) or '
      + '<a href="' + doc.file + '">open the raw markdown</a>.</p>';
  });

// ----- theme toggle (same behavior as the other pages) -----
const themeToggle = document.getElementById('theme-toggle');
const setThemeIcon = () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  themeToggle.textContent = isLight ? '☾' : '☀';
};
setThemeIcon();
themeToggle.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('haistory-theme', next); } catch (e) {}
  setThemeIcon();
});
