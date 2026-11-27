#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_dir="$(cd "$script_dir/../.." && pwd)"
data_dir="${1:-$repo_dir/../AI-Crop-Data}"
env_dir="$repo_dir/.venv-disease"

case "$(uname -s)" in
  Linux|Darwin) ;;
  *) echo 'This installer supports Linux and macOS.' >&2; exit 1 ;;
esac
if [[ "$(uname -s)" == Darwin && "$(uname -m)" != arm64 ]]; then
  echo 'This pinned Mac setup requires Apple Silicon and a native arm64 Terminal (not Rosetta).' >&2
  exit 1
fi

# Keep all packages isolated from the user's global Python and existing ML envs.
if command -v uv >/dev/null 2>&1; then
  uv_bin="$(command -v uv)"
else
  echo 'Installing uv into a project-local bootstrap environment...'
  command -v python3 >/dev/null 2>&1 || {
    echo 'Install Python 3 first, then run this installer again.' >&2; exit 1;
  }
  python3 -m venv "$repo_dir/.bootstrap-disease"
  "$repo_dir/.bootstrap-disease/bin/python" -m pip install 'uv==0.13.9'
  uv_bin="$repo_dir/.bootstrap-disease/bin/uv"
fi

if [[ ! -x "$env_dir/bin/python" ]]; then
  "$uv_bin" venv "$env_dir" --python 3.12
fi
"$env_dir/bin/python" -c 'import sys; assert sys.version_info[:2] == (3, 12), "Use Python 3.12 for this isolated environment"'
if [[ "$(uname -s)" == Linux ]]; then
  # Avoid installing multi-GB CUDA libraries on CPU-only hosts.
  "$uv_bin" pip install --python "$env_dir/bin/python" --no-cache --link-mode copy \
    'torch==2.10.0' 'torchvision==0.25.0' --index-url https://download.pytorch.org/whl/cpu
else
  "$uv_bin" pip install --python "$env_dir/bin/python" --no-cache --link-mode copy \
    'torch==2.10.0' 'torchvision==0.25.0'
fi
"$uv_bin" pip install --python "$env_dir/bin/python" --no-cache --link-mode copy -r "$script_dir/requirements.txt"
"$env_dir/bin/python" "$script_dir/prepare.py" --data-dir "$data_dir"
"$env_dir/bin/python" "$script_dir/train.py" --data-dir "$data_dir" --smoke
echo "Setup complete. Full training command:"
printf '  %q %q --data-dir %q --epochs 12\n' "$env_dir/bin/python" "$script_dir/train.py" "$data_dir"
