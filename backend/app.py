from flask import Flask, request, jsonify
from flask_cors import CORS
from model import simplify_text
from evaluation_metrics import compute_scores

app = Flask(__name__)
CORS(app)  # allows React frontend to call this API

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "running", "model": "T5-small"})

@app.route("/simplify", methods=["POST"])
def simplify():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    original = data["text"].strip()
    if len(original) < 5:
        return jsonify({"error": "Text too short"}), 400

    # Run model
    simplified = simplify_text(original)

    # Evaluate
    reference = data.get("reference", None)
    scores = compute_scores(original, simplified, reference)

    return jsonify({
        "original": original,
        "simplified": simplified,
        "scores": scores
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)