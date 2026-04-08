from flask import Flask, request, jsonify
from flask_cors import CORS
from model import simplify_text, MODEL_NAME
from evaluation_metrics import compute_scores
import time

app = Flask(__name__)
CORS(app)  # allows React frontend to call this API

# -------------------------------------------------
# GET /  -- API Root
# -------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "model": MODEL_NAME,
        "endpoints": ["/simplify", "/batch", "/health", "/info"]
    })

# -------------------------------------------------
# GET /info  -- Model & System Info
# -------------------------------------------------
@app.route("/info", methods=["GET"])
def info():
    return jsonify({
        "model": MODEL_NAME,
        "metrics": ["sari", "bleu", "flesch_reading_ease", "flesch_kincaid_grade", "meaning_preservation", "compression_pct"],
        "version": "2.0",
        "description": "Text simplification using FLAN-T5 Base with natural language prompt engineering."
    })

# -------------------------------------------------
# POST /simplify  -- Single Text
# -------------------------------------------------
@app.route("/simplify", methods=["POST"])
def simplify():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Request body must include a 'text' field."}), 400

    original = data["text"].strip()
    if len(original) < 5:
        return jsonify({"error": "Text too short. Provide at least 5 characters."}), 400

    start_t = time.time()
    simplified = simplify_text(original)
    inference_time_ms = int((time.time() - start_t) * 1000)
    
    reference  = data.get("reference", None)
    scores     = compute_scores(original, simplified, reference)

    return jsonify({
        "original":   original,
        "simplified": simplified,
        "scores":     scores,
        "inference_time_ms": inference_time_ms
    })

# -------------------------------------------------
# POST /batch  -- Multiple Texts at Once (max 20)
# -------------------------------------------------
@app.route("/batch", methods=["POST"])
def batch_simplify():
    """
    Accepts: { "texts": ["sentence 1", "sentence 2", ...] }
    Returns: list of simplification results with per-item scores.
    Limit: 20 texts per request.
    """
    data = request.get_json()

    if not data or "texts" not in data:
        return jsonify({"error": "Request body must include a 'texts' list."}), 400

    texts = data["texts"]

    if not isinstance(texts, list) or len(texts) == 0:
        return jsonify({"error": "'texts' must be a non-empty list of strings."}), 400

    if len(texts) > 20:
        return jsonify({"error": "Batch limit is 20 texts per request."}), 400

    results = []
    errors  = []

    for i, text in enumerate(texts):
        if not isinstance(text, str) or len(text.strip()) < 5:
            errors.append({"index": i, "error": "Text too short or invalid."})
            continue
        try:
            original   = text.strip()
            simplified = simplify_text(original)
            scores     = compute_scores(original, simplified)
            results.append({
                "index":      i,
                "original":   original,
                "simplified": simplified,
                "scores":     scores
            })
        except Exception as e:
            errors.append({"index": i, "error": str(e)})

    return jsonify({
        "total":   len(texts),
        "success": len(results),
        "errors":  errors,
        "results": results
    })

# -------------------------------------------------
# GET /health  -- Health Check
# -------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_NAME})

if __name__ == "__main__":
    app.run(debug=True, port=5000)