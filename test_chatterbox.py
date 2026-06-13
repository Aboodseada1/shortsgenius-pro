import torchaudio as ta
import torch
import os
from chatterbox.tts import ChatterboxTTS

# Check if CUDA is available, otherwise use CPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Load model
print("Loading model...")
model = ChatterboxTTS.from_pretrained(device=device)

text = "Hello bro! I am testing chatterbox on your VPS. This is funny indeed! I cloned your voice successfully."
AUDIO_PROMPT_PATH = "/var/www/jokes.scorpion.codes/clone.mp3"

if not os.path.exists(AUDIO_PROMPT_PATH):
    print(f"Error: {AUDIO_PROMPT_PATH} not found")
    exit(1)

print("Generating audio...")
# Ensure we are using the correct method for voice cloning
wav = model.generate(text, audio_prompt_path=AUDIO_PROMPT_PATH)

output_path = "/var/www/jokes.scorpion.codes/public/test_clone.wav"
ta.save(output_path, wav, model.sr)
print(f"Saved to {output_path}")
