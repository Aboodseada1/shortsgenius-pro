import os
import subprocess
import json
import time

def run_full_joke_workflow():
    print("🚀 Starting End-to-End Joke Workflow Test...")

    # 1. Joke Data
    joke = {
        "type": "question-punchline",
        "question": "Why did the AI go to therapy?",
        "punchline": "Because it had too many unresolved exceptions! 😂"
    }
    
    # 2. Generate TTS (using Chatterbox in its conda env)
    # We use a helper script for this to avoid torch conflicts in the main process
    print("\n🎙️ Generating TTS Audio with Cloned Voice...")
    tts_script = f"""
import torchaudio as ta
import torch
from chatterbox.tts import ChatterboxTTS
model = ChatterboxTTS.from_pretrained(device='cpu')
AUDIO_PROMPT_PATH = '/var/www/jokes.scorpion.codes/clone.mp3'

# Generate Question
wav_q = model.generate('{joke["question"]}', audio_prompt_path=AUDIO_PROMPT_PATH)
ta.save('public/question_test.wav', wav_q, model.sr)

# Generate Punchline
wav_p = model.generate('{joke["punchline"]}', audio_prompt_path=AUDIO_PROMPT_PATH)
ta.save('public/punchline_test.wav', wav_p, model.sr)
"""
    with open('gen_tts_tmp.py', 'w') as f:
        f.write(tts_script)
    
    subprocess.run(["conda", "run", "-n", "chatterbox", "python", "gen_tts_tmp.py"], check=True)
    print("✅ TTS Audio Generated (public/question_test.wav, public/punchline_test.wav)")

    # 3. Create Config
    config = {
        "type": "question-punchline",
        "outputFileName": "workflow-test.mp4",
        "questionPunchline": {
            "question": {
                "text": joke["question"],
                "audioFile": "question_test.wav",
                "audioDuration": 5.0 # Approximate, Remotion handles it
            },
            "punchline": {
                "text": joke["punchline"],
                "audioFile": "punchline_test.wav",
                "audioDuration": 5.0
            }
        }
    }
    with open('joke-config-test.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("\n📄 Config created (joke-config-test.json)")

    # 4. Render Video
    print("\n🎬 Rendering Video...")
    subprocess.run(["npx", "ts-node", "--esm", "render.ts", "--config", "joke-config-test.json"], check=True)
    print("✅ Video Rendered (out/workflow-test.mp4)")

    # 5. Log to Database
    print("\n📊 Logging to Database...")
    db_payload = {
        "type": "question-punchline",
        "title": joke["question"],
        "content": joke["punchline"],
        "video_path": "/out/workflow-test.mp4",
        "status": "completed"
    }
    
    # Using curl to hit our own API
    curl_cmd = [
        "curl", "-X", "POST", "-H", "Content-Type: application/json",
        "-d", json.dumps(db_payload),
        "http://127.0.0.1:3001/api/jokes"
    ]
    subprocess.run(curl_cmd, check=True)
    print("\n✅ Logged to Monitoring System!")
    print("\n🎉 Workflow Test Complete!")

if __name__ == "__main__":
    run_full_joke_workflow()
