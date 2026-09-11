#!/usr/bin/env bash
# Shared helpers for the client-side deploy scripts. Source this, don't run it.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$DEPLOY_DIR/.." && pwd)"
STATE_DIR_REMOTE=/var/lib/tappy

log()  { printf '\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mWARNING: %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

load_env() {
    [ -f "$DEPLOY_DIR/.env" ] || die "deploy/.env not found. Copy deploy/.env.sample to deploy/.env and fill it in."
    set -a; . "$DEPLOY_DIR/.env"; set +a
    : "${TAPPY_HOST:?TAPPY_HOST missing in deploy/.env}"
    : "${TAPPY_USER:?TAPPY_USER missing in deploy/.env}"
    : "${TAPPY_PASSWORD:?TAPPY_PASSWORD missing in deploy/.env}"
    TAPPY_DIR="${TAPPY_DIR:-/home/$TAPPY_USER/dev/tappy}"
    TARGET="$TAPPY_USER@$TAPPY_HOST"
    export TAPPY_PASSWORD
    SSH_OPTS=(-4 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR
              -o ConnectTimeout=10 -o PreferredAuthentications=password -o PubkeyAuthentication=no)
    if command -v sshpass >/dev/null 2>&1; then
        PASS_WRAPPER=(sshpass -e)
    elif command -v expect >/dev/null 2>&1; then
        PASS_WRAPPER=(expect "$DEPLOY_DIR/askpass.exp")
    else
        die "need either 'sshpass' or 'expect' on this machine"
    fi
    export SSHPASS="$TAPPY_PASSWORD"
}

# Run a shell command on the Pi. Output streams to the terminal.
remote() { "${PASS_WRAPPER[@]}" ssh "${SSH_OPTS[@]}" "$TARGET" -- "$@"; }
# Run a command on the Pi and return its stdout (CRs stripped, since expect uses a pty).
remote_capture() { remote "$@" 2>/dev/null | tr -d '\r' | sed '/^$/d'; }
# Copy a local file to the Pi.
push_file() { "${PASS_WRAPPER[@]}" scp "${SSH_OPTS[@]}" -q "$1" "$TARGET:$2"; }
# Copy a file from the Pi to local.
pull_file() { "${PASS_WRAPPER[@]}" scp "${SSH_OPTS[@]}" -q "$TARGET:$1" "$2"; }

preflight() {
    log "Checking connection to $TARGET"
    remote_capture 'echo ok' | grep -q '^ok$' || die "cannot ssh to $TARGET with the password in deploy/.env"
    remote_capture 'sudo -n true 2>/dev/null && echo sudo-ok' | grep -q sudo-ok \
        || die "$TAPPY_USER needs passwordless sudo on the Pi (Raspberry Pi OS grants this to the user created by the imager)"
}

# Wait until the Pi answers ssh again (after a reboot). $1 = timeout in seconds.
wait_for_pi() {
    local deadline=$(( $(date +%s) + ${1:-300} ))
    log "Waiting for $TAPPY_HOST to come back"
    sleep 15
    while [ "$(date +%s)" -lt "$deadline" ]; do
        if remote_capture 'echo ok' 2>/dev/null | grep -q '^ok$'; then echo; return 0; fi
        printf '.'; sleep 5
    done
    die "$TAPPY_HOST did not come back within ${1:-300}s"
}

# Files that get shipped to the Pi (tracked + untracked-but-not-ignored).
bundle_files() {
    ( cd "$REPO_DIR" && git ls-files -co --exclude-standard device deploy/remote ) \
        | grep -v -e '\.DS_Store' -e '__pycache__' -e '\.pyc$' \
        | while IFS= read -r f; do [ -f "$REPO_DIR/$f" ] && echo "$f"; done
}

# Hash of the shipped content, independent of commits, so update.sh can skip no-op pushes.
content_hash() {
    ( cd "$REPO_DIR" && bundle_files | sort | xargs git hash-object | shasum -a 256 | cut -c1-16 )
}

write_version_file() {
    ( cd "$REPO_DIR"
      echo "commit=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
      echo "describe=$(git describe --always --dirty --tags 2>/dev/null || echo unknown)"
      echo "branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
      echo "content_hash=$(content_hash)"
      echo "deployed_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
      echo "deployed_by=${USER:-unknown}@$(hostname -s)"
    )
}

# Build the tarball that gets pushed. $1 = output path, $2 = config.json to use as the default.
build_bundle() {
    local out=$1 cfg=$2 stage
    stage=$(mktemp -d)
    ( cd "$REPO_DIR" && bundle_files | COPYFILE_DISABLE=1 tar --no-xattrs -cf - -T - ) | tar -xf - -C "$stage"
    cp "$cfg" "$stage/deploy/remote/config.default.json"
    write_version_file > "$stage/VERSION"
    ( cd "$stage" && COPYFILE_DISABLE=1 tar --no-xattrs -czf "$out" . )
    rm -rf "$stage"
}

# Push the bundle and unpack it into $TAPPY_DIR (replaces device/ and deploy/, keeps everything else).
push_code() {
    local cfg=${1:-$REPO_DIR/config.json}
    local tgz; tgz=$(mktemp -t tappy-bundle).tgz
    log "Building bundle ($(content_hash))"
    build_bundle "$tgz" "$cfg"
    log "Pushing code to $TARGET:$TAPPY_DIR"
    push_file "$tgz" /tmp/tappy-bundle.tgz
    rm -f "$tgz"
    remote "set -e; mkdir -p '$TAPPY_DIR'; cd '$TAPPY_DIR';
            rm -rf device.prev deploy; [ -d device ] && mv device device.prev;
            tar -xzf /tmp/tappy-bundle.tgz && rm -f /tmp/tappy-bundle.tgz;
            find device -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null; true"
}

# Run the remote apply step (migrations, deps, service). Sets REBOOT_REQUIRED=1 if the Pi asked for one.
run_apply() {
    local mode=$1 out
    out=$(mktemp -t tappy-apply)
    log "Applying environment migrations and installing service ($mode)"
    remote "sudo bash '$TAPPY_DIR/deploy/remote/apply.sh' --user '$TAPPY_USER' --dir '$TAPPY_DIR' --mode $mode" | tee "$out"
    REBOOT_REQUIRED=0
    grep -q TAPPY_REBOOT_REQUIRED "$out" && REBOOT_REQUIRED=1
    rm -f "$out"
}

reboot_pi() {
    log "Rebooting $TAPPY_HOST"
    remote 'sudo systemctl reboot' >/dev/null 2>&1 || true
    wait_for_pi 300
}

verify() {
    log "Verifying"
    local active
    active=$(remote_capture 'systemctl is-active tappy.service' || true)
    echo "service:  ${active:-unknown}"
    echo "version:  $(remote_capture "grep -E '^(describe|deployed_at)=' $STATE_DIR_REMOTE/VERSION 2>/dev/null | paste -sd' ' -")"
    # A Pi Zero needs 10-30s after a restart to import the libraries and open port 8000.
    local i
    for i in $(seq 1 12); do
        if curl -4 -s -m 5 "http://$TAPPY_HOST:8000/api/card/last" >/dev/null; then
            echo "rest api: ok (http://$TAPPY_HOST:8000)"; break
        fi
        [ "$i" = 12 ] && warn "REST API on port 8000 did not answer within 60s" || sleep 5
    done
    [ "$active" = active ] || die "tappy.service is not running. See: journalctl -u tappy on the Pi, or ./deploy/status.sh"
}

backup_config() {
    mkdir -p "$DEPLOY_DIR/backups"
    local dest="$DEPLOY_DIR/backups/config-$TAPPY_HOST-$(date +%Y%m%d-%H%M%S).json"
    if remote_capture "test -f '$TAPPY_DIR/config.json' && echo yes" | grep -q yes; then
        pull_file "$TAPPY_DIR/config.json" "$dest"
        log "Backed up config.json to ${dest#$REPO_DIR/}"
        LAST_BACKUP=$dest
    else
        warn "no config.json on the Pi yet, nothing to back up"
        LAST_BACKUP=
    fi
}
