import os
import subprocess
import json
import time

def get_audio_duration(file_path):
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return float(result.stdout.strip())

def render_branded_joke(joke_type, question_text=None, punchline_text=None, story_title=None, story_text=None):
    print(f"🚀 Starting Branded Joke Render: {joke_type}")
    
    # Paths
    PUBLIC_DIR = "/var/www/jokes.scorpion.codes/public"
    OUT_DIR = "/var/www/jokes.scorpion.codes/out"
    os.makedirs(OUT_DIR, exist_ok=True)
    
    q_audio = os.path.join(PUBLIC_DIR, "q_tmp.wav")
    p_audio = os.path.join(PUBLIC_DIR, "p_tmp.wav")
    s_audio = os.path.join(PUBLIC_DIR, "s_tmp.wav")
    cta_audio = os.path.join(PUBLIC_DIR, "cta_tmp.wav")
    
    generated_files = []

    try:
        # 0. Generate CTA Audio ("Subscribe for more!")
        print("🎙️ Generating CTA audio...")
        subprocess.run(["conda", "run", "-n", "chatterbox", "python", "generate_audio.py", "--text", "Subscribe for more!", "--output", cta_audio, "--exaggeration", "0.8", "--speed", "1.1"], check=True)
        generated_files.append(cta_audio)
        cta_dur = get_audio_duration(cta_audio)

        # 1. Generate TTS with Speed=1.1, Exaggeration=0.8
        if joke_type == "question-punchline":
            print("🎙️ Generating Question audio...")
            subprocess.run(["conda", "run", "-n", "chatterbox", "python", "generate_audio.py", "--text", question_text, "--output", q_audio, "--exaggeration", "0.8", "--speed", "1.1"], check=True)
            generated_files.append(q_audio)
            
            print("🎙️ Generating Punchline audio...")
            subprocess.run(["conda", "run", "-n", "chatterbox", "python", "generate_audio.py", "--text", punchline_text, "--output", p_audio, "--exaggeration", "0.8", "--speed", "1.1"], check=True)
            generated_files.append(p_audio)
            
            q_dur = get_audio_duration(q_audio)
            p_dur = get_audio_duration(p_audio)
            
            # Select background music based on total estimated duration (plus intro/pause/outro)
            total_est = 1 + q_dur + 0.5 + 1 + p_dur + 0.5 + 3.5
            bg_music = "30-sec.mp3" if total_est < 28 else "60-sec.mp3"

            config = {
                "type": "question-punchline",
                "outputFileName": f"joke_{int(time.time())}.mp4",
                "questionPunchline": {
                    "question": { "text": question_text, "audioFile": os.path.basename(q_audio), "audioDuration": q_dur },
                    "punchline": { "text": punchline_text, "audioFile": os.path.basename(p_audio), "audioDuration": p_dur }
                },
                "ctaAudio": { "audioSrc": os.path.basename(cta_audio), "audioDuration": cta_dur },
                "bgMusic": { "audioSrc": bg_music, "volume": 0.1 },
                "style": { "backgroundColor": "#0f0f23", "accentColor": "#fbbf24" }
            }
        else:
            print("🎙️ Generating Story audio...")
            subprocess.run(["conda", "run", "-n", "chatterbox", "python", "generate_audio.py", "--text", story_text, "--output", s_audio, "--exaggeration", "0.8", "--speed", "1.1"], check=True)
            generated_files.append(s_audio)
            
            s_dur = get_audio_duration(s_audio)
            total_est = 2 + s_dur + 3.5
            bg_music = "30-sec.mp3" if total_est < 28 else "60-sec.mp3"

            config = {
                "type": "story",
                "outputFileName": f"story_{int(time.time())}.mp4",
                "story": { "title": story_title, "text": story_text, "audioFile": os.path.basename(s_audio), "audioDuration": s_dur },
                "ctaAudio": { "audioSrc": os.path.basename(cta_audio), "audioDuration": cta_dur },
                "bgMusic": { "audioSrc": bg_music, "volume": 0.1 },
                "style": { "backgroundColor": "#1a1a2e", "accentColor": "#e94560" }
            }

        # 2. Write Config
        config_path = "joke-config-branded.json"
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
        
        # 3. Render Video
        print("🎬 Rendering Branded Video...")
        subprocess.run(["npx", "ts-node", "--esm", "render.ts", "--config", config_path], check=True)
        video_output = os.path.join(OUT_DIR, config["outputFileName"])
        
        # 4. Log to DB
        print("📊 Logging to Monitor...")
        db_payload = {
            "type": joke_type,
            "title": story_title if joke_type == "story" else question_text,
            "content": story_text if joke_type == "story" else punchline_text,
            "video_path": f"/out/{config['outputFileName']}",
            "status": "completed"
        }
        subprocess.run(["curl", "-X", "POST", "-H", "Content-Type: application/json", "-d", json.dumps(db_payload), "http://127.0.0.1:3001/api/jokes"], check=True)

        print(f"✅ Finished! Video saved to {video_output}")

    finally:
        # 5. Cleanup Audio Files
        print("🧹 Cleaning up temporary audio files...")
        for f in generated_files:
            if os.path.exists(f):
                os.remove(f)
                print(f"   Removed: {f}")

if __name__ == "__main__":
    # Test Run
    render_branded_joke(
        joke_type="question-punchline",
        question_text="Why do programmers hate nature?",
        punchline_text="Because it has too many bugs and no dark mode! 🌲💻"
    )
