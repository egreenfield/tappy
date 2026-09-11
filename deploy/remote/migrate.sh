#!/bin/bash
# Environment migrations for the Pi: like database migrations, but for the OS.
# Each deploy/remote/migrations/NNN-name.sh is run once, in order, as root; the names of
# applied migrations are recorded in /var/lib/tappy/migrations.applied. A migration must be
# idempotent (safe to re-run) and may `touch "$REBOOT_FLAG"` if its change needs a reboot.
#
#   migrate.sh            apply pending migrations
#   migrate.sh --status   list applied / pending
#   migrate.sh --rerun NNN-name.sh   run one migration again (e.g. after editing it)
set -euo pipefail
: "${TAPPY_DIR:?TAPPY_DIR must be set}"
export TAPPY_STATE="${TAPPY_STATE:-/var/lib/tappy}"
export TAPPY_VENV="${TAPPY_VENV:-$TAPPY_DIR/.venv}"
export TAPPY_USER="${TAPPY_USER:-$(stat -c %U "$TAPPY_DIR")}"
export REBOOT_FLAG="${REBOOT_FLAG:-/run/tappy-reboot-required}"
HERE="$(cd "$(dirname "$0")" && pwd)"
APPLIED="$TAPPY_STATE/migrations.applied"
mkdir -p "$TAPPY_STATE"; touch "$APPLIED"

run_one() {
    local m=$1 name; name=$(basename "$m")
    echo "[migrate] applying $name"
    if bash -euo pipefail "$m"; then
        grep -qx "$name" "$APPLIED" || echo "$name" >> "$APPLIED"
    else
        echo "[migrate] FAILED: $name (fix it and re-run; later migrations were not attempted)" >&2
        exit 1
    fi
}

case ${1:-} in
    --status)
        for m in "$HERE"/migrations/*.sh; do
            name=$(basename "$m")
            if grep -qx "$name" "$APPLIED"; then echo "  applied  $name"; else echo "  PENDING  $name"; fi
        done ;;
    --rerun)
        [ -f "$HERE/migrations/$2" ] || { echo "no such migration: $2" >&2; exit 1; }
        run_one "$HERE/migrations/$2" ;;
    "")
        pending=0
        for m in "$HERE"/migrations/*.sh; do
            grep -qx "$(basename "$m")" "$APPLIED" && continue
            run_one "$m"; pending=1
        done
        [ $pending = 1 ] || echo "[migrate] no pending migrations" ;;
    *) sed -n '2,10p' "$0"; exit 1 ;;
esac
