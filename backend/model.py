from transformers import T5ForConditionalGeneration, T5Tokenizer

MODEL_NAME = "google/flan-t5-base"

print(f"Loading upgraded model {MODEL_NAME}... (size ~900MB)")
tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)
model.eval()
print("High-performance model ready!")

def simplify_text(text: str) -> str:
    # Forceful prompt for FLAN-T5
    input_text = f"Rewrite the following sentence in very simple words so a child can understand: {text.strip()}"
    
    inputs = tokenizer.encode(
        input_text,
        return_tensors="pt",
        max_length=512,
        truncation=True
    )
    
    outputs = model.generate(
        inputs,
        max_length=150,
        min_length=10,
        do_sample=True, # Enable sampling for more variety
        top_k=50,
        top_p=0.95,
        repetition_penalty=2.5, # Very strong penalty to avoid complexes
        no_repeat_ngram_size=2,
        early_stopping=True
    )
    
    simplified = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return simplified