#!/bin/bash
# No auth on ttyd — access gated by PIN screen on :3000/code
# Only reachable via Tailscale (your own devices)
exec /usr/bin/ttyd \
  --port 3001 \
  --interface 100.103.233.31 \
  --writable \
  /usr/local/bin/numz
