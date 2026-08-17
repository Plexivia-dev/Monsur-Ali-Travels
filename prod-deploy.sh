#!/bin/bash

# ==============================================================================
# Monsur Ali Travels ERP - Production Deploy Script
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/vps-setup.sh"
