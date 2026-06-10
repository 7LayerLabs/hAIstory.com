// ===== Primary sources — the actual papers, essays, and announcements =====
const PRIMARY_SOURCES = [
  {
    category: 'Foundational papers',
    items: [
      { title: 'Computing Machinery and Intelligence', author: 'Alan Turing', year: '1950', url: 'https://academic.oup.com/mind/article/LIX/236/433/986238', note: 'The Turing Test paper.' },
      { title: 'Learning Representations by Back-propagating Errors', author: 'Rumelhart, Hinton, Williams', year: '1986', url: 'https://www.nature.com/articles/323533a0', note: 'Backpropagation in Nature.' },
      { title: 'A Fast Learning Algorithm for Deep Belief Nets', author: 'Hinton, Osindero, Teh', year: '2006', url: 'https://www.cs.toronto.edu/~hinton/absps/fastnc.pdf', note: 'The "deep learning" revival.' },
      { title: 'ImageNet Classification with Deep Convolutional Neural Networks', author: 'Krizhevsky, Sutskever, Hinton', year: '2012', url: 'https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html', note: 'AlexNet.' },
      { title: 'Generative Adversarial Networks', author: 'Goodfellow et al.', year: '2014', url: 'https://arxiv.org/abs/1406.2661', note: 'GANs.' },
      { title: 'Mastering the game of Go with deep neural networks and tree search', author: 'Silver et al. (DeepMind)', year: '2016', url: 'https://www.nature.com/articles/nature16961', note: 'AlphaGo.' },
      { title: 'Attention Is All You Need', author: 'Vaswani et al. (Google)', year: '2017', url: 'https://arxiv.org/abs/1706.03762', note: 'The Transformer paper. Most important paper in modern AI.' },
    ]
  },
  {
    category: 'Modern model papers',
    items: [
      { title: 'Improving Language Understanding by Generative Pre-Training', author: 'OpenAI', year: '2018', url: 'https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf', note: 'GPT-1.' },
      { title: 'Language Models are Few-Shot Learners', author: 'OpenAI', year: '2020', url: 'https://arxiv.org/abs/2005.14165', note: 'GPT-3 paper.' },
      { title: 'Highly accurate protein structure prediction with AlphaFold', author: 'Jumper et al. (DeepMind)', year: '2021', url: 'https://www.nature.com/articles/s41586-021-03819-2', note: 'AlphaFold 2 in Nature.' },
      { title: 'Switch Transformer: Scaling to Trillion Parameter Models', author: 'Fedus et al. (Google)', year: '2022', url: 'https://arxiv.org/abs/2101.03961', note: 'Mixture-of-experts at scale.' },
      { title: 'Training language models to follow instructions with human feedback', author: 'OpenAI', year: '2022', url: 'https://arxiv.org/abs/2203.02155', note: 'InstructGPT / RLHF — what made ChatGPT possible.' },
      { title: 'Constitutional AI: Harmlessness from AI Feedback', author: 'Anthropic', year: '2022', url: 'https://arxiv.org/abs/2212.08073', note: 'The Anthropic alignment method.' },
      { title: 'GPT-4 Technical Report', author: 'OpenAI', year: '2023', url: 'https://arxiv.org/abs/2303.08774', note: 'Capabilities; details intentionally withheld.' },
      { title: 'Scaling Monosemanticity', author: 'Anthropic', year: '2024', url: 'https://transformer-circuits.pub/2024/scaling-monosemanticity/', note: 'Mechanistic interpretability of Claude 3 Sonnet.' },
      { title: 'DeepSeek-V3 Technical Report', author: 'DeepSeek-AI', year: '2024', url: 'https://arxiv.org/abs/2412.19437', note: '671B MoE model; the ~$5.576M training-cost claim is here.' },
      { title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning', author: 'DeepSeek-AI', year: '2025', url: 'https://arxiv.org/abs/2501.12948', note: 'Open reasoning model rivaling o1; trained with pure RL.' },
    ]
  },
  {
    category: 'Recent models & releases',
    items: [
      { title: 'Introducing Meta Llama 3', author: 'Meta', year: '2024', url: 'https://ai.meta.com/blog/meta-llama-3/', note: 'The 8B/70B open-weight release.' },
      { title: 'Introducing Gemini 1.5', author: 'Google', year: '2024', url: 'https://blog.google/innovation-and-ai/products/google-gemini-next-generation-model-february-2024/', note: 'MoE model with the 1M-token context window.' },
      { title: 'Introducing Gemini 2.0', author: 'Google DeepMind', year: '2024', url: 'https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/', note: 'The "agentic era" model.' },
      { title: 'Introducing Claude 4', author: 'Anthropic', year: '2025', url: 'https://www.anthropic.com/news/claude-4', note: 'Claude Opus 4 and Sonnet 4.' },
      { title: 'Gemini 2.5: our newest model with thinking', author: 'Google DeepMind', year: '2025', url: 'https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/', note: 'The reasoning ("thinking") Gemini.' },
      { title: 'The Llama 4 herd', author: 'Meta', year: '2025', url: 'https://ai.meta.com/blog/llama-4-multimodal-intelligence/', note: 'First natively multimodal, MoE Llama (Scout, Maverick).' },
      { title: 'Introducing GPT-5', author: 'OpenAI', year: '2025', url: 'https://openai.com/index/introducing-gpt-5/', note: 'OpenAI\'s next flagship.' },
      { title: 'Introducing Claude Sonnet 4.5', author: 'Anthropic', year: '2025', url: 'https://www.anthropic.com/news/claude-sonnet-4-5', note: 'Coding-and-agents upgrade.' },
      { title: 'Introducing Claude Opus 4.5', author: 'Anthropic', year: '2025', url: 'https://www.anthropic.com/news/claude-opus-4-5', note: 'The top-tier Opus refresh.' },
      { title: 'Introducing Claude Sonnet 4.6', author: 'Anthropic', year: '2026', url: 'https://www.anthropic.com/news/claude-sonnet-4-6', note: 'Most capable Sonnet, 1M-token context in beta.' },
    ]
  },
  {
    category: 'Money, compute & litigation',
    items: [
      { title: 'New funding to scale the benefits of AI', author: 'OpenAI', year: '2024', url: 'https://openai.com/index/scale-the-benefits-of-ai/', note: 'The $6.6B round at a $157B valuation (Oct 2024).' },
      { title: 'New funding to build towards AGI', author: 'OpenAI', year: '2025', url: 'https://openai.com/index/march-funding-updates/', note: 'The $40B SoftBank-led round at a $300B valuation (Mar 2025).' },
      { title: 'Nvidia briefly touched $4 trillion market cap for first time', author: 'CNBC', year: '2025', url: 'https://www.cnbc.com/2025/07/09/nvidia-4-trillion.html', note: 'First company to hit $4T, on the AI boom.' },
      { title: 'Nvidia becomes first company to reach $5 trillion valuation', author: 'CNBC', year: '2025', url: 'https://www.cnbc.com/2025/10/29/nvidia-on-track-to-hit-historic-5-trillion-valuation-amid-ai-rally.html', note: 'The $5T milestone.' },
      { title: 'Musk v. Altman (OpenAI litigation)', author: 'Wikipedia (case overview)', year: '2024+', url: 'https://en.wikipedia.org/wiki/Musk_v._Altman', note: 'Musk\'s suit over OpenAI\'s shift from nonprofit roots.' },
    ]
  },
  {
    category: 'Essays + statements from the builders',
    items: [
      { title: 'Machines of Loving Grace', author: 'Dario Amodei (Anthropic)', year: '2024', url: 'https://www.darioamodei.com/essay/machines-of-loving-grace', note: 'Anthropic CEO\'s vision for what AI does in the next decade.' },
      { title: 'The Intelligence Age', author: 'Sam Altman (OpenAI)', year: '2024', url: 'https://ia.samaltman.com/', note: 'Altman\'s case for the next phase.' },
      { title: 'Planning for AGI and beyond', author: 'Sam Altman (OpenAI)', year: '2023', url: 'https://openai.com/blog/planning-for-agi-and-beyond', note: 'OpenAI\'s public AGI roadmap.' },
      { title: 'Core Views on AI Safety', author: 'Anthropic', year: '2023', url: 'https://www.anthropic.com/news/core-views-on-ai-safety', note: 'Why Anthropic exists.' },
      { title: 'Responsible Scaling Policy', author: 'Anthropic', year: '2023+', url: 'https://www.anthropic.com/responsible-scaling-policy', note: 'The capability-tier safety framework.' },
    ]
  },
  {
    category: 'Industry announcements',
    items: [
      { title: 'OpenAI Charter', author: 'OpenAI', year: '2018', url: 'https://openai.com/charter/', note: 'Original mission statement.' },
      { title: 'Microsoft + OpenAI partnership', author: 'Microsoft', year: '2019', url: 'https://blogs.microsoft.com/blog/2019/07/22/openai-forms-exclusive-computing-partnership-with-microsoft-to-build-new-azure-ai-supercomputing-technologies/', note: 'The $1B deal.' },
      { title: 'Stargate Project announcement', author: 'OpenAI', year: '2025', url: 'https://openai.com/index/announcing-the-stargate-project/', note: '$500B AI infrastructure pledge.' },
      { title: 'Model Context Protocol', author: 'Anthropic', year: '2024', url: 'https://www.anthropic.com/news/model-context-protocol', note: 'The MCP standard.' },
      { title: 'NVIDIA GTC keynotes', author: 'Jensen Huang / NVIDIA', year: 'annual', url: 'https://www.nvidia.com/gtc/keynote/', note: 'Where the chip roadmap is announced.' },
    ]
  },
];
