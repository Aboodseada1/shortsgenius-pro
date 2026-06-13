#!/usr/bin/env python3
"""
Morning Runner Script - Just calls run.py
"""
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()

if __name__ == "__main__":
    subprocess.run([sys.executable, str(BASE_DIR / "run.py")], cwd=str(BASE_DIR))
