#!/usr/bin/env bash
set -euo pipefail

# Build frontend
cd "$(dirname "$0")/../frontend"
npm run build

# Start backend (serves frontend dist when NODE_ENV=production)
cd ../backend
NODE_ENV=production PORT=${PORT:-3001} node src/server.js