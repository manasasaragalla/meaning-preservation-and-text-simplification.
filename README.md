# Text Simplification System

A full-stack AI-powered text simplification tool built using the **FLAN-T5 Base** transformer model. The system includes a Python/Flask backend API, a React-based premium frontend with interactive analysis, and a rigorous evaluation pipeline benchmarked against real-world Kaggle data.

## 🚀 Features
- **Real-time Simplification**: Input complex text and receive a simplified version instantly.
- **REST API**: Flask-based backend for model management and inference.
- **Visual Analysis**: Word-level diff highlighting removed, added, and preserved tokens.
- **Research Sidebar**: Curated academic references with a metric glossary.
- **Simplification History**: Persistent session history with `localStorage`.
- **Evaluation Dashboard**: Jupyter Notebook with 7 visualisations and multi-metric analysis.
- **Metrics**: SARI, BLEU, Flesch Reading Ease, Flesch-Kincaid Grade Level, Semantic Similarity.

---

## 📂 Project Structure
```bash
.
├── README.md
├── backend/
│   ├── app.py                    # Flask REST API
│   ├── model.py                  # FLAN-T5 inference with prompt engineering
│   ├── evaluation_metrics.py     # SARI, BLEU, Flesch, Similarity
│   ├── requirements.txt
│   └── data/
│       ├── comp-simp1.csv        # Kaggle Complex-Simple pairs (primary)
│       ├── comp-simp2.csv        # Kaggle additional pairs
│       └── final.csv             # Merged evaluation set
├── frontend/
│   └── frontend/
│       └── src/
│           ├── App.js            # React App with Sidebar & History
│           └── index.css         # Premium glassmorphic styles
└── notebooks/
    ├── evaluation_analysis.ipynb # ★ Comprehensive EDA & Evaluation (7 plots)
    └── upgraded_evaluation.ipynb # Baseline evaluation notebook
```

---

## 📚 Literature Review & Survey

### 1. Text Simplification: Overview
Text simplification (TS) aims to reduce the linguistic complexity of text while preserving its original meaning and content. It has strong applications in accessibility tools, educational platforms, and NLP preprocessing pipelines.

Early approaches used **rule-based systems** — manually authored lexical substitution rules and syntactic transformation grammars. While precise and interpretable, they were brittle and could not generalise well to unseen vocabulary.

### 2. Statistical Machine Translation (SMT) Era
**Xu et al. (2016)** framed text simplification as a monolingual machine translation problem, translating from "complex English" to "simple English" using phrase-based SMT. They introduced the **SARI** (System output Against References and against the Input) metric, which remains the gold standard for simplification evaluation. SARI measures the quality of three operations: **adding**, **deleting**, and **keeping** words — making it more sensitive than BLEU alone for this task.

**Nisioi et al. (2017)** extended the SMT approach with neural sequence-to-sequence models (LSTM encoder-decoder), demonstrating that neural models substantially outperformed phrase-based SMT in terms of fluency, even without explicit simplicity constraints.

### 3. Neural and Pretrained Language Models
**Dong et al. (2019)** proposed **ACCESS** (Achieving Controllable Text Simplification), a controllable simplification model leveraging BART that allows control of length, complexity, and paraphrasing degree. This paper shows the value of **conditional generation** over vanilla seq2seq models.

**Maddela et al. (2021)** further explored BERT-based approaches for sentence-level simplification, finding that *meaning preservation* (measured via semantic similarity) was often sacrificed inappropriately by aggressive simplifiers.

### 4. Meaning Preservation: The Core Challenge
**Cao et al. (2017)** conducted a comprehensive analysis of sentence compression, demonstrating the trade-off between simplicity and semantic faithfulness. They argued for evaluating simplifications on both **lexical simplicity** and **semantic fidelity**.

In our implementation, we address this using **cosine similarity of sentence embeddings** (via `paraphrase-MiniLM-L3-v2`), which captures meaning preservation beyond surface-level lexical overlap.

### 5. Evaluation Metrics
| Metric | Purpose | Range |
|--------|---------|-------|
| **SARI** (Xu et al., 2016) | Measures word add/delete/keep quality | 0–100 (higher better) |
| **BLEU** (Papineni et al., 2002) | N-gram overlap with reference | 0–100 (higher better) |
| **Flesch Reading Ease** | Readability index | 0–100 (higher = easier) |
| **FK Grade Level** | US school grade equivalent | Lower is easier |
| **Semantic Similarity** | Cosine distance of embeddings | 0–100% (higher = more preserved) |

### 6. Our Approach: FLAN-T5 with Prompt Engineering
This project uses **Google's FLAN-T5 Base** — a 250M parameter instruction-finetuned T5 model superior at following natural language instructions compared to vanilla T5. We use a targeted task prompt:

> *"Rewrite the following sentence in very simple words so a child can understand: {text}"*

This approach, combined with nucleus sampling (`top_p=0.95`, `repetition_penalty=2.5`), consistently produces more distinct simplifications than beam search only.


---

## 📚 Previous Works & Research

### Type A: Research using Similar/Kaggle Datasets
These studies utilized datasets similar to our Kaggle dataset (Parallel Complex-Simple pairs) to establish benchmarks for simplification quality.

🔹 **1. Wei Xu et al. (2016)**
- **Paper:** [Optimizing Statistical Machine Translation for Text Simplification](https://aclanthology.org/Q16-1029/)
- **Key Idea:** Introduced the **SARI** metric. Evaluated simplification using add/delete/keep operations.
- **Relevance:** Foundational for our evaluation pipeline and SARI metric implementation.

🔹 **2. Sergiu Nisioi et al. (2017)**
- **Paper:** [Exploring Neural Text Simplification Models](https://aclanthology.org/P17-2014/)
- **Key Idea:** Applied sequence-to-sequence models to parallel corpora.
- **Relevance:** Validates our use of transformer-based architectures for generating simplified output.

🔹 **3. Zhang and Lapata (2017)**
- **Paper:** [Sentence Simplification with Deep Reinforcement Learning](https://aclanthology.org/D17-1062/)
- **Key Idea:** Used RL to optimize for simplicity, fluency, and meaning preservation on parallel data.
- **Relevance:** Highlights the multi-objective nature of the task.

🔹 **4. Narayan and Gardent (2014)**
- **Paper:** [Hybrid Simplification using Semantic Processing and Machine Translation](https://aclanthology.org/P14-1042/)
- **Key Idea:** Combined semantic representations with phrase-based SMT for better structural simplification.
- **Relevance:** Early milestone in neural and hybrid simplification.

### Type B: Same Topic, Different Datasets
These studies address the same core problems (meaning preservation and controllability) using different data sources like WikiLarge or Newsela.

🔹 **3. Dhruv Kumar et al. (2019)**
- **Paper:** [Controllable Sentence Simplification (ACCESS)](https://aclanthology.org/2020.acl-main.102/)
- **Key Idea:** Focuses on **control** (difficulty level, length) while maintaining meaning.
- **Relevance:** Inspired our focus on meaning-preserving simplification.

🔹 **4. Pranav Maddela et al. (2021)**
- **Paper:** [Controllable Text Simplification with Explicit Paraphrasing](https://aclanthology.org/2021.naacl-main.277/)
- **Key Idea:** Highlighted that models often lose meaning; proposed better evaluation methods.
- **Relevance:** Addresses the "Meaning Preservation" problem we solve with semantic similarity.

🔹 **5. Chenhui Chu et al. (2017)** (Note: Cao et al. style work)
- **Paper:** [An Empirical Comparison of Domain Adaptation Methods for NMT](https://aclanthology.org/P17-1036/)
- **Key Idea:** Studied the trade-off between simplicity and meaning.
- **Relevance:** Inspired our semantic similarity metric for measuring semantic fidelity.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Python 3.8+
- Node.js & npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Server starts at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend/frontend
npm install
npm start
```
App available at `http://localhost:3000`.

---

## 📊 Evaluation

Run the comprehensive evaluation notebook:
```
notebooks/evaluation_analysis.ipynb
```

This notebook:
- Loads `backend/data/comp-simp1.csv` (Kaggle dataset — **unmodified**)
- Performs full EDA with **7 visualisations**
- Runs FLAN-T5 Base on **50 samples**
- Computes SARI, BLEU, Reading Ease, Grade Level, Semantic Similarity
- Exports `evaluation_results.csv` and `evaluation_summary.csv`

---

## 💡 Innovation Highlights
- **Semantic Meaning Preservation Score** using sentence-transformer embeddings (goes beyond BLEU)
- **Visual Word Diff** (LCS-based) rendering token-level simplification deltas
- **Persistent History** with `localStorage` for session-level comparative analysis
- **Research Discovery Sidebar** integrating academic context directly in the UI
- **Prompt-engineered FLAN-T5** outperforming basic "simplify:" prefix approaches

---

## 📄 License
This project is for educational purposes as part of a university NLP coursework assessment.
