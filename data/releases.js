// ===== Model Release Timeline =====
// Every major frontier model release, 2018 → today, color-coded by lab.
// This is deliberately a SUPERSET of the timeline: minor-but-real releases
// (Grok 2, Qwen 3, GPT-5.1…) belong here even when they aren't milestone-worthy.
//
// Each release:
//   {
//     sortKey: 'YYYY-MM-DD',   // REQUIRED — drives order + year grouping
//     month:   'Mar',          // short display month (or '' for year-only)
//     lab:     'openai',       // id from RELEASE_LABS below
//     model:   'GPT-4',        // the name that goes on the pill
//     note:    '…'             // optional — shown as a hover tooltip
//   }

const RELEASE_LABS = [
  { id: 'openai',    label: 'OpenAI',         color: 'openai' },
  { id: 'anthropic', label: 'Anthropic',      color: 'anthropic' },
  { id: 'google',    label: 'Google',         color: 'google' },
  { id: 'meta',      label: 'Meta',           color: 'meta' },
  { id: 'xai',       label: 'xAI',            color: 'xai' },
  { id: 'mistral',   label: 'Mistral',        color: 'research' },
  { id: 'deepseek',  label: 'DeepSeek',       color: 'deepseek' },
  { id: 'china',     label: 'China (other)',  color: 'deepseek' },
];

const RELEASES = [
  // --- 2018 ---
  { sortKey: '2018-06-11', month: 'Jun', lab: 'openai',    model: 'GPT-1',            note: '117M params — the proof of concept' },
  { sortKey: '2018-10-11', month: 'Oct', lab: 'google',    model: 'BERT',             note: 'Powered Google Search for billions of queries' },
  // --- 2019 ---
  { sortKey: '2019-02-14', month: 'Feb', lab: 'openai',    model: 'GPT-2',            note: '1.5B params — staged release over misuse fears' },
  // --- 2020 ---
  { sortKey: '2020-05-28', month: 'May', lab: 'openai',    model: 'GPT-3',            note: '175B params — prompting becomes programming' },
  // --- 2021 ---
  { sortKey: '2021-08-10', month: 'Aug', lab: 'openai',    model: 'Codex',            note: 'GPT-3 fine-tuned on code — powered GitHub Copilot' },
  // --- 2022 ---
  { sortKey: '2022-04-04', month: 'Apr', lab: 'google',    model: 'PaLM',             note: '540B params — Google\'s pre-ChatGPT giant' },
  { sortKey: '2022-11-30', month: 'Nov', lab: 'openai',    model: 'ChatGPT (GPT-3.5)', note: '100M users in 2 months — the earthquake' },
  // --- 2023 ---
  { sortKey: '2023-02-24', month: 'Feb', lab: 'meta',      model: 'LLaMA',            note: 'Research-only release; weights leaked within days' },
  { sortKey: '2023-03-14', month: 'Mar', lab: 'openai',    model: 'GPT-4',            note: 'The ceiling everyone chased for 18 months' },
  { sortKey: '2023-03-14', month: 'Mar', lab: 'anthropic', model: 'Claude 1',         note: 'Constitutional AI goes to market' },
  { sortKey: '2023-03-21', month: 'Mar', lab: 'google',    model: 'Bard',             note: 'Google\'s rushed ChatGPT answer' },
  { sortKey: '2023-05-10', month: 'May', lab: 'google',    model: 'PaLM 2',           note: 'Powered Bard through 2023' },
  { sortKey: '2023-07-11', month: 'Jul', lab: 'anthropic', model: 'Claude 2',         note: 'First public Claude — 100K context' },
  { sortKey: '2023-07-18', month: 'Jul', lab: 'meta',      model: 'Llama 2',          note: 'Open weights on purpose, commercial use allowed' },
  { sortKey: '2023-09-27', month: 'Sep', lab: 'mistral',   model: 'Mistral 7B',       note: 'Apache 2.0 — Europe enters the race' },
  { sortKey: '2023-10-17', month: 'Oct', lab: 'china',     model: 'ERNIE 4.0',        note: 'Baidu claims GPT-4 parity on Chinese tasks' },
  { sortKey: '2023-11-04', month: 'Nov', lab: 'xai',       model: 'Grok-1',           note: 'xAI\'s first model, 4 months after founding' },
  { sortKey: '2023-11-06', month: 'Nov', lab: 'openai',    model: 'GPT-4 Turbo',      note: '128K context, cheaper API' },
  { sortKey: '2023-11-21', month: 'Nov', lab: 'anthropic', model: 'Claude 2.1',       note: '200K context — the long-context ceiling' },
  { sortKey: '2023-12-06', month: 'Dec', lab: 'google',    model: 'Gemini 1.0',       note: 'Ultra / Pro / Nano — natively multimodal' },
  { sortKey: '2023-12-11', month: 'Dec', lab: 'mistral',   model: 'Mixtral 8x7B',     note: 'Open MoE matching GPT-3.5' },
  // --- 2024 ---
  { sortKey: '2024-02-15', month: 'Feb', lab: 'google',    model: 'Gemini 1.5',       note: '1M-token context — leapfrogged everyone' },
  { sortKey: '2024-03-04', month: 'Mar', lab: 'anthropic', model: 'Claude 3',         note: 'Haiku / Sonnet / Opus — the naming template' },
  { sortKey: '2024-04-18', month: 'Apr', lab: 'meta',      model: 'Llama 3',          note: '8B / 70B, then 405B in July' },
  { sortKey: '2024-05-13', month: 'May', lab: 'openai',    model: 'GPT-4o',           note: 'Real-time voice — truly multimodal' },
  { sortKey: '2024-06-20', month: 'Jun', lab: 'anthropic', model: 'Claude 3.5 Sonnet', note: 'Mid-tier model that beat the old flagship' },
  { sortKey: '2024-07-23', month: 'Jul', lab: 'meta',      model: 'Llama 3.1 405B',   note: 'First open model rivaling GPT-4' },
  { sortKey: '2024-08-13', month: 'Aug', lab: 'xai',       model: 'Grok-2',           note: 'Frontier-adjacent in year one' },
  { sortKey: '2024-09-12', month: 'Sep', lab: 'openai',    model: 'o1',               note: 'First reasoning model — test-time compute era' },
  { sortKey: '2024-09-19', month: 'Sep', lab: 'china',     model: 'Qwen 2.5',         note: 'Alibaba — most-downloaded open family on Earth' },
  { sortKey: '2024-10-22', month: 'Oct', lab: 'anthropic', model: 'Claude 3.5 Haiku + Computer Use', note: 'First frontier model to control a computer' },
  { sortKey: '2024-12-11', month: 'Dec', lab: 'google',    model: 'Gemini 2.0',       note: 'Built for the agentic era' },
  { sortKey: '2024-12-20', month: 'Dec', lab: 'openai',    model: 'o3 (announced)',   note: '96.7% on AIME — reasoning scaling holds' },
  { sortKey: '2024-12-26', month: 'Dec', lab: 'deepseek',  model: 'DeepSeek V3',      note: 'GPT-4-class for a reported ~$5.6M' },
  // --- 2025 ---
  { sortKey: '2025-01-20', month: 'Jan', lab: 'deepseek',  model: 'DeepSeek R1',      note: 'Open reasoning model — crashed NVIDIA for a day' },
  { sortKey: '2025-02-17', month: 'Feb', lab: 'xai',       model: 'Grok 3',           note: 'Trained on the 200K-GPU Colossus cluster' },
  { sortKey: '2025-02-24', month: 'Feb', lab: 'anthropic', model: 'Claude 3.7 Sonnet', note: 'Extended thinking + Claude Code' },
  { sortKey: '2025-02-27', month: 'Feb', lab: 'openai',    model: 'GPT-4.5',          note: 'Orion — the last pure scaling play' },
  { sortKey: '2025-03-25', month: 'Mar', lab: 'google',    model: 'Gemini 2.5',       note: 'Thinking built in — topped LMArena at launch' },
  { sortKey: '2025-04-05', month: 'Apr', lab: 'meta',      model: 'Llama 4',          note: 'Mixture-of-experts goes mainstream at Meta' },
  { sortKey: '2025-04-16', month: 'Apr', lab: 'openai',    model: 'o3 + o4-mini',     note: 'Full release — agentic tool use while reasoning' },
  { sortKey: '2025-04-28', month: 'Apr', lab: 'china',     model: 'Qwen 3',           note: 'Alibaba\'s hybrid-reasoning open family' },
  { sortKey: '2025-05-22', month: 'May', lab: 'anthropic', model: 'Claude 4',         note: 'Sonnet 4 + Opus 4 — long-horizon agentic coding' },
  { sortKey: '2025-07-09', month: 'Jul', lab: 'xai',       model: 'Grok 4',           note: 'Topped several reasoning benchmarks' },
  { sortKey: '2025-07-11', month: 'Jul', lab: 'china',     model: 'Kimi K2',          note: 'Moonshot — 1T-param open-weight agent model' },
  { sortKey: '2025-08-05', month: 'Aug', lab: 'openai',    model: 'gpt-oss',          note: 'OpenAI\'s first open weights since GPT-2' },
  { sortKey: '2025-08-05', month: 'Aug', lab: 'anthropic', model: 'Claude Opus 4.1',  note: 'Agentic + coding bump ahead of 4.5' },
  { sortKey: '2025-08-07', month: 'Aug', lab: 'openai',    model: 'GPT-5',            note: 'Unified reasoning + chat with auto-routing' },
  { sortKey: '2025-09-29', month: 'Sep', lab: 'anthropic', model: 'Claude Sonnet 4.5', note: 'The agentic workhorse' },
  { sortKey: '2025-10-15', month: 'Oct', lab: 'anthropic', model: 'Claude Haiku 4.5', note: 'Near-Sonnet capability at a third of the cost' },
  { sortKey: '2025-11-12', month: 'Nov', lab: 'openai',    model: 'GPT-5.1',          note: 'Instant / Thinking + adaptive reasoning' },
  { sortKey: '2025-11-18', month: 'Nov', lab: 'google',    model: 'Gemini 3',         note: 'Took the benchmark lead — triggered OpenAI\'s "code red"' },
  { sortKey: '2025-11-24', month: 'Nov', lab: 'anthropic', model: 'Claude Opus 4.5',  note: 'First to break 80% on SWE-bench' },
  { sortKey: '2025-12-11', month: 'Dec', lab: 'openai',    model: 'GPT-5.2',          note: 'The "code red" counter-punch to Gemini 3' },
  // --- 2026 ---
  { sortKey: '2026-02-05', month: 'Feb', lab: 'openai',    model: 'GPT-5.3-Codex',    note: 'First "high" cyber-risk launch under Preparedness' },
  { sortKey: '2026-02-05', month: 'Feb', lab: 'anthropic', model: 'Claude Opus 4.6',  note: 'Agent teams' },
  { sortKey: '2026-02-17', month: 'Feb', lab: 'anthropic', model: 'Claude Sonnet 4.6', note: 'Document-creation integrations' },
  { sortKey: '2026-04-15', month: 'Apr', lab: 'anthropic', model: 'Claude Opus 4.7',  note: 'Continued reasoning improvements' },
  { sortKey: '2026-04-23', month: 'Apr', lab: 'openai',    model: 'GPT-5.5',          note: '1M-token context — "smartest and most intuitive"' },
  { sortKey: '2026-06-09', month: 'Jun', lab: 'anthropic', model: 'Claude Fable 5',   note: 'The first new Claude family name since Opus / Sonnet / Haiku' },
];
