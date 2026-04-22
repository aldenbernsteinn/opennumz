#!/bin/bash
set -euo pipefail
systemctl --user restart open-webui
echo "OpenNumz restarted. Check: systemctl --user status open-webui"
