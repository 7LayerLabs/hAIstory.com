# hAIstory — The Race to AGI

An interactive history of artificial intelligence. From Turing's 1950 thought experiment to the trillion-dollar race for AGI.

> Humans accidentally built a new kind of intelligence — and now the entire planet is reorganizing around compute, energy, and agents.

---

## Run it locally

No build step. No npm install. It's vanilla HTML/CSS/JS — open it directly or serve the folder.

```bash
# from the project root
python -m http.server 8765
# then open http://localhost:8765
```

Or just double-click `index.html`. (The Go Deeper doc pages fetch their markdown, so they need the folder *served* — everything else works from a double-click too.)

---

## What's inside

```
hAIstory/
├─ index.html              # the historical timeline (the main site)
├─ now.html                # the NOW feed — daily updates
├─ doc.html                # Go Deeper — themed viewer for the content/*.md docs
├─ styles.css              # design (era color-coded, dark theme) — shared by all pages
├─ script.js               # timeline render + filter + search + modal + NOW teaser
├─ now.js                  # NOW feed render + filter + search
├─ doc.js                  # doc viewer: tiny markdown renderer + doc switcher
├─ README.md               # this file
│
├─ data/                   # all data — easy to edit
│  ├─ events.js            # the 6 eras and 92 events (single source of truth — the OpenAI-vs-Anthropic table is derived from events tagged with a `vs` field)
│  ├─ releases.js          # the Release Race: every major frontier model release, lab-tagged (a deliberate superset of the timeline)
│  ├─ feed.js              # the NOW feed: daily updates (newest first)
│  ├─ people.js            # CEO predictions
│  ├─ future.js            # future windows + the real constraints
│  ├─ shifts.js            # Power Shifts framing
│  └─ sources.js           # primary sources used for the site
│
└─ content/                # long-form companion docs (rendered themed via doc.html)
   ├─ timeline.md          # the original prose timeline
   ├─ sources.md           # full primary-source bibliography
   ├─ glossary.md          # plain-English jargon decoder
   └─ future-predictions.md # CEO predictions and constraints, expanded
```

---

## Features

- **6 eras, color-coded** — sepia foundations → electric blue deep learning → violet LLMs → hot-pink ChatGPT shock → green two-horse race → amber arms race
- **92 events** — every event is a clickable card with a "why it mattered" summary and a deeper modal view
- **Sticky era nav** — jump between eras; the active era highlights as you scroll
- **Filter chips** — by company (OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, NVIDIA, Microsoft) or theme (research, infrastructure, drama, funding)
- **Search** — instant filter on title, actor, or any text
- **Power Shifts section** — who actually controlled AI in each era, and where it's moving next
- **OpenAI vs Anthropic table** — the parallel model race, side by side
- **The Release Race** — every major frontier model release 2018 → today, year by year, color-coded by lab; click a lab in the legend to isolate its track
- **CEO predictions** — Altman, Amodei, Hassabis, with their actual public timelines
- **Primary Sources** — every paper, essay, and announcement linked
- **Keyboard shortcuts** — `/` focuses search, `esc` clears filters or closes modals

---

## Adding events

Edit `data/events.js`. Each event:

```js
{
  date: 'Mar 2024',                          // display string (any format)
  sortKey: '2024-03-01',                      // REQUIRED — 'YYYY-MM-DD'; drives chronological order
  title: 'Claude 3 family',
  actor: 'Anthropic',
  accent: 'anthropic',                        // color tag — see TAG_COLORS
  tags: ['anthropic'],                        // for filter chips
  why: 'One-sentence punch line that goes on the card.',
  body: 'Longer paragraph that shows up in the modal.',
  source: { url: 'https://…', label: 'Anthropic' },   // optional — shown as a link in the modal
  vs: { side: 'anthropic', label: 'Claude 3 (Haiku / Sonnet / Opus)' }, // optional — puts it in the OpenAI-vs-Anthropic table
  projected: true                             // optional — flag not-yet-shipped events (dashed "PROJECTED" styling)
}
```

Insertion order doesn't matter — events render sorted by `sortKey`. Add it to the right era's `events` array and refresh — no rebuild.

## Adding model releases

Edit `data/releases.js`. The Release Race is a deliberate **superset** of the timeline — minor-but-real releases (Grok 2, Qwen 3, GPT-5.1…) belong here even when they aren't milestone-worthy. Each release:

```js
{
  sortKey: '2025-08-07',   // REQUIRED — drives order + year grouping
  month: 'Aug',            // short display month
  lab: 'openai',           // id from RELEASE_LABS (top of the same file)
  model: 'GPT-5',          // the name on the pill
  note: 'One-liner shown as a hover tooltip.'  // optional
}
```

Sanity-check the data files any time with `node tasks/check-data.js`.

---

## The NOW feed (`now.html`)

Two surfaces, two purposes:

- **`index.html` — the timeline** is for milestones that *mattered* (permanent, curated).
- **`now.html` — the NOW feed** is for things that are *happening*: releases, posts, papers, business moves. The small, current stuff that isn't worth a permanent timeline note but keeps things up to date.

The pages cross-link (a "Now →" chip on the timeline header, a "← Timeline" link on the feed), and the timeline shows a **"Latest updates" teaser** (newest 3) at the top, auto-pulled from the feed.

### Adding a daily update

Edit `data/feed.js` and copy one object to the **top** of the `FEED` array (newest first):

```js
{
  date: 'Jun 3, 2026',        // display string (any format)
  sortKey: '2026-06-03',      // 'YYYY-MM-DD' — drives order + the Today/Yesterday labels
  kind: 'release',            // release | social | research | funding
  actor: 'Anthropic',         // who
  text: 'What happened, in a sentence or two.',
  url: 'https://…'            // optional — source link (omit the line if there's none)
},
```

Save, refresh — no rebuild. Entries dated to the real "today"/"yesterday" get those labels automatically; everything else shows its date. The kind/colors live in `FEED_KINDS` at the top of the same file.

### Promoting an update to the timeline

When something in the feed turns out to be historically significant, *promote* it: move it from `data/feed.js` into the right era's `events` array in `data/events.js`. The fields map directly:

| feed entry (`feed.js`) | timeline event (`events.js`) |
|---|---|
| `date`, `sortKey`     | `date`, `sortKey` (keep as-is) |
| `actor`               | `actor` |
| `text`                | split into `why` (one-line punch) + `body` (the fuller paragraph) |
| `url`                 | `source: { url, label }` |
| `kind`                | choose an `accent` + `tags` (e.g. a `release` → the company's accent) |

Then delete the entry from `feed.js`. (There's no automation — it's a deliberate, manual editorial call. Keeping it manual is the point: the feed stays ephemeral, the timeline stays curated.)

---

## Design principles

This is not Wikipedia with prettier CSS. The goal is **interpretation, framing, narrative, and visual progression** — not just dates. The story being told:

> The Transformer (2017) was the inflection point. OpenAI scaled it up. Anthropic broke off over how fast was too fast. The whole industry now competes for compute, electricity, and data — and most of the people building it think AGI is coming between 2027 and 2032.

Every section should reinforce that arc.

---

*Updated June 10, 2026.*
