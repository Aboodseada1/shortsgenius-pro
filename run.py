#!/usr/bin/env python3
"""
Simple Runner Script
====================
Call this from n8n to upload the next joke.
Each call uploads the next joke in order (alternating qp/story).
"""

import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()

def main():
    print("🎬 Starting joke upload...")
    
    # Start the main uploader in background
    subprocess.Popen(
        [sys.executable, str(BASE_DIR / "daily_uploader.py")],
        cwd=str(BASE_DIR),
        stdout=open(BASE_DIR / "logs" / "upload.log", "a"),
        stderr=subprocess.STDOUT,
        start_new_session=True
    )
    
    print("🚀 Uploader started in background!")
    print("📋 Check logs/upload.log for progress")

if __name__ == "__main__":
    # Ensure logs directory exists
    (BASE_DIR / "logs").mkdir(exist_ok=True)
    main()
