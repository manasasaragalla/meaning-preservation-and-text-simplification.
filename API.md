# API Reference — Text Simplification System

Base URL: `http://localhost:5000`

> All POST requests must include `Content-Type: application/json` header.

---

## Endpoints

### `GET /`
Returns the API status and a list of all available endpoints.

**Response:**
```json
{
  "status": "running",
  "model": "google/flan-t5-base",
  "endpoints": ["/simplify", "/batch", "/health", "/info"]
}
```

---

### `GET /health`
Health check endpoint. Use this to verify the server and model are loaded.

**Response:**
```json
{
  "status": "ok",
  "model": "google/flan-t5-base"
}
```

---

### `GET /info`
Returns metadata about the loaded model and supported evaluation metrics.

**Response:**
```json
{
  "model": "google/flan-t5-base",
  "version": "2.0",
  "description": "Text simplification using FLAN-T5 Base with natural language prompt engineering.",
  "metrics": ["sari", "bleu", "flesch_reading_ease", "flesch_kincaid_grade", "meaning_preservation", "compression_pct"]
}
```

---

### `POST /simplify`
Simplifies a single piece of text and returns the result with evaluation scores.

**Request Body:**
```json
{
  "text": "The mitochondria is the powerhouse of the cell, responsible for generating adenosine triphosphate.",
  "reference": "Optional human-written reference simplification for SARI/BLEU scoring."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | ✅ Yes | The complex text to simplify (min 5 chars) |
| `reference` | string | ❌ No | Reference simplification for improved SARI/BLEU scores |

**Success Response (200):**
```json
{
  "original": "The mitochondria is the powerhouse of the cell...",
  "simplified": "The mitochondria makes energy for the cell.",
  "scores": {
    "sari": 34.5,
    "bleu": 12.3,
    "flesch_reading_ease": 72.1,
    "flesch_kincaid_grade": 6.2,
    "meaning_preservation": 87.4,
    "compression_pct": 31.0,
    "original_words": 16,
    "simplified_words": 11
  }
}
```

**Error Responses:**

| Code | Reason |
|------|--------|
| `400` | Missing `text` field |
| `400` | Text is fewer than 5 characters |

**PowerShell Example:**
```powershell
Invoke-WebRequest -Uri http://localhost:5000/simplify `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"text": "The defendant was acquitted due to insufficient corroborating evidence."}'
```

**curl Example:**
```bash
curl -X POST http://localhost:5000/simplify \
  -H "Content-Type: application/json" \
  -d '{"text": "The defendant was acquitted due to insufficient corroborating evidence."}'
```

---

### `POST /batch`
Simplifies **multiple texts** in a single request. Returns a list of results with scores for each input.

> ⚠️ Maximum **20 texts** per request.

**Request Body:**
```json
{
  "texts": [
    "The implementation of the policy was characterized by bureaucratic complexity.",
    "Photosynthesis is the biochemical process by which plants convert light energy into chemical energy.",
    "The gravitational pull of a black hole prevents electromagnetic radiation from escaping."
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `texts` | array of strings | ✅ Yes | List of texts to simplify (max 20) |

**Success Response (200):**
```json
{
  "total": 3,
  "success": 3,
  "errors": [],
  "results": [
    {
      "index": 0,
      "original": "The implementation...",
      "simplified": "The new policy was hard to put in place.",
      "scores": { "sari": 31.2, "bleu": 9.4, "meaning_preservation": 84.1, ... }
    },
    {
      "index": 1,
      "original": "Photosynthesis is...",
      "simplified": "Plants use sunlight to make food.",
      "scores": { ... }
    },
    {
      "index": 2,
      "original": "The gravitational pull...",
      "simplified": "Nothing can escape a black hole, not even light.",
      "scores": { ... }
    }
  ]
}
```

**Error Responses:**

| Code | Reason |
|------|--------|
| `400` | Missing `texts` field |
| `400` | `texts` is empty or not a list |
| `400` | More than 20 texts provided |

**curl Example:**
```bash
curl -X POST http://localhost:5000/batch \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Prolonged exposure to ultraviolet radiation causes DNA damage.", "The defendant was acquitted of all charges."]}'
```

---

## Evaluation Metrics Reference

| Metric | Description | Good Value |
|--------|-------------|------------|
| `sari` | SARI score — measures word add/keep/delete quality | > 30 |
| `bleu` | BLEU — n-gram overlap with reference | Higher is better |
| `flesch_reading_ease` | Readability (0–100) | > 60 (easy) |
| `flesch_kincaid_grade` | US grade level | < 8 (readable) |
| `meaning_preservation` | Cosine similarity (%) of embeddings | > 80% |
| `compression_pct` | % reduction in word count | 20–50% typical |
| `original_words` | Word count of input | — |
| `simplified_words` | Word count of output | — |

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

Expected output:
```
tests/test_metrics.py::test_exact_match_similarity      PASSED
tests/test_metrics.py::test_minor_paraphrase            PASSED
tests/test_metrics.py::test_major_meaning_change        PASSED
tests/test_metrics.py::test_sari_with_reference         PASSED
tests/test_metrics.py::test_grade_level_reduction       PASSED
tests/test_api.py::test_health_returns_ok               PASSED
tests/test_api.py::test_root_lists_endpoints            PASSED
tests/test_api.py::test_info_returns_model_details      PASSED
tests/test_api.py::test_simplify_returns_all_fields     PASSED
...
```
