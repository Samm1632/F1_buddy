#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

cd frontend
npm install
npm run build

cd ../backend
npm install
NODE_ENV=production PORT=${PORT:-3001} node src/server.js