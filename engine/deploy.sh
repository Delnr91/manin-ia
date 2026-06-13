#!/usr/bin/env bash
# =============================================================================
# manin-ia Engine — Deploy Script
# =============================================================================
# Bootstraps the entire engine stack on a fresh Oracle Free Tier ARM server.
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# What it does:
#   1. Checks prerequisites (Docker, docker compose)
#   2. Ensures .env exists (copies from .env.example if missing)
#   3. Creates required directory structure
#   4. Starts all services via docker compose
#   5. Waits for services to become healthy
#   6. Pulls the default LLM model (llama3) into Ollama
#   7. Prints a status summary
# =============================================================================

set -euo pipefail

# Colors for output readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ---------------------------------------------------------------------------
# 1. Check prerequisites
# ---------------------------------------------------------------------------
info "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
  error "Docker is not installed. Install it first: https://docs.docker.com/engine/install/"
fi
ok "Docker found: $(docker --version)"

# docker compose v2 (plugin) vs docker-compose v1 (standalone)
if docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
  ok "Docker Compose (plugin) found: $(docker compose version --short)"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
  ok "docker-compose (standalone) found: $(docker-compose --version)"
else
  error "Docker Compose is not installed. Install the docker-compose-plugin package."
fi

# ---------------------------------------------------------------------------
# 2. Ensure .env file exists
# ---------------------------------------------------------------------------
info "Checking .env file..."

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    warn ".env was missing — created from .env.example."
    warn "╔══════════════════════════════════════════════════════════════╗"
    warn "║  IMPORTANT: Edit .env and replace all placeholder values!   ║"
    warn "║  Then re-run this script.                                   ║"
    warn "╚══════════════════════════════════════════════════════════════╝"
    exit 1
  else
    error ".env file not found and no .env.example to copy from."
  fi
else
  ok ".env file found."
fi

# Sanity check: make sure the user actually changed the defaults
if grep -q "change-me" .env 2>/dev/null; then
  warn "Your .env still contains 'change-me' placeholder values."
  warn "Edit .env with real secrets before deploying to production."
  echo ""
  read -rp "Continue anyway? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    info "Aborting. Edit .env and re-run."
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# 3. Create directory structure
# ---------------------------------------------------------------------------
info "Creating directory structure..."

mkdir -p caddy
ok "Directory structure ready."

# ---------------------------------------------------------------------------
# 4. Start services
# ---------------------------------------------------------------------------
info "Starting services with ${COMPOSE_CMD}..."

$COMPOSE_CMD up -d

ok "All containers started."

# ---------------------------------------------------------------------------
# 5. Wait for services to become healthy
# ---------------------------------------------------------------------------
info "Waiting for services to initialize (30s)..."
sleep 30

# Check n8n
info "Checking n8n..."
if docker exec n8n wget -q --spider http://localhost:5678/healthz 2>/dev/null || \
   docker exec n8n curl -sf http://localhost:5678/healthz &>/dev/null; then
  ok "n8n is responding."
else
  warn "n8n may still be starting. Check: docker logs n8n"
fi

# Check Ollama
info "Checking Ollama..."
if docker exec ollama curl -sf http://localhost:11434/api/version &>/dev/null || \
   docker exec ollama wget -q --spider http://localhost:11434/api/version 2>/dev/null; then
  ok "Ollama is responding."
else
  warn "Ollama may still be starting. Check: docker logs ollama"
fi

# ---------------------------------------------------------------------------
# 6. Pull default LLM model
# ---------------------------------------------------------------------------
info "Pulling llama3 model into Ollama (this may take several minutes on first run)..."
echo ""

if docker exec ollama ollama pull llama3; then
  ok "llama3 model pulled successfully."
else
  warn "Failed to pull llama3. You can retry manually:"
  warn "  docker exec ollama ollama pull llama3"
fi

# ---------------------------------------------------------------------------
# 7. Status summary
# ---------------------------------------------------------------------------
echo ""
echo "============================================================"
echo -e "${GREEN}  manin-ia Engine — Deployment Summary${NC}"
echo "============================================================"
echo ""

# Load domain from .env for display
DOMAIN=$(grep -E "^DOMAIN=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

echo "  Services:"
$COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || \
  $COMPOSE_CMD ps

echo ""
echo "  Endpoints (once DNS is configured):"
echo -e "    ${CYAN}n8n:${NC}     https://n8n.${DOMAIN:-<DOMAIN>}"
echo -e "    ${CYAN}Ollama:${NC}  https://ollama.${DOMAIN:-<DOMAIN>}"
echo ""
echo "  Useful commands:"
echo "    docker logs -f caddy     # Watch Caddy logs"
echo "    docker logs -f n8n       # Watch n8n logs"
echo "    docker logs -f ollama    # Watch Ollama logs"
echo "    docker exec ollama ollama list   # List installed models"
echo ""
echo -e "${YELLOW}  ⚠  Remember to configure DNS A records for your domain!${NC}"
echo "============================================================"
