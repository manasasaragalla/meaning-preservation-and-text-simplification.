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
