#!/bin/bash
# MCP Server startup script

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

DIST_SERVER_JS="$PROJECT_ROOT/dist/server.js"
SRC_SERVER_TS="$PROJECT_ROOT/src/server.ts"

# Check if we have a built version
if [ -f "$DIST_SERVER_JS" ]; then
  exec node "$DIST_SERVER_JS"
else
  # Try to run with tsx for development
  if ! command -v tsx &> /dev/null && ! [ -f "$PROJECT_ROOT/node_modules/.bin/tsx" ]; then
    echo "tsx not found. Installing..." >&2
    (cd "$PROJECT_ROOT" && npm install tsx --no-save)
    if ! [ -f "$PROJECT_ROOT/node_modules/.bin/tsx" ]; then
        echo "ERROR: Failed to install tsx. Please install it manually or build the project." >&2
        exit 1
    fi
  fi
  
  TSX_PATH="$PROJECT_ROOT/node_modules/.bin/tsx"
  if ! command -v tsx &> /dev/null; then
      if [ ! -f "$TSX_PATH" ]; then
          echo "ERROR: tsx not found. Cannot run from source." >&2
          exit 1
      fi
      exec "$TSX_PATH" "$SRC_SERVER_TS"
  else
      exec tsx "$SRC_SERVER_TS"
  fi
fi 