#!/bin/bash
# Runs ON THE PI as root, after the code bundle has been unpacked into $TAPPY_DIR.
# It is the single entrypoint the client scripts call, and it is idempotent:
#   1. apply pending environment migrations (deploy/remote/migrations/NNN-*.sh)
#   2. create the default config.json if there is none
#   3. create the python venv and install requirements (only when requirements.txt changed)
#   4. install/refresh the systemd unit
#   5. record the deployed version, restart the service (or ask for a reboot)
set -euo pipefail

MODE=update
while [ $# -gt 0 ]; do
    case $1 in
        --user) TAPPY_USER=$2; shift 2 ;;
        --dir)  TAPPY_DIR=$2; shift 2 ;;
        --mode) MODE=$2; shift 2 ;;
        *) echo "apply.sh: unknown option $1" >&2; exit 2 ;;
    esac
done
: "${TAPPY_USER:?--user required}" "${TAPPY_DIR:?--dir required}"
[ "$(id -u)" = 0 ] || { echo "apply.sh must run as root" >&2; exit 2; }

export TAPPY_USER TAPPY_DIR
export TAPPY_STATE=/var/lib/tappy
export TAPPY_VENV="$TAPPY_DIR/.venv"
export REBOOT_FLAG=/run/tappy-reboot-required
HERE="$(cd "$(dirname "$0")" && pwd)"
log() { echo "[apply] $*"; }

mkdir -p "$TAPPY_STATE"
chown -R "$TAPPY_USER:" "$TAPPY_DIR"

# 1. migrations
bash "$HERE/migrate.sh"

# 2. default config (never overwrite: config.json is the live card database)
if [ ! -f "$TAPPY_DIR/config.json" ]; then
    log "no config.json on this box; installing the default one"
    install -o "$TAPPY_USER" -m 644 "$HERE/config.default.json" "$TAPPY_DIR/config.json"
fi

# 3. venv + python deps
if [ ! -x "$TAPPY_VENV/bin/python" ]; then
    log "creating venv at $TAPPY_VENV"
    sudo -u "$TAPPY_USER" python3 -m venv --system-site-packages "$TAPPY_VENV"
    rm -f "$TAPPY_STATE/requirements.sha"
fi
REQ="$TAPPY_DIR/device/requirements.txt"
req_hash=$(sha256sum "$REQ" | cut -c1-16)
if [ "$(cat "$TAPPY_STATE/requirements.sha" 2>/dev/null)" != "$req_hash" ]; then
    log "installing python requirements (this takes a few minutes on a Pi Zero)"
    sudo -u "$TAPPY_USER" "$TAPPY_VENV/bin/pip" install --prefer-binary -r "$REQ"
    echo "$req_hash" > "$TAPPY_STATE/requirements.sha"
else
    log "python requirements unchanged"
fi
"$TAPPY_VENV/bin/python" -c "import mfrc522, soco, falcon, werkzeug, RPi.GPIO" \
    || { echo "[apply] python imports failed in $TAPPY_VENV" >&2; exit 1; }

# 4. systemd unit
UNIT=/etc/systemd/system/tappy.service
sed -e "s|__TAPPY_DIR__|$TAPPY_DIR|g" -e "s|__TAPPY_VENV__|$TAPPY_VENV|g" \
    "$HERE/tappy.service.template" > /tmp/tappy.service.new
if ! cmp -s /tmp/tappy.service.new "$UNIT"; then
    log "installing systemd unit $UNIT"
    install -m 644 /tmp/tappy.service.new "$UNIT"
    rm -f /lib/systemd/system/tappy.service      # legacy location from the old hand install
    systemctl daemon-reload
fi
rm -f /tmp/tappy.service.new
systemctl enable -q tappy.service

# 5. version + restart
cp "$TAPPY_DIR/VERSION" "$TAPPY_STATE/VERSION"
if [ -f "$REBOOT_FLAG" ]; then
    log "a migration requires a reboot before the service can run"
    echo "TAPPY_REBOOT_REQUIRED"
    exit 0
fi
log "restarting tappy.service"
systemctl restart tappy.service
sleep 3
if systemctl is-active -q tappy.service; then
    log "tappy.service is running ($(sed -n 's/^describe=//p' "$TAPPY_STATE/VERSION"))"
else
    echo "[apply] tappy.service failed to start:" >&2
    journalctl -u tappy -n 30 --no-pager >&2
    exit 1
fi
