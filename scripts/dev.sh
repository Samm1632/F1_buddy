#!/usr/bin/env bash
set -euo pipefail

# Run backend and frontend in parallel
(
	cd "$(dirname "$0")/../backend"
	npm run dev
) &

(
	cd "$(dirname "$0")/../frontend"
	npm run dev
) &

wait