#!/usr/bin/env bash
# Set up tappy on a fresh Raspberry Pi (Raspberry Pi OS with ssh enabled and wifi configured).
#
#   ./deploy/install.sh                     # uses the repo's config.json as the initial card database
#   ./deploy/install.sh --config backup.json  # ...or restore a backup from deploy/backups/
#
# Idempotent: safe to re-run on a box that is already set up.
. "$(dirname "$0")/lib.sh"

CONFIG="$REPO_DIR/config.json"
while [ $# -gt 0 ]; do
    case $1 in
        --config) CONFIG=$2; shift 2 ;;
        -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
        *) die "unknown option $1" ;;
    esac
done
[ -f "$CONFIG" ] || die "config file not found: $CONFIG"

load_env
preflight

if remote_capture "test -f '$TAPPY_DIR/config.json' && echo yes" | grep -q yes; then
    warn "$TAPPY_DIR/config.json already exists on the Pi; it will be kept (existing card data wins over --config)"
    backup_config
fi

push_code "$CONFIG"
run_apply install
if [ "$REBOOT_REQUIRED" = 1 ]; then
    reboot_pi
    run_apply install      # finish anything that needed the reboot (e.g. SPI device present)
fi
verify
log "Install complete. Try ./deploy/status.sh"
