#!/usr/bin/env bash
# Push the current working tree's device code to the Pi, apply any pending environment
# migrations, and restart the service. Backs up the Pi's config.json first.
#
#   ./deploy/update.sh            # skips the push if the code on the Pi is already identical
#   ./deploy/update.sh --force    # push anyway
#   ./deploy/update.sh --no-reboot   # if a migration needs a reboot, leave it to you
. "$(dirname "$0")/lib.sh"

FORCE=0; AUTO_REBOOT=1
while [ $# -gt 0 ]; do
    case $1 in
        --force) FORCE=1; shift ;;
        --no-reboot) AUTO_REBOOT=0; shift ;;
        -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
        *) die "unknown option $1" ;;
    esac
done

load_env
preflight

remote_capture "test -f '$TAPPY_DIR/deploy/remote/apply.sh' && echo yes" | grep -q yes \
    || die "$TAPPY_HOST has not been set up with these scripts yet. Run ./deploy/install.sh first."

backup_config

local_hash=$(content_hash)
remote_hash=$(remote_capture "sed -n 's/^content_hash=//p' $STATE_DIR_REMOTE/VERSION 2>/dev/null" || true)
if [ "$FORCE" = 0 ] && [ "$local_hash" = "$remote_hash" ]; then
    log "Code on the Pi already matches ($local_hash); skipping push (use --force to push anyway)"
else
    push_code
fi

run_apply update
if [ "$REBOOT_REQUIRED" = 1 ]; then
    if [ "$AUTO_REBOOT" = 1 ]; then
        reboot_pi
        run_apply update
    else
        warn "a migration needs a reboot; the service was not restarted. Reboot the Pi when convenient."
        exit 0
    fi
fi
verify
