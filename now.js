// ===== NOW feed renderer =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

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

// only allow safe link schemes
const safeUrl = v => (/^(https?:|mailto:)/i.test(String(v || '').trim()) ? v : '#');

// ===== data guard =====
if (typeof FEED === 'undefined' || typeof FEED_KINDS === 'undefined' || !Array.isArray(FEED)) {
  const host = $('#feed') || document.body;
  host.appendChild(el('div', { class: 'data-error', role: 'alert' },
    el('h2', {}, 'Feed failed to load'),
    el('p', {}, 'data/feed.js could not be loaded. Please refresh the page.')
  ));
  throw new Error('hAIstory Now: FEED data missing');
}

const KIND = Object.fromEntries(FEED_KINDS.filter(k => k.id !== 'all').map(k => [k.id, k]));
const kindColor = id => (KIND[id] && KIND[id].color) || 'var(--muted)';
const kindLabel = id => (KIND[id] && KIND[id].label) || id;

// ===== date helpers (for Today / Yesterday labels) =====
const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const _today = new Date();
const TODAY_KEY = isoOf(_today);
const _yest = new Date(_today); _yest.setDate(_yest.getDate() - 1);
const YESTERDAY_KEY = isoOf(_yest);
function dayLabel(sortKey, displayDate) {
  if (sortKey === TODAY_KEY) return 'Today';
  if (sortKey === YESTERDAY_KEY) return 'Yesterday';
  return displayDate;
}

// ===== filter chips =====
const chipsRoot = $('#chips');
let activeChip = 'all';
FEED_KINDS.forEach(c => {
  const dot = c.color ? el('span', { class: 'chip-dot', style: `background: ${c.color}` }) : null;
  const btn = el('button', {
    class: 'chip' + (c.id === 'all' ? ' active' : ''),
    'aria-pressed': c.id === 'all' ? 'true' : 'false',
    dataset: { chip: c.id },
  }, dot, c.label);
  btn.addEventListener('click', () => { activeChip = c.id; setActiveChip(c.id); applyFilters(); });
  chipsRoot.appendChild(btn);
});
function setActiveChip(id) {
  $$('.chip').forEach(b => {
    const on = b.dataset.chip === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

// ===== render feed (grouped by day, newest first) =====
const feedRoot = $('#feed');
const groups = [];
const byKey = {};
[...FEED].sort((a, b) => (b.sortKey || '').localeCompare(a.sortKey || '')).forEach(item => {
  let g = byKey[item.sortKey];
  if (!g) { g = byKey[item.sortKey] = { sortKey: item.sortKey, date: item.date, items: [] }; groups.push(g); }
  g.items.push(item);
});

let itemIndex = 0;
groups.forEach(g => {
  const isToday = g.sortKey === TODAY_KEY;
  const dayEl = el('section', { class: 'feed-day' + (isToday ? ' is-today' : ''), dataset: { key: g.sortKey } },
    el('div', { class: 'feed-day-head' },
      el('span', { class: 'feed-day-label' }, dayLabel(g.sortKey, g.date)),
      el('span', { class: 'feed-day-date' }, g.date)
    )
  );
  const list = el('div', { class: 'feed-list' });
  g.items.forEach(item => {
    const tags = `${item.actor || ''} ${item.text || ''} ${kindLabel(item.kind)} ${item.kind || ''}`.toLowerCase();
    list.appendChild(el('div', {
      class: 'feed-item',
      // stagger the entrance reveal; reduced-motion users have animations disabled via CSS
      style: `--kind: ${kindColor(item.kind)}; animation-delay: ${Math.min(itemIndex++, 16) * 45}ms`,
      dataset: { kind: item.kind || '', search: tags },
    },
      el('div', { class: 'feed-meta' },
        el('span', { class: 'feed-kind' }, kindLabel(item.kind)),
        item.actor ? el('span', { class: 'feed-actor' }, item.actor) : null,
        item.url ? el('a', { class: 'feed-src', href: safeUrl(item.url), target: '_blank', rel: 'noopener' }, 'source ↗') : null
      ),
      el('div', { class: 'feed-text' }, item.text || '')
    ));
  });
  dayEl.appendChild(list);
  feedRoot.appendChild(dayEl);
});

// ===== filters =====
const searchInput = $('#search');
const resultsStatus = $('#results-status');
const emptyState = $('#empty-state');
const allItems = $$('.feed-item');
function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  let visible = 0;
  allItems.forEach(node => {
    const matchKind = activeChip === 'all' || node.dataset.kind === activeChip;
    const matchSearch = !q || node.dataset.search.includes(q);
    const show = matchKind && matchSearch;
    node.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  // hide day groups with nothing visible
  $$('.feed-day').forEach(day => {
    const any = day.querySelectorAll('.feed-item:not(.hidden)').length;
    day.style.display = any === 0 ? 'none' : '';
  });
  const filtering = q || activeChip !== 'all';
  resultsStatus.textContent = filtering ? `${visible} of ${allItems.length} updates` : '';
  resultsStatus.classList.toggle('visible', !!filtering);
  emptyState.hidden = visible !== 0;
}
searchInput.addEventListener('input', applyFilters);
function clearFilters() { searchInput.value = ''; activeChip = 'all'; setActiveChip('all'); applyFilters(); }
$('#clear-filters').addEventListener('click', clearFilters);
applyFilters();

// ===== keyboard shortcuts =====
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault(); searchInput.focus(); searchInput.select();
  }
  if (e.key === 'Escape' && (searchInput.value.trim() || activeChip !== 'all')) clearFilters();
});

// ===== theme toggle (light / dark) =====
const themeToggle = $('#theme-toggle');
const setThemeIcon = () => {
  themeToggle.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '☾' : '☀';
};
setThemeIcon();
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('haistory-theme', next); } catch (e) {}
  setThemeIcon();
});
