#!/usr/bin/env bash
# Back up (or restore) the Pi's config.json, which is the live card/bookmark database.
#
#   ./deploy/backup.sh                    # -> deploy/backups/config-<host>-<timestamp>.json
#   ./deploy/backup.sh --restore FILE     # push FILE to the Pi as config.json and restart the service
. "$(dirname "$0")/lib.sh"
load_env

case ${1:-} in
    "") backup_config ;;
    --restore)
        [ -f "${2:-}" ] || die "usage: backup.sh --restore FILE"
        python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$2" || die "$2 is not valid JSON"
        backup_config
        push_file "$2" /tmp/tappy-config.json
        remote "sudo systemctl stop tappy; cp /tmp/tappy-config.json '$TAPPY_DIR/config.json'; rm -f /tmp/tappy-config.json; sudo systemctl start tappy"
        log "Restored $2 and restarted the service" ;;
    *) sed -n '2,6p' "$0"; exit 0 ;;
esac
