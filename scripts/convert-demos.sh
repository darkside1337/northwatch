#!/bin/bash
set -e

mkdir -p demo-recordings public/demo

for f in demo-recordings/flow*.webm; do
  if [ -f "$f" ]; then
    base=$(basename "$f" .webm)
    echo "Converting $f to 1080p MP4 ($base.mp4)..."
    ffmpeg -y -ss 00:00:00 -i "$f" -c:v libx264 -crf 22 -pix_fmt yuv420p -an "demo-recordings/${base}.mp4"
    cp "demo-recordings/${base}.mp4" "public/demo/${base}.mp4"
  fi
done

echo "✅ All demo videos successfully converted and copied to public/demo/"
