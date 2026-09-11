#!/usr/bin/env bash
# Show what is running on the Pi: version vs. local, service state, pending migrations, health.
#
#   ./deploy/status.sh          # snapshot
#   ./deploy/status.sh --logs   # snapshot plus the last 40 service log lines
#   ./deploy/status.sh --follow # tail the service log live (Ctrl-C to stop)
. "$(dirname "$0")/lib.sh"
load_env

case ${1:-} in
    --follow) exec remote "sudo journalctl -u tappy -n 40 -f" ;;
    --logs) LOGS=40 ;;
    "") LOGS=0 ;;
    *) sed -n '2,6p' "$0"; exit 0 ;;
esac

echo "local:   $(write_version_file | grep -E '^(describe|content_hash)=' | paste -sd' ' -)"
remote "
if [ -f $STATE_DIR_REMOTE/VERSION ]; then echo \"remote:  \$(grep -E '^(describe|content_hash|deployed_at)=' $STATE_DIR_REMOTE/VERSION | paste -sd' ' -)\"; else echo 'remote:  not installed with the deploy scripts yet'; fi
echo \"host:    \$(cat /proc/device-tree/model 2>/dev/null | tr -d '\\0'), \$(uptime | sed 's/.*up /up /')\"
echo \"service: \$(systemctl is-active tappy.service 2>/dev/null) (\$(systemctl show tappy -p NRestarts --value 2>/dev/null) restarts since boot)\"
echo \"wifi ps: \$(sudo /sbin/iwconfig wlan0 2>/dev/null | sed -n 's/.*Power Management:\\([a-z]*\\).*/\\1/p')  temp: \$(vcgencmd measure_temp 2>/dev/null | cut -d= -f2)\"
echo \"sonos:   \$(curl -s -m 8 http://localhost:8000/api/speakers | python3 -c 'import sys,json; d=json.load(sys.stdin); print(len(d[\"speakers\"]), \"visible, active:\", d[\"active\"])' 2>/dev/null || echo 'REST API not answering')\"
if [ -f '$TAPPY_DIR/deploy/remote/migrate.sh' ]; then sudo TAPPY_DIR='$TAPPY_DIR' bash '$TAPPY_DIR/deploy/remote/migrate.sh' --status; fi
if [ $LOGS -gt 0 ]; then echo '--- last $LOGS log lines'; sudo journalctl -u tappy -n $LOGS --no-pager -o short; fi
"
