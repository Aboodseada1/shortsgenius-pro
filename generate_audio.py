import argparse
import os
import subprocess
import torch
import torchaudio as ta
from chatterbox.tts import ChatterboxTTS

def main():
    parser = argparse.ArgumentParser(description="Generate TTS audio with Chatterbox")
    parser.add_argument("--text", required=True, help="Text to speak")
    parser.add_argument("--output", required=True, help="Output wav path")
    parser.add_argument("--exaggeration", type=float, default=0.8, help="Exaggeration level (0.0 to 1.0)")
    parser.add_argument("--speed", type=float, default=1.1, help="Speed multiplier (e.g. 1.1 for 10% faster)")
    parser.add_argument("--device", default="cpu", help="Device to use (cpu or cuda)")
    
    args = parser.parse_args()
    
    print(f"🎙️ Loading ChatterboxTTS on {args.device}...")
    model = ChatterboxTTS.from_pretrained(device=args.device)
    
    AUDIO_PROMPT_PATH = "/var/www/jokes.scorpion.codes/clone.mp3"
    
    print(f"🗣️ Generating audio: '{args.text}' (exaggeration={args.exaggeration})")
    wav = model.generate(args.text, audio_prompt_path=AUDIO_PROMPT_PATH, exaggeration=args.exaggeration)
    
    temp_wav = "temp_gen.wav"
    ta.save(temp_wav, wav, model.sr)
    
    if args.speed != 1.0:
        print(f"⏩ Adjusting speed to {args.speed}x...")
        # Use ffmpeg to change speed without changing pitch (atempo filter)
        # Note: atempo must be between 0.5 and 2.0
        subprocess.run([
            "ffmpeg", "-y", "-i", temp_wav,
            "-filter:a", f"atempo={args.speed}",
            args.output
        ], check=True)
        os.remove(temp_wav)
    else:
        os.rename(temp_wav, args.output)
        
    print(f"✅ Saved to {args.output}")

if __name__ == "__main__":
    main()
