// ===== render =====

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const accentColor = accent => `var(--${TAG_COLORS[accent] || accent || 'muted'})`;

// color-blind-safe identity glyph — short label derived from accent/actor so company
// identity is never conveyed by color alone
const GLYPHS = {
  openai: 'OAI', anthropic: 'ANT', google: 'GOOG', meta: 'META',
  microsoft: 'MSFT', nvidia: 'NV', xai: 'xAI', deepseek: 'DS',
  research: 'RES', infrastructure: 'INFR', infra: 'INFR',
  drama: 'DRMA', funding: 'FUND'
};
function companyGlyph(ev) {
  if (GLYPHS[ev.accent]) return GLYPHS[ev.accent];
  // fallback: derive from the actor name (first significant word, up to 4 chars)
  const word = (ev.actor || '').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/)[0] || '?';
  return word.slice(0, 4).toUpperCase();
}

// scheme guard for data-derived hrefs — blocks javascript:/data: etc. so an imported
// or future URL can never execute on click
const safeUrl = v => (/^(https?:|mailto:)/i.test(String(v == null ? '' : v).trim()) ? v : '#');

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'style') node.style.cssText = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v != null) node.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

// ===== data guard =====
// Each dataset lives in its own file/global. If any failed to load, the first .forEach
// below would throw and leave the whole page blank — so verify them up front (typeof,
// so a missing global doesn't itself throw a ReferenceError) and show a friendly
// fallback instead. Use typeof guards individually since these are separate-file globals.
const REQUIRED_DATA = {
  ERAS: typeof ERAS !== 'undefined' ? ERAS : undefined,
  CEOS: typeof CEOS !== 'undefined' ? CEOS : undefined,
  FUTURE_WINDOWS: typeof FUTURE_WINDOWS !== 'undefined' ? FUTURE_WINDOWS : undefined,
  CONSTRAINTS: typeof CONSTRAINTS !== 'undefined' ? CONSTRAINTS : undefined,
  POWER_SHIFTS: typeof POWER_SHIFTS !== 'undefined' ? POWER_SHIFTS : undefined,
  PRIMARY_SOURCES: typeof PRIMARY_SOURCES !== 'undefined' ? PRIMARY_SOURCES : undefined,
  TAG_COLORS: typeof TAG_COLORS !== 'undefined' ? TAG_COLORS : undefined,
  FILTER_CHIPS: typeof FILTER_CHIPS !== 'undefined' ? FILTER_CHIPS : undefined,
};
const missingData = Object.entries(REQUIRED_DATA)
  .filter(([, v]) => v == null || (Array.isArray(v) && v.length === 0))
  .map(([k]) => k);
if (missingData.length) {
  const host = $('#timeline') || document.body;
  host.appendChild(el('div', { class: 'data-error', role: 'alert' },
    el('h2', {}, 'Timeline failed to load'),
    el('p', {}, `Some data could not be loaded (${missingData.join(', ')}). Please refresh the page or try again later.`)
  ));
  // stop the bootstrap — nothing below can render meaningfully without the data
  throw new Error('hAIstory: missing required data: ' + missingData.join(', '));
}

// ===== filter chips =====
const chipsRoot = $('#chips');
let activeChip = 'all';
FILTER_CHIPS.forEach(c => {
  const dot = c.color ? el('span', { class: 'chip-dot', style: `background: var(--${c.color})` }) : null;
  const btn = el('button',
    { class: 'chip' + (c.id === 'all' ? ' active' : ''), 'aria-pressed': c.id === 'all' ? 'true' : 'false', dataset: { chip: c.id } },
    dot, c.label
  );
  btn.addEventListener('click', () => {
    activeChip = c.id;
    setActiveChip(c.id);
    applyFilters();
  });
  chipsRoot.appendChild(btn);
});

// ===== era nav =====
const eraNavRoot = $('#era-nav');
ERAS.forEach(era => {
  const pill = el('button', {
    class: 'era-pill',
    dataset: { era: era.id },
    style: `--era-color: ${era.eraColor}`
  },
    el('span', { class: 'era-pill-dot' }),
    el('span', { class: 'era-pill-num' }, `Era ${era.number}`),
    el('span', { class: 'era-pill-title' }, ` · ${era.title}`)
  );
  pill.addEventListener('click', () => {
    // honor reduced-motion (scrollIntoView smooth otherwise ignores the CSS rule)
    document.getElementById(era.id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  eraNavRoot.appendChild(pill);
});

// ===== timeline =====
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const eventBySlug = {};

const timelineRoot = $('#timeline');
ERAS.forEach((era) => {
  const eraSection = el('div', {
    class: 'era',
    id: era.id,
    style: `--era-color: ${era.eraColor}`
  });

  eraSection.appendChild(el('div', { class: 'era-header' },
    el('span', { class: 'era-num' }, `ERA ${era.number}`),
    el('h2', { class: 'era-title' }, era.title),
    el('span', { class: 'era-range' }, era.range),
  ));
  eraSection.appendChild(el('p', { class: 'era-blurb' }, era.blurb));

  const events = el('div', { class: 'events' });
  // chronological order — sortKey is 'YYYY-MM-DD' so plain string compare sorts correctly
  const sortedEvents = [...era.events].sort((a, b) => (a.sortKey || '').localeCompare(b.sortKey || ''));
  sortedEvents.forEach((ev, i) => {
    const slug = slugify(ev.title);
    eventBySlug[slug] = ev;
    const tags = Array.isArray(ev.tags) ? ev.tags : [];
    const card = el('button', {
      class: 'event' + (ev.projected ? ' projected' : ''),
      style: `--accent: ${accentColor(ev.accent)}; animation-delay: ${i * 30}ms`,
      dataset: {
        tags: tags.join(','),
        slug,
        // full-text haystack — includes the modal body so search covers everything.
        // text fields coalesced so a missing field never renders literal 'undefined'
        search: `${ev.title || ''} ${ev.actor || ''} ${ev.why || ''} ${ev.body || ''} ${tags.join(' ')}`.toLowerCase()
      }
    },
      el('div', { class: 'event-top' },
        el('span', { class: 'event-glyph' }, companyGlyph(ev)),
        ev.projected ? el('span', { class: 'event-badge' }, 'PROJECTED') : null
      ),
      el('div', { class: 'event-date' }, ev.date),
      el('div', { class: 'event-title' }, ev.title),
      el('div', { class: 'event-actor' }, ev.actor),
      el('div', { class: 'event-why' }, ev.why),
      el('div', { class: 'event-tags' }, ...tags.map(t => el('span', { class: 'tag' }, t)))
    );
    card.addEventListener('click', () => openModal(ev));
    events.appendChild(card);
  });
  eraSection.appendChild(events);

  timelineRoot.appendChild(eraSection);
});

// "TODAY" divider — marks the boundary between recorded history (above) and the
// forward-looking sections (Power Shifts / predictions, below).
// Date is derived from the local clock so it never goes stale.
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const todayDate = new Date();
const todayLabel = `TODAY · ${MONTH_NAMES[todayDate.getMonth()]} ${todayDate.getDate()}, ${todayDate.getFullYear()}`;
timelineRoot.appendChild(el('div', {
  class: 'today-marker',
  role: 'region',
  'aria-label': 'Today — the present-day boundary of the timeline'
},
  el('span', { class: 'today-label' }, todayLabel)
));

// ===== Power Shifts =====
const shiftsRoot = $('#shifts');
POWER_SHIFTS.forEach(s => {
  shiftsRoot.appendChild(el('div', { class: 'shift-row', style: `--shift-color: ${s.accent}` },
    el('div', { class: 'shift-range' }, s.range),
    el('div', { class: 'shift-holder' }, s.holder),
    el('div', { class: 'shift-body' }, s.body),
  ));
});

// ===== VS table =====
const vsTable = $('#vs-table');
vsTable.appendChild(el('thead', {},
  el('tr', {},
    el('th', { class: 'col-date' }, 'Date'),
    el('th', { class: 'col-openai' }, 'OpenAI'),
    el('th', { class: 'col-anthropic' }, 'Anthropic'),
  )
));
const tbody = el('tbody');
// Derive rows from every event that carries a `vs` field, grouped by sortKey (the
// effective date) so events that share a date but differ in display formatting pair up.
const vsRows = {};
ERAS.forEach(era => era.events.forEach(ev => {
  if (!ev.vs) return;
  const key = ev.sortKey || ev.date;
  const row = vsRows[key] || (vsRows[key] = { date: ev.date, sortKey: ev.sortKey || '', openai: '—', anthropic: '—' });
  if (ev.vs.side === 'openai') row.openai = ev.vs.label;
  else if (ev.vs.side === 'anthropic') row.anthropic = ev.vs.label;
  // display the date label from the earliest event for this sortKey
  if ((ev.sortKey || '') && (!row.sortKey || (ev.sortKey || '') < row.sortKey)) {
    row.sortKey = ev.sortKey;
    row.date = ev.date;
  }
}));
Object.values(vsRows)
  .sort((a, b) => (a.sortKey || '').localeCompare(b.sortKey || ''))
  .forEach(row => {
    tbody.appendChild(el('tr', {},
      el('td', { class: 'col-date' }, row.date),
      el('td', { class: row.openai === '—' ? 'empty' : '' }, row.openai),
      el('td', { class: row.anthropic === '—' ? 'empty' : '' }, row.anthropic),
    ));
  });
vsTable.appendChild(tbody);

// ===== Model Release Timeline =====
// Renders only if data/releases.js loaded; hides the section if it didn't,
// so a missing file never blanks the page.
(function renderReleases() {
  const section = document.querySelector('.releases-section');
  if (!section) return;
  if (typeof RELEASES === 'undefined' || !Array.isArray(RELEASES) || !RELEASES.length
    || typeof RELEASE_LABS === 'undefined') {
    section.style.display = 'none';
    return;
  }
  const labById = Object.fromEntries(RELEASE_LABS.map(l => [l.id, l]));
  const labColor = id => `var(--${(labById[id] && labById[id].color) || 'muted'})`;
  const legendRoot = $('#release-legend');
  const yearsRoot = $('#release-years');
  let activeLab = null; // null = show all

  // group by year, chronological
  const byYear = {};
  [...RELEASES]
    .sort((a, b) => (a.sortKey || '').localeCompare(b.sortKey || ''))
    .forEach(r => {
      const year = (r.sortKey || '').slice(0, 4) || '—';
      (byYear[year] || (byYear[year] = [])).push(r);
    });

  function render() {
    yearsRoot.innerHTML = '';
    Object.keys(byYear).sort().forEach(year => {
      const items = byYear[year].filter(r => !activeLab || r.lab === activeLab);
      if (!items.length) return;
      yearsRoot.appendChild(el('div', { class: 'release-year' },
        el('div', { class: 'release-year-label' }, year),
        el('div', { class: 'release-pills' },
          ...items.map(r => el('span', {
            class: 'release-pill',
            style: `--lab: ${labColor(r.lab)}`,
            title: r.note || ''
          },
            el('span', { class: 'release-pill-month' }, r.month || ''),
            el('span', { class: 'release-pill-model' }, r.model)
          ))
        )
      ));
    });
  }

  function setActiveLab(id) {
    activeLab = activeLab === id ? null : id; // click again to clear
    legendRoot.querySelectorAll('.release-lab').forEach(b => {
      const on = b.dataset.lab === activeLab;
      b.classList.toggle('active', on);
      b.classList.toggle('dimmed', activeLab != null && !on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    render();
  }

  RELEASE_LABS.forEach(l => {
    const btn = el('button', { class: 'release-lab', 'aria-pressed': 'false', dataset: { lab: l.id } },
      el('span', { class: 'release-lab-dot', style: `background: var(--${l.color})` }),
      l.label
    );
    btn.addEventListener('click', () => setActiveLab(l.id));
    legendRoot.appendChild(btn);
  });

  render();
})();

// ===== CEO grid =====
const ceoGrid = $('#ceo-grid');
CEOS.forEach(c => {
  const card = el('div', { class: 'ceo-card', style: `--accent: ${accentColor(c.accent)}` },
    el('div', { class: 'ceo-name' }, c.name),
    el('div', { class: 'ceo-role' }, c.role),
    el('ul', {}, ...c.predictions.map(p =>
      el('li', {}, el('b', {}, p.time), el('span', {}, p.text))
    ))
  );
  ceoGrid.appendChild(card);
});

// ===== Future grid =====
const futureGrid = $('#future-grid');
FUTURE_WINDOWS.forEach(f => {
  futureGrid.appendChild(el('div', { class: 'future-card', style: `--accent: ${accentColor(f.accent)}` },
    el('div', { class: 'future-range' }, f.range),
    el('div', { class: 'future-text' }, f.text),
  ));
});

// ===== Constraints =====
const constraintsRoot = $('#constraints');
CONSTRAINTS.forEach((c, i) => {
  constraintsRoot.appendChild(el('div', { class: 'constraint', style: `--accent: ${accentColor(c.accent)}; border-left: 3px solid ${accentColor(c.accent)}` },
    el('div', { class: 'constraint-num' }, `0${i + 1}`),
    el('div', { class: 'constraint-name' }, c.name),
    el('div', { class: 'constraint-body' }, c.body),
  ));
});

// ===== Sources =====
const sourcesGrid = $('#sources-grid');
PRIMARY_SOURCES.forEach(group => {
  const ul = el('ul', { class: 'source-list' });
  group.items.forEach(src => {
    ul.appendChild(el('li', { class: 'source-item' },
      el('a', { href: safeUrl(src.url), target: '_blank', rel: 'noopener' }, src.title),
      el('span', { class: 'source-meta' }, `${src.author} · ${src.year}${src.note ? ' · ' + src.note : ''}`),
    ));
  });
  sourcesGrid.appendChild(el('div', { class: 'source-group' },
    el('div', { class: 'source-cat' }, group.category),
    ul
  ));
});

// ===== filters =====
const searchInput = $('#search');
const resultsStatus = $('#results-status');
const emptyState = $('#empty-state');
const allEventCards = $$('.event');
// toggle the visual 'active' class AND the AT-facing aria-pressed state across chips
function setActiveChip(id) {
  $$('.chip').forEach(b => {
    const on = b.dataset.chip === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  let visibleTotal = 0;
  allEventCards.forEach(card => {
    const tags = (card.dataset.tags || '').split(',').filter(Boolean);
    const matchesChip = activeChip === 'all' || tags.includes(activeChip);
    const matchesSearch = !q || card.dataset.search.includes(q);
    const show = matchesChip && matchesSearch;
    card.classList.toggle('hidden', !show);
    if (show) visibleTotal++;
  });

  $$('.era').forEach(era => {
    const visible = era.querySelectorAll('.event:not(.hidden)').length;
    era.style.display = visible === 0 ? 'none' : '';
  });

  // results count — only while a filter or search is active
  const filtering = q || activeChip !== 'all';
  resultsStatus.textContent = filtering ? `${visibleTotal} of ${allEventCards.length} milestones` : '';
  resultsStatus.classList.toggle('visible', !!filtering);
  emptyState.hidden = visibleTotal !== 0;

  syncFilterUrl();
}

// reflect search query (?q=) and active chip (?filter=) in the URL without adding
// history entries — deep-linked ?event= is preserved untouched
function syncFilterUrl() {
  const url = new URL(window.location);
  const q = searchInput.value.trim();
  if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
  if (activeChip && activeChip !== 'all') url.searchParams.set('filter', activeChip);
  else url.searchParams.delete('filter');
  history.replaceState(history.state, '', url);
}
searchInput.addEventListener('input', applyFilters);

function clearFilters() {
  searchInput.value = '';
  activeChip = 'all';
  setActiveChip('all');
  applyFilters();
}
$('#clear-filters').addEventListener('click', clearFilters);

// restore search + active chip from the URL on load, then apply
(function restoreFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const filter = params.get('filter');
  if (q) searchInput.value = q;
  if (filter && FILTER_CHIPS.some(c => c.id === filter)) {
    activeChip = filter;
    setActiveChip(filter);
  }
  applyFilters();
})();

// ===== keyboard shortcuts =====
document.addEventListener('keydown', (e) => {
  // don't steal focus to the search box while the modal is open (would land behind the overlay)
  if (e.key === '/' && document.activeElement !== searchInput && !$('#modal').classList.contains('open')) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') {
    if ($('#modal').classList.contains('open')) {
      closeModal();
    } else if (searchInput.value.trim() || activeChip !== 'all') {
      // only clear when a filter is actually active — otherwise a stray Escape
      // (e.g. right after closing the modal) would silently wipe nothing/everything
      clearFilters();
    }
  }
});

// ===== modal =====
const modal = $('#modal');
const modalCard = modal.querySelector('.modal-card');
const modalContent = $('#modal-content');
const modalClose = $('#modal-close');
// top-level background regions to make inert / aria-hidden while the modal is open
const bgRegions = [
  document.querySelector('header'),
  document.getElementById('filters'),
  document.querySelector('main'),
  document.querySelector('footer')
];
let lastFocused = null;

let modalOpen = false;
// true only when opening pushed a dedicated history entry (so a single Back closes it).
// A deep-link / popstate open does NOT push, so closing must strip the param instead.
let modalPushed = false;

function openModal(ev, { updateUrl = true } = {}) {
  const wasOpen = modalOpen;
  modalContent.innerHTML = '';
  modalContent.style.setProperty('--accent', accentColor(ev.accent));
  if (ev.projected) {
    modalContent.appendChild(el('span', { class: 'event-badge' }, 'PROJECTED'));
  }
  modalContent.appendChild(el('div', { class: 'event-date' }, ev.date));
  modalContent.appendChild(el('div', { class: 'event-title', id: 'modal-title' }, ev.title));
  modalContent.appendChild(el('div', { class: 'event-actor', style: `color: ${accentColor(ev.accent)}` }, ev.actor));
  modalContent.appendChild(el('div', { class: 'event-body' }, ev.body));
  modalContent.appendChild(el('div', { class: 'event-why', style: `border-left-color: ${accentColor(ev.accent)}` }, `Why it matters: ${ev.why}`));
  if (ev.source && ev.source.url) {
    modalContent.appendChild(el('a', {
      class: 'modal-source',
      href: safeUrl(ev.source.url),
      target: '_blank',
      rel: 'noopener'
    }, `Source: ${ev.source.label || ev.source.url}`));
  }
  modal.classList.toggle('projected', !!ev.projected);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // a11y: remember what was focused, move focus into the dialog.
  // only capture on a fresh open — on a modal→modal switch the active element is the
  // prior dialog's close button, which would clobber the real return target
  if (!wasOpen) lastFocused = document.activeElement;
  modalClose.focus();

  // a11y: take the background out of the tab order + a11y tree while the modal is open
  bgRegions.forEach(r => { if (r) { r.setAttribute('inert', ''); r.setAttribute('aria-hidden', 'true'); } });

  // shareable URL.
  // - opening from a non-modal state: push exactly ONE history entry (so one Back closes it)
  // - modal→modal (switching events while open): replace, so we don't stack entries
  if (updateUrl) {
    const url = new URL(window.location);
    url.searchParams.set('event', slugify(ev.title));
    const state = { ...(history.state || {}), event: slugify(ev.title) };
    if (wasOpen) {
      history.replaceState(state, '', url); // modal→modal: don't stack entries
    } else {
      history.pushState(state, '', url);    // first open: exactly one Back closes it
      modalPushed = true;
    }
  }
  modalOpen = true;
}
function closeModal({ updateUrl = true } = {}) {
  modal.classList.remove('open');
  modal.classList.remove('projected');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // a11y: restore the background to the tab order + a11y tree
  bgRegions.forEach(r => { if (r) { r.removeAttribute('inert'); r.removeAttribute('aria-hidden'); } });

  // a11y: return focus to the card that opened the modal
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  lastFocused = null;

  modalOpen = false;

  // Return to the pre-modal URL.
  // - opened via a pushed entry: step Back one (fires popstate → syncModalToUrl no-op)
  // - opened via deep-link/popstate (no pushed entry): just strip ?event= in place,
  //   so closing never navigates the user off the page
  // - close triggered by popstate itself (updateUrl=false): URL already updated
  if (updateUrl) {
    if (modalPushed) {
      modalPushed = false;
      history.back();
    } else {
      const url = new URL(window.location);
      url.searchParams.delete('event');
      history.replaceState(history.state, '', url);
    }
  } else {
    modalPushed = false;
  }
}
modalClose.addEventListener('click', () => closeModal());
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// focus trap — keep Tab cycling inside the open dialog
modal.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !modal.classList.contains('open')) return;
  const focusable = modalCard.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// deep-linking: open the event named in ?event=, and react to back/forward
function syncModalToUrl() {
  const slug = new URLSearchParams(window.location.search).get('event');
  if (slug && eventBySlug[slug]) {
    openModal(eventBySlug[slug], { updateUrl: false });
  } else if (modal.classList.contains('open')) {
    closeModal({ updateUrl: false });
  }
}
window.addEventListener('popstate', syncModalToUrl);
syncModalToUrl();

// ===== hero stats — years/eras/milestones are derived so they can never drift =====
const STATS = {
  years: new Date().getFullYear() - 1950,
  eras: ERAS.length,
  milestones: ERAS.reduce((n, e) => n + e.events.length, 0),
  // labs is a MANUALLY-CURATED count (NOT auto-derived — counting distinct orgs from
  // free-text actor names isn't reliable). The 24 orgs it represents:
  // IBM, Google, DeepMind, OpenAI, Microsoft, Anthropic, Meta, Stability AI, xAI, NVIDIA,
  // DeepSeek, Amazon, Oracle, SoftBank, Constellation, SSI, Pinecone, Weaviate, Chroma,
  // LangChain, Mistral, Baidu, Alibaba, Moonshot
  labs: 24,
};
$$('.stat-num').forEach(n => {
  const key = n.dataset.stat;
  if (key && STATS[key] != null) n.dataset.count = STATS[key];
});

// ===== animated counters =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animateCount = (node, target) => {
  if (reduceMotion) { node.textContent = target; return; }
  const duration = 1200;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    node.textContent = Math.round(easeOut(t) * target);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target, +e.target.dataset.count);
      counterObserver.unobserve(e.target);
    }
  });
});
$$('.stat-num').forEach(n => counterObserver.observe(n));

// ===== theme toggle (light / dark) =====
const themeToggle = $('#theme-toggle');
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

// ===== era nav active state on scroll =====
const eraSections = ERAS.map(e => document.getElementById(e.id));
const eraPills = $$('.era-pill');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      eraPills.forEach(p => {
        const on = p.dataset.era === id;
        p.classList.toggle('active', on);
        if (on) p.setAttribute('aria-current', 'true');
        else p.removeAttribute('aria-current');
      });
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
eraSections.forEach(s => s && navObserver.observe(s));

// ===== NOW teaser — latest 3 updates, links to the full feed =====
// Renders only if data/feed.js loaded; never blocks the timeline if it didn't.
(function renderNowTeaser() {
  const host = document.getElementById('now-teaser');
  if (!host) return;
  if (typeof FEED === 'undefined' || !Array.isArray(FEED) || !FEED.length) {
    host.style.display = 'none';
    return;
  }
  const kinds = (typeof FEED_KINDS !== 'undefined')
    ? Object.fromEntries(FEED_KINDS.map(k => [k.id, k])) : {};
  const kColor = id => (kinds[id] && kinds[id].color) || 'var(--muted)';

  const pad = n => String(n).padStart(2, '0');
  const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date();
  const todayKey = isoOf(now);
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const yKey = isoOf(yest);
  const whenLabel = it => it.sortKey === todayKey ? 'Today' : it.sortKey === yKey ? 'Yesterday' : it.date;

  const latest = [...FEED].sort((a, b) => (b.sortKey || '').localeCompare(a.sortKey || '')).slice(0, 3);

  host.appendChild(el('div', { class: 'now-teaser-inner' },
    el('div', { class: 'now-teaser-head' },
      el('span', { class: 'now-teaser-kicker' }, el('span', { class: 'live-dot', 'aria-hidden': 'true' }), 'Now'),
      el('span', { class: 'now-teaser-title' }, 'Latest updates')
    ),
    el('div', { class: 'now-teaser-list' },
      ...latest.map(it => el('div', { class: 'now-teaser-item' },
        el('span', { class: 'now-teaser-dot', 'aria-hidden': 'true', style: `--kind: ${kColor(it.kind)}` }),
        el('span', { class: 'now-teaser-when' }, whenLabel(it)),
        el('span', { class: 'now-teaser-text' }, el('b', {}, it.actor ? `${it.actor} — ` : ''), it.text || '')
      ))
    ),
    el('a', { class: 'now-teaser-cta', href: 'now.html' }, 'See all updates →')
  ));
})();
