// ===== render =====

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const accentColor = accent => `var(--${TAG_COLORS[accent] || accent || 'muted'})`;

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

// chips
const chipsRoot = $('#chips');
let activeChip = 'all';
FILTER_CHIPS.forEach(c => {
  const dot = c.color ? el('span', { class: 'chip-dot', style: `background: var(--${c.color})` }) : null;
  const btn = el('button',
    { class: 'chip' + (c.id === 'all' ? ' active' : ''), dataset: { chip: c.id } },
    dot, c.label
  );
  btn.addEventListener('click', () => {
    activeChip = c.id;
    $$('.chip').forEach(b => b.classList.toggle('active', b.dataset.chip === c.id));
    applyFilters();
  });
  chipsRoot.appendChild(btn);
});

// timeline
const timelineRoot = $('#timeline');
ERAS.forEach((era, eraIdx) => {
  const eraSection = el('div', { class: 'era', id: era.id });

  eraSection.appendChild(el('div', { class: 'era-header' },
    el('span', { class: 'era-num' }, `Era ${era.number}`),
    el('h2', { class: 'era-title' }, era.title),
    el('span', { class: 'era-range' }, era.range),
  ));
  eraSection.appendChild(el('p', { class: 'era-blurb' }, era.blurb));

  const events = el('div', { class: 'events' });
  era.events.forEach((ev, i) => {
    const card = el('button', {
      class: 'event',
      style: `--accent: ${accentColor(ev.accent)}; animation-delay: ${i * 30}ms`,
      dataset: { tags: ev.tags.join(','), title: ev.title.toLowerCase(), actor: ev.actor.toLowerCase() }
    },
      el('div', { class: 'event-date' }, ev.date),
      el('div', { class: 'event-title' }, ev.title),
      el('div', { class: 'event-actor' }, ev.actor),
      el('div', { class: 'event-why' }, ev.why),
      el('div', { class: 'event-tags' }, ...ev.tags.map(t => el('span', { class: 'tag' }, t)))
    );
    card.addEventListener('click', () => openModal(ev));
    events.appendChild(card);
  });
  eraSection.appendChild(events);

  timelineRoot.appendChild(eraSection);
});

// VS table
const vsTable = $('#vs-table');
vsTable.appendChild(el('thead', {},
  el('tr', {},
    el('th', { class: 'col-date' }, 'Date'),
    el('th', { class: 'col-openai' }, 'OpenAI'),
    el('th', { class: 'col-anthropic' }, 'Anthropic'),
  )
));
const tbody = el('tbody');
VS_TABLE.forEach(row => {
  tbody.appendChild(el('tr', {},
    el('td', { class: 'col-date' }, row.date),
    el('td', { class: row.openai === '—' ? 'empty' : '' }, row.openai),
    el('td', { class: row.anthropic === '—' ? 'empty' : '' }, row.anthropic),
  ));
});
vsTable.appendChild(tbody);

// CEO grid
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

// Future grid
const futureGrid = $('#future-grid');
FUTURE_WINDOWS.forEach(f => {
  futureGrid.appendChild(el('div', { class: 'future-card', style: `--accent: ${accentColor(f.accent)}` },
    el('div', { class: 'future-range' }, f.range),
    el('div', { class: 'future-text' }, f.text),
  ));
});

// Constraints
const constraintsRoot = $('#constraints');
CONSTRAINTS.forEach((c, i) => {
  constraintsRoot.appendChild(el('div', { class: 'constraint', style: `--accent: ${accentColor(c.accent)}; border-left: 3px solid ${accentColor(c.accent)}` },
    el('div', { class: 'constraint-num' }, `0${i + 1}`),
    el('div', { class: 'constraint-name' }, c.name),
    el('div', { class: 'constraint-body' }, c.body),
  ));
});

// ===== filters =====
const searchInput = $('#search');
function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  $$('.event').forEach(card => {
    const tags = card.dataset.tags.split(',');
    const text = `${card.dataset.title} ${card.dataset.actor} ${card.textContent.toLowerCase()}`;
    const matchesChip = activeChip === 'all' || tags.includes(activeChip);
    const matchesSearch = !q || text.includes(q);
    card.classList.toggle('hidden', !(matchesChip && matchesSearch));
  });

  // Hide eras with no visible events
  $$('.era').forEach(era => {
    const visible = era.querySelectorAll('.event:not(.hidden)').length;
    era.style.display = visible === 0 ? 'none' : '';
  });
}
searchInput.addEventListener('input', applyFilters);

// keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') {
    if ($('#modal').classList.contains('open')) {
      closeModal();
    } else {
      searchInput.value = '';
      activeChip = 'all';
      $$('.chip').forEach(b => b.classList.toggle('active', b.dataset.chip === 'all'));
      applyFilters();
    }
  }
});

// ===== modal =====
const modal = $('#modal');
const modalContent = $('#modal-content');
const modalClose = $('#modal-close');

function openModal(ev) {
  modalContent.innerHTML = '';
  modalContent.style.setProperty('--accent', accentColor(ev.accent));
  modalContent.appendChild(el('div', { class: 'event-date' }, ev.date));
  modalContent.appendChild(el('div', { class: 'event-title' }, ev.title));
  modalContent.appendChild(el('div', { class: 'event-actor', style: `color: ${accentColor(ev.accent)}` }, ev.actor));
  modalContent.appendChild(el('div', { class: 'event-body' }, ev.body));
  modalContent.appendChild(el('div', { class: 'event-why', style: `border-left-color: ${accentColor(ev.accent)}` }, `Why it matters: ${ev.why}`));
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// ===== animated counters =====
const animateCount = (node, target) => {
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
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target, +e.target.dataset.count);
      observer.unobserve(e.target);
    }
  });
});
$$('.stat-num').forEach(n => observer.observe(n));
