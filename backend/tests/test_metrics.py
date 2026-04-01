import sys
import os
import pytest

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from evaluation_metrics import compute_scores

def test_exact_match_similarity():
    """Testing that exact same text gives 100% similarity."""
    text = "The quick brown fox jumps over the lazy dog."
    scores = compute_scores(text, text)
    
    assert scores["meaning_preservation"] == 100.0
    assert scores["bleu"] > 0
    assert scores["compression_pct"] == 0.0

def test_minor_paraphrase():
    """Testing that a minor paraphrase keeps high similarity."""
    original = "The scientist conducted a study on molecular biology."
    simplified = "The researcher did a study on biology."
    scores = compute_scores(original, simplified)
    
    # Meaning should still be high (>85%)
    assert scores["meaning_preservation"] > 85.0
    # Simplified should be shorter
    assert scores["simplified_words"] < scores["original_words"]
    # Compression should be positive
    assert scores["compression_pct"] > 0

def test_major_meaning_change():
    """Testing that a random unrelated sentence has low similarity."""
    original = "The financial markets displayed significant volatility."
    simplified = "I like eating apples in the morning."
    scores = compute_scores(original, simplified)
    
    # Meaning should drop significantly (<50%)
    assert scores["meaning_preservation"] < 50.0

def test_sari_with_reference():
    """Testing SARI calculation when a reference is provided."""
    original = "He was the first person to traverse the globe."
    simplified = "He was the first to travel around the world."
    reference = "He was the first person to travel around the world."
    
    scores = compute_scores(original, simplified, reference)
    
    # SARI should be a valid number
    assert "sari" in scores
    assert isinstance(scores["sari"], float)
    assert scores["sari"] > 0

def test_grade_level_reduction():
    """Testing that grade level decreases for simpler text."""
    complex_text = "The utilization of sophisticated cryptographic protocols ensures the confidentiality of the transmission."
    simple_text = "Using encryption keeps the message private."
    
    complex_scores = compute_scores(complex_text, complex_text)
    simple_scores = compute_scores(complex_text, simple_text)
    
    # Grade level should be lower for simple text
    assert simple_scores["flesch_kincaid_grade"] < complex_scores["flesch_kincaid_grade"]

if __name__ == "__main__":
    pytest.main([__file__])
