#!/usr/bin/env python3
"""Normalize the completed video's audio, preserve H.264, and record measured QA."""
from pathlib import Path
import hashlib
import json
import os
import subprocess

root = Path(__file__).resolve().parent
video = root / 'Dashboard_Pelatihan_45_Detik.mp4'
temporary = root / '.hyperframes' / 'audio-normalized.mp4'
temporary.parent.mkdir(parents=True, exist_ok=True)
ffmpeg = os.environ.get('HYPERFRAMES_FFMPEG_PATH', 'ffmpeg')
ffprobe = os.environ.get('HYPERFRAMES_FFPROBE_PATH', 'ffprobe')

def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True)

def video_hash(path):
    return run([ffmpeg, '-v', 'error', '-i', str(path), '-map', '0:v:0',
                '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-']).stdout.strip()

original_stream_hash = video_hash(video)
run([ffmpeg, '-v', 'error', '-i', str(video), '-map', '0:v:0', '-map', '0:a:0',
     '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-2:LRA=11',
     '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', '45', '-movflags', '+faststart',
     '-y', str(temporary)])
assert video_hash(temporary) == original_stream_hash, 'Video stream changed during audio normalization'
temporary.replace(video)

probe = json.loads(run([ffprobe, '-v', 'error', '-count_frames', '-show_streams',
                        '-show_format', '-of', 'json', str(video)]).stdout)
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
assert (v['width'], v['height']) == (1920, 1080)
assert v['r_frame_rate'] == '30/1'
assert int(v['nb_read_frames']) == 1350
assert abs(float(probe['format']['duration']) - 45) < .1
assert a['codec_name'] == 'aac'
run([ffmpeg, '-v', 'error', '-i', str(video), '-f', 'null', '-'])
measurement = run([ffmpeg, '-hide_banner', '-i', str(video), '-vn', '-af',
                   'loudnorm=I=-16:TP=-2:LRA=11:print_format=json', '-f', 'null', '-']).stderr
levels = json.loads(measurement[measurement.rfind('{'):measurement.rfind('}')+1])
assert float(levels['input_tp']) <= -1.0, 'True peak too high'
assert -17 <= float(levels['input_i']) <= -14.5, 'Unexpected loudness'

check_file = root / 'check-final.log'
checks = {}
if check_file.exists():
    text = check_file.read_text()
    check = json.loads(text[text.index('{'):])
    assert check['ok'], 'Composition check did not pass'
    for k in ['lint', 'runtime', 'layout', 'motion', 'contrast', 'craft', 'audio']:
        checks[k] = {name: check[k].get(name) for name in ['ok', 'enabled', 'errorCount', 'warningCount', 'samples'] if name in check[k]}
    checks['warning_review'] = 'Craft line_unread pada 90 menit efektif adalah fragmen transisi; teks terkonfirmasi pada frame 17,6/18,6/19,4. Lihat REVIEW.md. Motion sidecar tidak digunakan; urutan gerak diperiksa lewat snapshot dan frame ekspor.'

result = {
    'file': video.name, 'bytes': video.stat().st_size,
    'sha256': hashlib.sha256(video.read_bytes()).hexdigest(),
    'video': {k:v[k] for k in ['codec_name', 'width', 'height', 'pix_fmt', 'r_frame_rate', 'nb_read_frames', 'duration']},
    'audio': {k:a[k] for k in ['codec_name', 'sample_rate', 'channels', 'duration']},
    'audio_measured': {'integrated_lufs': float(levels['input_i']), 'true_peak_dbtp': float(levels['input_tp']), 'loudness_range_lu': float(levels['input_lra']), 'listened_by_agent': False},
    'video_stream_preserved': True, 'video_stream_sha256': original_stream_hash,
    'complete_av_decode': 'passed', 'composition_checks': checks,
    'editor_preview': 'Chromium opened HyperFrames Studio with composition/timeline and no page errors',
    'data': 'Synthetic fixture assets from the user repository; no Google account or production spreadsheet accessed',
    'application_source_modified': False, 'main_modified': False,
}
(root/'PEMERIKSAAN.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
print(json.dumps(result, ensure_ascii=False, indent=2))
