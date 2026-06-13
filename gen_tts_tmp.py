
import torchaudio as ta
import torch
from chatterbox.tts import ChatterboxTTS
model = ChatterboxTTS.from_pretrained(device='cpu')
AUDIO_PROMPT_PATH = '/var/www/jokes.scorpion.codes/clone.mp3'

# Generate Question
wav_q = model.generate('Why did the AI go to therapy?', audio_prompt_path=AUDIO_PROMPT_PATH)
ta.save('public/question_test.wav', wav_q, model.sr)

# Generate Punchline
wav_p = model.generate('Because it had too many unresolved exceptions! 😂', audio_prompt_path=AUDIO_PROMPT_PATH)
ta.save('public/punchline_test.wav', wav_p, model.sr)
