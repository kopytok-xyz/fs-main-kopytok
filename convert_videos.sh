#!/bin/bash

SRC_DIR="video-and-frames/src-videos"
DEST_DIR="video-and-frames"

if ! command -v ffmpeg &> /dev/null
then
    echo "FFmpeg не установлен. Установи его и попробуй снова."
    exit 1
fi

touch "$SRC_DIR/.gitkeep"

for video in "$SRC_DIR"/*.mp4 "$SRC_DIR"/*.mov; do
    [ -e "$video" ] || continue

    echo "Обрабатываю: $video"

    base_name=$(basename "$video")
    base_name="${base_name%.*}"
    output_dir="$DEST_DIR/$base_name"
    mkdir -p "$output_dir"

    echo "Сохраняем кадры в: $output_dir"

    # Ограничиваем качество кадра до 120 KB (эмпирически)
    ffmpeg -i "$video" -vf "fps=30,format=rgb24" -vsync 0 -c:v libwebp -compression_level 6 -q:v 50 "$output_dir/%04d.webp"

    echo "Готово: $output_dir"
done

echo "Все видео обработаны!"
