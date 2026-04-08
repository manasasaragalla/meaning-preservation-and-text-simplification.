"""
test_api.py — Flask API route tests for the Text Simplification System
Run with: pytest tests/test_api.py -v
"""
import sys
import os
import json
import pytest

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# ─────────────────────────────────
# GET /health
# ─────────────────────────────────
def test_health_returns_ok(client):
    """Health endpoint should return 200 with status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "ok"
    assert "model" in data


# ─────────────────────────────────
# GET /
# ─────────────────────────────────
def test_root_lists_endpoints(client):
    """Root should return status and available endpoints."""
    response = client.get("/")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "running"
    assert "/simplify" in data["endpoints"]
    assert "/batch" in data["endpoints"]


# ─────────────────────────────────
# GET /info
# ─────────────────────────────────
def test_info_returns_model_details(client):
    """Info endpoint should return model name and supported metrics."""
    response = client.get("/info")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "model" in data
    assert "metrics" in data
    assert "sari" in data["metrics"]
    assert "bleu" in data["metrics"]
    assert "meaning_preservation" in data["metrics"]


# ─────────────────────────────────
# POST /simplify — Success Cases
# ─────────────────────────────────
def test_simplify_returns_all_fields(client):
    """Simplify should return original, simplified, and all score fields."""
    payload = {"text": "The mitochondria is the powerhouse of the cell, producing adenosine triphosphate."}
    response = client.post(
        "/simplify",
        data=json.dumps(payload),
        content_type="application/json"
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "original" in data
    assert "simplified" in data
    assert "scores" in data
    scores = data["scores"]
    assert "sari" in scores
    assert "bleu" in scores
    assert "meaning_preservation" in scores
    assert "flesch_reading_ease" in scores
    assert "flesch_kincaid_grade" in scores
    assert "compression_pct" in scores


def test_simplify_output_is_nonempty(client):
    """Simplified text should not be blank."""
    payload = {"text": "The defendant was acquitted of all charges due to insufficient evidence."}
    response = client.post(
        "/simplify",
        data=json.dumps(payload),
        content_type="application/json"
    )
    data = json.loads(response.data)
    assert len(data["simplified"].strip()) > 0


# ─────────────────────────────────
# POST /simplify — Error Cases
# ─────────────────────────────────
def test_simplify_missing_text_field(client):
    """Missing 'text' field should return 400."""
    response = client.post(
        "/simplify",
        data=json.dumps({"input": "test"}),
        content_type="application/json"
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data


def test_simplify_too_short_text(client):
    """Text shorter than 5 chars should return 400."""
    response = client.post(
        "/simplify",
        data=json.dumps({"text": "hi"}),
        content_type="application/json"
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data


def test_simplify_empty_body(client):
    """Empty request body should return 400."""
    response = client.post(
        "/simplify",
        data="",
        content_type="application/json"
    )
    assert response.status_code == 400


# ─────────────────────────────────
# POST /batch — Success Cases
# ─────────────────────────────────
def test_batch_returns_multiple_results(client):
    """Batch endpoint should return a result for each valid text."""
    payload = {
        "texts": [
            "The implementation of the policy was complex and bureaucratic.",
            "Photosynthesis converts light energy into chemical energy in plants."
        ]
    }
    response = client.post(
        "/batch",
        data=json.dumps(payload),
        content_type="application/json"
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["total"] == 2
    assert data["success"] == 2
    assert len(data["results"]) == 2
    for result in data["results"]:
        assert "original" in result
        assert "simplified" in result
        assert "scores" in result


def test_batch_result_contains_index(client):
    """Each batch result should have an 'index' field."""
    payload = {"texts": ["The gravitational force is an attractive force between objects with mass."]}
    response = client.post(
        "/batch",
        data=json.dumps(payload),
        content_type="application/json"
    )
    data = json.loads(response.data)
    assert data["results"][0]["index"] == 0


# ─────────────────────────────────
# POST /batch — Error Cases
# ─────────────────────────────────
def test_batch_missing_texts_field(client):
    """Missing 'texts' field should return 400."""
    response = client.post(
        "/batch",
        data=json.dumps({"data": []}),
        content_type="application/json"
    )
    assert response.status_code == 400


def test_batch_exceeds_limit(client):
    """More than 20 items should return 400."""
    payload = {"texts": ["Hello world sentence here."] * 21}
    response = client.post(
        "/batch",
        data=json.dumps(payload),
        content_type="application/json"
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data


def test_batch_empty_list(client):
    """Empty texts list should return 400."""
    response = client.post(
        "/batch",
        data=json.dumps({"texts": []}),
        content_type="application/json"
    )
    assert response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
