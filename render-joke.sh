#!/bin/bash
# ============================================
# Joke Reel Render Script
# ============================================
# This script is designed to be called by cron or n8n
# It renders a joke video based on the config file
#
# Usage:
#   ./render-joke.sh                    # Uses joke-config.json
#   ./render-joke.sh custom-config.json # Uses custom config
#
# Crontab example (3x daily at 8am, 2pm, 8pm):
#   0 8,14,20 * * * cd /path/to/project && ./render-joke.sh >> /var/log/jokes.log 2>&1
# ============================================

set -e

# Change to script directory
cd "$(dirname "$0")"

DISABLE_MARKER="$(pwd)/.remotion-auto-render-disabled"
if [ -f "$DISABLE_MARKER" ]; then
    echo "⏸️  Remotion auto-render disabled ($DISABLE_MARKER)."
    echo "   Delete that file when you want renders to run again."
    exit 0
fi

# Config file (default or passed as argument)
CONFIG_FILE="${1:-joke-config.json}"

# Timestamp for logging
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "============================================"
echo "🎬 Joke Reel Renderer"
echo "📅 $TIMESTAMP"
echo "📄 Config: $CONFIG_FILE"
echo "============================================"

# Check if config exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

# Check if audio files exist
echo ""
echo "🔍 Checking audio files..."

# Extract audio file paths from config
AUDIO_FILES=$(grep -oP '"audioFile":\s*"\K[^"]+' "$CONFIG_FILE" 2>/dev/null || true)

for AUDIO in $AUDIO_FILES; do
    if [ ! -f "public/$AUDIO" ]; then
        echo "⚠️  Audio file missing: public/$AUDIO"
    else
        echo "✅ Found: public/$AUDIO"
    fi
done

# Run the render
echo ""
echo "🎥 Starting render..."
echo ""

npx ts-node render.ts --config "$CONFIG_FILE"

echo ""
echo "✅ Render complete!"
echo "============================================"
