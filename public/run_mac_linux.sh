#!/usr/bin/env bash
# ==============================================================================
# NanAuracle v8.0 - ZnO-GNP Heterojunction 3D Digital Twin Runner (macOS / Linux)
# Intel ISEF 2026 Research Suite | Tuguegarao City Science High School
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=============================================================================="
echo "  NanAuracle v8.0: ZnO-GNP Heterojunction Atomistic Digital Twin"
echo "  Intel ISEF 2026 Research Suite | Tuguegarao City Science High School"
echo "=============================================================================="
echo ""

# Helper to open browser cross-platform
open_browser() {
    local url="$1"
    if which xdg-open > /dev/null; then
        xdg-open "$url" &
    elif which open > /dev/null; then
        open "$url" &
    fi
}

echo "[1/3] Detecting execution runtime..."

# Try Python 3
if command -v python3 &>/dev/null; then
    echo "[2/3] Python 3 detected! Launching WebGL server on http://localhost:3000..."
    (sleep 1 && open_browser "http://localhost:3000") &
    python3 -m http.server 3000
    exit 0
fi

# Try Python 2
if command -v python &>/dev/null; then
    echo "[2/3] Python detected! Launching WebGL server on http://localhost:3000..."
    (sleep 1 && open_browser "http://localhost:3000") &
    python -m SimpleHTTPServer 3000
    exit 0
fi

# Try Node / npx
if command -v npx &>/dev/null; then
    echo "[2/3] Node/npx detected! Launching local server on http://localhost:3000..."
    (sleep 1 && open_browser "http://localhost:3000") &
    npx serve -l 3000 .
    exit 0
fi

# Fallback: open HTML directly
echo "[2/3] Standalone mode: Opening self-contained 3D Digital Twin HTML directly..."
if [ -f "$DIR/NanAuracle_Complete_Suite.html" ]; then
    open_browser "$DIR/NanAuracle_Complete_Suite.html"
elif [ -f "$DIR/index.html" ]; then
    open_browser "$DIR/index.html"
else
    echo "[!] Could not locate NanAuracle_Complete_Suite.html"
fi
