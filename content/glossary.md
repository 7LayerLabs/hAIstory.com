# Glossary

Plain-English definitions for the jargon in this timeline.

**AGI (Artificial General Intelligence)** — AI that can do any intellectual task a human can. There's no agreed-upon definition. Current frontier labs use it loosely to mean "AI good enough to do most knowledge work."

**Agent** — An AI that takes actions on its own (browsing, writing code, controlling a computer) rather than just answering questions. The big shift from 2024–2026.

**Alignment** — The research field of making AI do what humans actually want, not just what they technically asked for. The discipline Anthropic was founded to advance.

**Backpropagation** — The math that lets a neural network learn from its mistakes. The 1986 algorithm that quietly underlies every modern AI model.

**Benchmark** — A standardized test for AI models. Common ones: SWE-bench (coding), AIME (math), MMLU (general knowledge), GPQA (graduate-level science).

**Constitutional AI** — Anthropic's training method. Instead of asking humans to label every harmful response, you give the model a written "constitution" of principles and let it self-correct.

**Context window** — How much text a model can read in a single turn. Started at 2K tokens in 2018; now over a million.

**Embedding** — A numerical representation of a word or sentence. The trick that lets computers do math on language. Word2Vec (2013) was the breakthrough.

**Foundation model** — A general-purpose model trained on massive data that can be specialized for many tasks. GPT-4, Claude, Gemini are foundation models.

**GPU** — The chips that train and run neural networks. NVIDIA dominates this market.

**Hallucination** — When an AI confidently makes things up. The biggest reliability problem with current LLMs.

**Inference** — Running a model to answer queries (vs. training it). The cost of inference at scale is now the dominant operating expense for AI products.

**LLM (Large Language Model)** — A model trained on huge amounts of text to predict the next word. ChatGPT, Claude, Gemini are LLMs.

**MCP (Model Context Protocol)** — Anthropic's open standard for connecting AI models to tools and data sources. Adopted across the industry in 2024–25.

**Mixture of Experts (MoE)** — A model architecture where only a small subset of the network activates per query. Lets you scale "model size" without paying for it linearly. Used by Switch Transformer, Mistral, DeepSeek, LLaMA 4.

**Multimodal** — A model that handles multiple input types (text, images, audio, video) natively. GPT-4o was the first frontier model to do this in real time.

**Parameter** — One of the tunable numbers inside a neural network. Modern frontier models have hundreds of billions to trillions of them.

**Pre-training** — The first, expensive phase of training where a model learns general language patterns from huge data. Costs millions of dollars per run for frontier models.

**Prompt** — The text you give to an AI model. "Prompt engineering" became a real discipline after GPT-3.

**RAG (Retrieval-Augmented Generation)** — Pair an LLM with a search system so it can look up facts at query time. Made "ChatGPT for your docs" possible.

**Reasoning model** — A model trained to "think" step-by-step before answering, trading more compute-at-runtime for accuracy. OpenAI's o1/o3 and Claude's "extended thinking" are reasoning models.

**RLHF (Reinforcement Learning from Human Feedback)** — Training method that uses human judgments to shape model behavior. The technique that made ChatGPT actually pleasant to use.

**Scaling laws** — Empirical observation that bigger models trained on more data with more compute reliably get better. The basis of the modern AI investment thesis.

**SOTA** — State of the art. The current best result on a benchmark.

**Token** — A chunk of text (roughly a word or part of one) that a model processes. "1 million tokens" ≈ 750,000 words.

**Training run** — A single end-to-end training of a frontier model. Currently costs $50M–$1B+ in compute.

**Transformer** — The neural network architecture invented at Google in 2017. Every major chatbot is a transformer.

**Vector database** — A database optimized for semantic similarity search using embeddings. Pinecone, Weaviate, Chroma, pgvector. The infrastructure layer of the RAG era.
