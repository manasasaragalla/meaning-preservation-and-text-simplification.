from transformers import T5ForConditionalGeneration, T5Tokenizer

MODEL_NAME = "agentlans/flan-t5-small-simplifier"

print(f"Loading specialized model {MODEL_NAME}... (size ~240MB)")
tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)
model.eval()
print("Model ready!")

def simplify_text(text: str) -> str:
    # This specialized model works best with a simple "simplify: " prefix
    input_text = "simplify: " + text.strip()
    
    inputs = tokenizer.encode(
        input_text,
        return_tensors="pt",
        max_length=512,
        truncation=True
    )
    
    outputs = model.generate(
        inputs,
        max_length=150,
        min_length=5,
        num_beams=4,
        no_repeat_ngram_size=3,
        early_stopping=True
    )
    
    simplified = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extra safety: if the model echoed the prefix, remove it
    if simplified.lower().startswith("simplify:"):
        simplified = simplified[9:].strip()
        
    return simplified