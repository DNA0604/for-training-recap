#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ -f /workspace/cloud-setup/env.sh ]]; then
  source /workspace/cloud-setup/env.sh
  export HYPERFRAMES_CONFIG_DIR="${HYPERFRAMES_CONFIG_DIR:-/workspace/.cache/hyperframes/config}"
  export HYPERFRAMES_CACHE_DIR="${HYPERFRAMES_CACHE_DIR:-/workspace/.cache/hyperframes}"
  export XDG_STATE_HOME="${XDG_STATE_HOME:-/workspace/.cache/state}"
fi
if [[ -x /usr/bin/chromium ]]; then export HYPERFRAMES_BROWSER_PATH="${HYPERFRAMES_BROWSER_PATH:-/usr/bin/chromium}"; fi
if [[ -x /usr/bin/ffmpeg ]]; then export HYPERFRAMES_FFMPEG_PATH="${HYPERFRAMES_FFMPEG_PATH:-/usr/bin/ffmpeg}"; fi
if [[ -x /usr/bin/ffprobe ]]; then export HYPERFRAMES_FFPROBE_PATH="${HYPERFRAMES_FFPROBE_PATH:-/usr/bin/ffprobe}"; fi
if [[ -f /workspace/hyperframes/packages/cli/dist/cli.js ]]; then
  exec node /workspace/hyperframes/packages/cli/dist/cli.js "$@"
fi
exec npx --yes hyperframes@0.9.52 "$@"
