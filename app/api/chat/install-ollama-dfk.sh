#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# ETHUB — Ollama Installer ("dfk" edition, no repo edits by default)
# - macOS: Homebrew   | Linux: official installer   | Fallback: Docker
# - Pulls model (default llama3.1)
# - Starts service, health-checks, prints next steps
# - Optional: --write-env writes OLLAMA_URL to ./.env.local (opt-in)
# ------------------------------------------------------------

MODEL="llama3.1"
OLLAMA_URL="http://127.0.0.1:11434"
USE_DOCKER=false
WRITE_ENV=false
DOCKER_NAME="ollama"
DOCKER_VOL="ollama_data"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
note() { printf "➜ %s\n" "$*"; }
ok()   { printf "✅ %s\n" "$*"; }
err()  { printf "❌ %s\n" "$*" >&2; }
die()  { err "$*"; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --model) MODEL="${2:-$MODEL}"; shift 2;;
    --url) OLLAMA_URL="${2:-$OLLAMA_URL}"; shift 2;;
    --docker) USE_DOCKER=true; shift;;
    --write-env) WRITE_ENV=true; shift;;
    -h|--help)
      cat <<EOF
Usage: $0 [--model llama3.1] [--url http://127.0.0.1:11434] [--docker] [--write-env]
  --model       Model to pull (default: llama3.1)
  --url         Ollama base URL (default: http://127.0.0.1:11434)
  --docker      Install & run Ollama via Docker instead of native
  --write-env   Append OLLAMA_URL to ./.env.local (repo file)  [opt-in]
EOF
      exit 0;;
    *) die "Unknown option: $1";;
  esac
done

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
SUDO="$(command -v sudo || true)"

need() { command -v "$1" >/dev/null 2>&1 || die "Missing dependency: $1"; }

healthcheck() {
  local url="$1"
  note "Health‑checking $url/api/tags ..."
  if curl -fsS "$url/api/tags" >/dev/null; then
    ok "Ollama endpoint is reachable."
  else
    err "Cannot reach Ollama at $url"
    return 1
  fi
}

pull_model() {
  local model="$1"
  note "Pulling model: $model"
  if command -v ollama >/dev/null 2>&1; then
    ollama pull "$model"
    ok "Model pulled: $model"
  else
    # Docker path
    docker exec "$DOCKER_NAME" ollama pull "$model"
    ok "Model pulled in Docker: $model"
  fi
}

ensure_native_running() {
  # Start service if available, otherwise background
  if command -v systemctl >/dev/null 2>&1; then
    if $SUDO systemctl is-enabled ollama >/dev/null 2>&1; then
      $SUDO systemctl restart ollama
    else
      $SUDO systemctl enable --now ollama
    fi
  else
    # macOS launchd or simple background
    if command -v brew >/dev/null 2>&1; then
      brew services restart ollama || ollama serve >/dev/null 2>&1 &
    else
      nohup ollama serve >/dev/null 2>&1 &
    fi
  fi
  sleep 2
}

install_native_macos() {
  need curl
  if ! command -v brew >/dev/null 2>&1; then
    die "Homebrew not found. Install Homebrew from https://brew.sh/ or run with --docker."
  fi
  note "Installing Ollama via Homebrew…"
  brew install ollama || true
  ensure_native_running
}

install_native_linux() {
  need curl
  note "Installing Ollama via official script…"
  # Official installer uses sudo internally when needed
  curl -fsSL https://ollama.com/install.sh | sh
  ensure_native_running
}

install_docker() {
  need docker
  note "Running Ollama with Docker…"
  docker pull ollama/ollama:latest
  # Create volume if missing
  docker volume inspect "$DOCKER_VOL" >/dev/null 2>&1 || docker volume create "$DOCKER_VOL" >/dev/null
  # Stop any existing container
  docker rm -f "$DOCKER_NAME" >/dev/null 2>&1 || true
  docker run -d --name "$DOCKER_NAME" -p 11434:11434 -v "$DOCKER_VOL":/root/.ollama ollama/ollama:latest
  ok "Docker container started: $DOCKER_NAME (port 11434)"
}

write_env_if_opted() {
  $WRITE_ENV || return 0
  local envfile="./.env.local"
  note "Writing OLLAMA_URL to $envfile (opt‑in requested)…"
  touch "$envfile"
  if grep -q '^OLLAMA_URL=' "$envfile"; then
    # update existing
    sed -i.bak -E "s#^OLLAMA_URL=.*#OLLAMA_URL=${OLLAMA_URL}#g" "$envfile" || {
      # BSD sed (macOS) fallback
      sed -E "s#^OLLAMA_URL=.*#OLLAMA_URL=${OLLAMA_URL}#g" "$envfile" > "${envfile}.tmp" && mv "${envfile}.tmp" "$envfile"
    }
    ok "Updated OLLAMA_URL in .env.local"
  else
    echo "OLLAMA_URL=${OLLAMA_URL}" >> "$envfile"
    ok "Appended OLLAMA_URL to .env.local"
  fi
}

# ---------------- Main flow ----------------
bold "ETHUB — Ollama Installer"
note "OS: $OS  ARCH: $ARCH"
note "Target URL: $OLLAMA_URL"
note "Model: $MODEL"
$USE_DOCKER && note "Mode: Docker" || note "Mode: Native"

if $USE_DOCKER; then
  install_docker
else
  case "$OS" in
    darwin) install_native_macos ;;
    linux)  install_native_linux ;;
    *) die "Unsupported OS for native install. Use --docker." ;;
  esac
fi

# Health‑check and pull model
if ! healthcheck "$OLLAMA_URL"; then
  # In Docker mode target is localhost:11434—retry a moment
  sleep 2
  healthcheck "$OLLAMA_URL" || die "Ollama not reachable at $OLLAMA_URL after install."
fi

pull_model "$MODEL"
write_env_if_opted

ok "Installation complete."
cat <<EOF

Next steps:
  1) Ensure the model is loaded:
       curl -s ${OLLAMA_URL}/api/tags | jq . || true
  2) Dev server can now call your local LLM at:
       ${OLLAMA_URL}

Optional (no code changes done automatically):
  • To wire your Next.js route later, point your AI SDK to OLLAMA_URL.
  • If you want me to generate a one‑pager "how to call Ollama from Next" (read‑only plan + snippets), say the word.

EOF
