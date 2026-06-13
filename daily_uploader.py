#!/usr/bin/env python3
"""
Daily Joke Uploader - Smart Automation Script
==============================================
This script is triggered by n8n twice daily to:
1. Check if it's the correct time window (NY time)
2. Determine which joke type to upload based on the time
3. Find the next joke that hasn't been uploaded
4. Generate the video using render_branded.py logic
5. Upload to YouTube
6. Track history to avoid duplicates
7. Trigger webhook when done

Usage:
    python daily_uploader.py              # Normal run (checks time window)
    python daily_uploader.py --force      # Force run (skip time check)
    python daily_uploader.py --morning    # Force morning (question-punchline)
    python daily_uploader.py --evening    # Force evening (story)
    python daily_uploader.py --auth       # First-time YouTube auth only
"""

import os
import sys
import json
import yaml
import time
import subprocess
import argparse
import requests
from datetime import datetime
from pathlib import Path
import pytz

# Google API imports
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# ============================================
# CONFIGURATION
# ============================================

BASE_DIR = Path(__file__).parent.resolve()
CONFIG_FILE = BASE_DIR / "config.yaml"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
]

# Telegram Notifications
TELEGRAM_BOT_TOKEN = "7883058593:AAFjJln5C213Ilci1tI_lkzkaUy_4NtCFkk"
TELEGRAM_CHAT_ID = "678971872"


# Trendy hashtags for YouTube Shorts
TRENDY_HASHTAGS = [
    "#shorts", "#viral", "#fyp", "#funny", "#comedy", "#humor",
    "#dadjokes", "#jokes", "#lol", "#memes", "#trending", "#foryou",
    "#laugh", "#relatable", "#subscribe", "#dailyjokes", "#funnyvideo"
]

# ============================================
# HELPER FUNCTIONS
# ============================================

def load_config():
    """Load configuration from YAML file."""
    with open(CONFIG_FILE, "r") as f:
        return yaml.safe_load(f)

def load_history():
    """Load upload history from JSON file."""
    config = load_config()
    history_file = BASE_DIR / config["content"]["history_file"]
    if history_file.exists():
        with open(history_file, "r") as f:
            return json.load(f)
    return {"uploaded_jokes": [], "daily_uploads": {}}

def save_history(history):
    """Save upload history to JSON file."""
    config = load_config()
    history_file = BASE_DIR / config["content"]["history_file"]
    with open(history_file, "w") as f:
        json.dump(history, f, indent=2)

def load_jokes():
    """Load jokes from JSON file."""
    config = load_config()
    jokes_file = BASE_DIR / config["content"]["jokes_file"]
    with open(jokes_file, "r") as f:
        return json.load(f)

def get_ny_time():
    """Get current time in New York timezone."""
    ny_tz = pytz.timezone("America/New_York")
    return datetime.now(ny_tz)

def is_in_time_window(config):
    """Check if current NY time is within any scheduled window."""
    ny_time = get_ny_time()
    current_time = ny_time.strftime("%H:%M")
    current_date = ny_time.strftime("%Y-%m-%d")
    
    schedule = config["schedule"]
    
    # Check morning window
    morning = schedule["morning"]
    if morning["start"] <= current_time <= morning["end"]:
        return "morning", morning["joke_type"], current_date
    
    # Check evening window
    evening = schedule["evening"]
    if evening["start"] <= current_time <= evening["end"]:
        return "evening", evening["joke_type"], current_date
    
    return None, None, current_date

def get_daily_quota_status(history, joke_type, current_date):
    """Check how many jokes of this type have been uploaded today."""
    daily = history.get("daily_uploads", {}).get(current_date, {})
    uploaded_count = daily.get(joke_type, 0)
    return uploaded_count

def find_next_joke(jokes, history):
    """Find the next joke in order that hasn't been uploaded."""
    uploaded_ids = set(history.get("uploaded_jokes", []))
    
    for joke in jokes:
        if joke["id"] not in uploaded_ids:
            return joke
    
    return None

def get_audio_duration(audio_path):
    """Get audio duration using ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", audio_path],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())

def send_telegram_notification(video_url, joke_id, joke_type, window):
    """Send a stylized Telegram message when video is uploaded."""
    
    # Stylized message with emojis
    emoji = "☀️" if window == "morning" else "🌙"
    type_label = "Question + Punchline" if joke_type == "question-punchline" else "Story Joke"
    
    message = f"""
{emoji} *New Joke Uploaded!* {emoji}

🎬 *Type:* {type_label}
🆔 *Joke ID:* #{joke_id}
⏰ *Time:* {window.capitalize()} Upload

🔗 *YouTube Link:*
{video_url}
""".strip()
    
    api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False
    }
    
    try:
        response = requests.post(api_url, json=payload, timeout=30)
        if response.status_code == 200:
            print(f"✅ Telegram notification sent!")
            return True
        else:
            print(f"⚠️ Telegram failed: {response.text}")
            return False
    except Exception as e:
        print(f"⚠️ Telegram error: {e}")
        return False


def build_description(joke, joke_type):
    """Build a description with trendy hashtags."""
    if joke_type == "question-punchline":
        text = f"{joke['question']}\n\n{joke['punchline']}"
    else:
        text = joke["story"]
    
    # Add trendy hashtags
    hashtags = " ".join(TRENDY_HASHTAGS[:10])  # Top 10 hashtags
    
    return f"{text}\n\n{hashtags}"

def generate_video(joke):
    """Generate video for the joke using the existing render pipeline."""
    print(f"🎬 Generating video for joke #{joke['id']}...")
    
    config = load_config()
    public_dir = BASE_DIR / "public"
    out_dir = BASE_DIR / config["content"]["output_dir"]
    
    # Temporary audio files
    cta_audio = public_dir / "cta_tmp.wav"
    generated_files = [cta_audio]
    
    try:
        # Generate CTA audio
        print("🎙️ Generating CTA audio...")
        subprocess.run([
            "/root/miniconda3/bin/conda", "run", "-n", "chatterbox", "python", "generate_audio.py",
            "--text", "Subscribe for more!",
            "--output", str(cta_audio),
            "--exaggeration", "0.4", "--speed", "1.0"
        ], cwd=str(BASE_DIR), check=True)
        
        cta_dur = get_audio_duration(str(cta_audio))
        
        if joke["type"] == "question-punchline":
            q_audio = public_dir / "q_tmp.wav"
            p_audio = public_dir / "p_tmp.wav"
            generated_files.extend([q_audio, p_audio])
            
            # Generate question audio
            print("🎙️ Generating Question audio...")
            subprocess.run([
                "/root/miniconda3/bin/conda", "run", "-n", "chatterbox", "python", "generate_audio.py",
                "--text", joke["question"],
                "--output", str(q_audio),
                "--exaggeration", "0.4", "--speed", "1.0"
            ], cwd=str(BASE_DIR), check=True)
            
            # Generate punchline audio
            print("🎙️ Generating Punchline audio...")
            subprocess.run([
                "/root/miniconda3/bin/conda", "run", "-n", "chatterbox", "python", "generate_audio.py",
                "--text", joke["punchline"],
                "--output", str(p_audio),
                "--exaggeration", "0.4", "--speed", "1.0"
            ], cwd=str(BASE_DIR), check=True)
            
            q_dur = get_audio_duration(str(q_audio))
            p_dur = get_audio_duration(str(p_audio))
            
            # Select background music
            total_est = 1 + q_dur + 0.5 + 1 + p_dur + 0.5 + 3.5
            bg_music = "30-sec.mp3" if total_est < 28 else "60-sec.mp3"
            
            render_config = {
                "type": "question-punchline",
                "outputFileName": f"joke_{joke['id']}_{int(time.time())}.mp4",
                "questionPunchline": {
                    "question": {"text": joke["question"], "audioFile": "q_tmp.wav", "audioDuration": q_dur},
                    "punchline": {"text": joke["punchline"], "audioFile": "p_tmp.wav", "audioDuration": p_dur}
                },
                "ctaAudio": {"audioSrc": "cta_tmp.wav", "audioDuration": cta_dur},
                "bgMusic": {"audioSrc": bg_music, "volume": 0.1},
                "style": {"backgroundColor": "#0f0f23", "accentColor": "#fbbf24"}
            }
            
            title = joke["question"][:70] if len(joke["question"]) <= 70 else joke["question"][:67] + "..."
            description = build_description(joke, "question-punchline")
            
        else:  # story
            s_audio = public_dir / "s_tmp.wav"
            generated_files.append(s_audio)
            
            print("🎙️ Generating Story audio...")
            subprocess.run([
                "/root/miniconda3/bin/conda", "run", "-n", "chatterbox", "python", "generate_audio.py",
                "--text", joke["story"],
                "--output", str(s_audio),
                "--exaggeration", "0.4", "--speed", "1.0"
            ], cwd=str(BASE_DIR), check=True)
            
            s_dur = get_audio_duration(str(s_audio))
            
            total_est = 2 + s_dur + 3.5
            bg_music = "30-sec.mp3" if total_est < 28 else "60-sec.mp3"
            
            render_config = {
                "type": "story",
                "outputFileName": f"story_{joke['id']}_{int(time.time())}.mp4",
                "story": {"title": "Story Time 📖", "text": joke["story"], "audioFile": "s_tmp.wav", "audioDuration": s_dur},
                "ctaAudio": {"audioSrc": "cta_tmp.wav", "audioDuration": cta_dur},
                "bgMusic": {"audioSrc": bg_music, "volume": 0.1},
                "style": {"backgroundColor": "#1a1a2e", "accentColor": "#e94560"}
            }
            
            title = joke["story"][:70] if len(joke["story"]) <= 70 else joke["story"][:67] + "..."
            description = build_description(joke, "story")
        
        # Write config and render
        config_path = BASE_DIR / "joke-config-auto.json"
        with open(config_path, "w") as f:
            json.dump(render_config, f, indent=2)
        
        print("🎬 Rendering video...")
        subprocess.run([
            "npx", "ts-node", "--esm", "render.ts", "--config", "joke-config-auto.json"
        ], cwd=str(BASE_DIR), check=True)
        
        output_file = out_dir / render_config["outputFileName"]
        
        return str(output_file), title, description
        
    finally:
        # Cleanup temporary files
        print("🧹 Cleaning up temporary audio files...")
        for f in generated_files:
            if f.exists():
                f.unlink()
                print(f"   Removed: {f}")

# ============================================
# YOUTUBE UPLOAD
# ============================================

def get_youtube_credentials(config):
    """Get or refresh YouTube API credentials."""
    creds = None
    token_file = BASE_DIR / config["youtube"]["token_file"]
    credentials_file = BASE_DIR / config["youtube"]["credentials_file"]
    
    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Refreshing YouTube token...")
            creds.refresh(Request())
        else:
            print("🔐 Starting YouTube OAuth flow...")
            print("📋 Since this is a headless server, follow these steps:")
            print("   1. Copy the URL below and open it in your browser")
            print("   2. Sign in with your YouTube account")
            print("   3. Copy the authorization code and paste it below")
            print()
            
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_file), SCOPES)
            
            # Use out-of-band flow for headless servers
            flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
            auth_url, _ = flow.authorization_url(prompt="consent")
            
            print(f"🔗 Authorization URL:\n{auth_url}\n")
            code = input("📝 Enter the authorization code: ").strip()
            
            flow.fetch_token(code=code)
            creds = flow.credentials
        
        with open(token_file, "w") as token:
            token.write(creds.to_json())
    
    return creds

def upload_to_youtube(video_path, title, description, config):
    """Upload video to YouTube."""
    print(f"📤 Uploading to YouTube: {title}")
    
    creds = get_youtube_credentials(config)
    youtube = build("youtube", "v3", credentials=creds)
    
    # Combine config tags with trendy hashtags
    all_tags = config["youtube"]["default_tags"] + [tag.replace("#", "") for tag in TRENDY_HASHTAGS]
    
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": all_tags[:30],  # YouTube allows max 30 tags
            "categoryId": config["youtube"]["category_id"]
        },
        "status": {
            "privacyStatus": config["youtube"]["privacy_status"],
            "selfDeclaredMadeForKids": False
        }
    }
    
    media = MediaFileUpload(video_path, mimetype="video/mp4", resumable=True)
    
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media
    )
    
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"   Upload progress: {int(status.progress() * 100)}%")
    
    video_id = response["id"]
    print(f"✅ Uploaded! Video ID: {video_id}")
    print(f"   URL: https://youtube.com/shorts/{video_id}")
    
    return video_id

# ============================================
# MAIN LOGIC
# ============================================

def run_auth_only():
    """Run authentication flow only."""
    print("🔐 Running YouTube authentication...")
    config = load_config()
    get_youtube_credentials(config)
    print("✅ Authentication complete! Token saved.")

def run_upload():
    """Main upload logic - uploads the next joke in order."""
    config = load_config()
    history = load_history()
    jokes = load_jokes()
    
    ny_time = get_ny_time()
    current_date = ny_time.strftime("%Y-%m-%d")
    
    # Find next joke in order (already sorted: qp, story, qp, story...)
    joke = find_next_joke(jokes, history)
    
    if joke is None:
        print("❌ No more jokes available! All jokes have been uploaded.")
        return {"status": "error", "reason": "no_jokes_available"}
    
    joke_type = joke["type"]
    window = "morning" if joke_type == "question-punchline" else "evening"
    
    print(f"� Uploading joke #{joke['id']} ({joke_type})")
    print(f"📅 Date: {current_date}")
    
    # Generate video
    video_path, title, description = generate_video(joke)
    
    # Upload to YouTube
    video_url = None
    if config["youtube"]["enabled"]:
        video_id = upload_to_youtube(video_path, title, description, config)
        video_url = f"https://youtube.com/shorts/{video_id}"
    else:
        video_id = "youtube_disabled"
        print("⚠️ YouTube upload disabled in config")
    
    # Update history
    history["uploaded_jokes"].append(joke["id"])
    
    if current_date not in history["daily_uploads"]:
        history["daily_uploads"][current_date] = {}
    
    if joke_type not in history["daily_uploads"][current_date]:
        history["daily_uploads"][current_date][joke_type] = 0
    
    history["daily_uploads"][current_date][joke_type] += 1
    
    save_history(history)
    
    print(f"\n🎉 SUCCESS! Uploaded joke #{joke['id']} to YouTube!")
    
    # Send Telegram notification
    if video_url:
        send_telegram_notification(video_url, joke["id"], joke_type, window)
    
    return {
        "status": "success",
        "joke_id": joke["id"],
        "joke_type": joke_type,
        "video_id": video_id,
        "video_url": video_url,
        "video_path": video_path
    }

def main():
    parser = argparse.ArgumentParser(description="Daily Joke Uploader - uploads next joke in order")
    parser.add_argument("--auth", action="store_true", help="Run YouTube auth only")
    parser.add_argument("--morning", action="store_true", help="Ignored (legacy compatibility)")
    parser.add_argument("--evening", action="store_true", help="Ignored (legacy compatibility)")
    args = parser.parse_args()
    
    os.chdir(BASE_DIR)
    
    # Ensure logs directory exists
    (BASE_DIR / "logs").mkdir(exist_ok=True)
    
    if args.auth:
        run_auth_only()
    else:
        result = run_upload()
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
