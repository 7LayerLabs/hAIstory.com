// ===== NOW feed — daily updates =====
// Small, current items that aren't worth a permanent timeline note: releases,
// posts, papers, business moves. Newest FIRST. To add an update, copy one object
// to the TOP of the FEED array below.
//
// Each entry:
//   {
//     date:    'Jun 3, 2026',     // display string (any format)
//     sortKey: '2026-06-03',      // 'YYYY-MM-DD' — drives ordering + Today/Yesterday labels
//     kind:    'release',         // one of: release | social | research | funding (see FEED_KINDS)
//     actor:   'Anthropic',       // who
//     text:    'What happened.',  // one or two sentences
//     url:     'https://…'        // optional — source link (omit if none)
//   }

const FEED_KINDS = [
  { id: 'all',      label: 'All',       color: null },
  { id: 'release',  label: 'Releases',  color: '#10a37f' },
  { id: 'social',   label: 'Social',    color: '#ec4899' },
  { id: 'research', label: 'Research',  color: '#a78bfa' },
  { id: 'funding',  label: 'Business',  color: '#f5b400' },
];

// ↓↓↓ Add new updates at the TOP ↓↓↓  (these starter entries are examples — edit or replace them)
const FEED = [
  {
    date: 'Jun 3, 2026', sortKey: '2026-06-03', kind: 'release', actor: 'Anthropic',
    text: 'Claude Opus 4.7 continues its staged rollout to API customers, with faster tool use highlighted in the release notes.',
    url: 'https://www.anthropic.com/news'
  },
  {
    date: 'Jun 3, 2026', sortKey: '2026-06-03', kind: 'social', actor: 'Sam Altman',
    text: 'Teased "a few things we\'re really excited about" shipping this month — no specifics.',
    url: 'https://x.com/sama'
  },
  {
    date: 'Jun 2, 2026', sortKey: '2026-06-02', kind: 'research', actor: 'DeepSeek',
    text: 'New efficiency-focused paper circulating; claims competitive benchmarks at lower training cost. (Verify before trusting the numbers.)',
    url: 'https://arxiv.org'
  },
  {
    date: 'Jun 1, 2026', sortKey: '2026-06-01', kind: 'funding', actor: 'xAI',
    text: 'Reports of a new raise to fund continued Colossus expansion. Figures unconfirmed.'
  },
  {
    date: 'May 30, 2026', sortKey: '2026-05-30', kind: 'release', actor: 'Google DeepMind',
    text: 'Gemini gets an incremental update aimed at agentic/coding workflows.',
    url: 'https://blog.google/technology/google-deepmind/'
  },
];
