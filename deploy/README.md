# Deploying tappy to the Pi

Everything here runs from your computer over ssh; nothing has to be typed on the Pi.

## One-time client setup

    cp deploy/.env.sample deploy/.env      # then edit: host, user, password
    brew install hudochenkov/sshpass/sshpass   # optional; without it the scripts use `expect`, which macOS has

`deploy/.env` and `deploy/backups/` are git-ignored.

## Fresh Raspberry Pi

1. Flash Raspberry Pi OS (Lite is fine) with Raspberry Pi Imager. In its settings set the hostname
   (e.g. `musicbox`), enable ssh with a password, and enter the wifi credentials.
2. Boot the Pi with the MFRC522 reader wired up, wait until `ping musicbox.local` answers.
3. `./deploy/install.sh`, or `./deploy/install.sh --config deploy/backups/config-....json` to start
   from a backed-up card database instead of the repo's `config.json`.

The script installs packages, enables SPI (rebooting if needed), creates a python venv, installs the
systemd service, and starts it. Re-running it is harmless; an existing `config.json` on the Pi is
always kept.

## Pushing new code

    ./deploy/update.sh

Backs up the Pi's `config.json` to `deploy/backups/`, pushes `device/` and `deploy/remote/` from
your working tree (uncommitted changes included), applies any new environment migrations, restarts
the service, and checks that it came up. It skips the push when the Pi already has identical code.

    ./deploy/status.sh            # version on the Pi vs. local, service health, pending migrations
    ./deploy/status.sh --logs     # ...plus recent log lines
    ./deploy/status.sh --follow   # live log
    ./deploy/backup.sh            # just back up config.json
    ./deploy/backup.sh --restore deploy/backups/config-....json

## Environment migrations

System-level changes (packages, kernel overlays, network settings, journald...) live in
`deploy/remote/migrations/NNN-name.sh` and work like database migrations for the OS: each runs
once, in order, as root, and the Pi remembers which ones ran in `/var/lib/tappy/migrations.applied`.
To change the system, add a new numbered script rather than editing an old one, and keep it
idempotent. `touch "$REBOOT_FLAG"` inside a migration tells `update.sh`/`install.sh` to reboot the
Pi before starting the service. Available variables: `TAPPY_DIR`, `TAPPY_USER`, `TAPPY_VENV`,
`TAPPY_STATE`, `REBOOT_FLAG`.

Things that must be applied on every deploy rather than once (python requirements, the systemd
unit) are handled by `deploy/remote/apply.sh` and only re-run when their inputs change.

## What is where on the Pi

| path | purpose |
|---|---|
| `/home/<user>/dev/tappy/device` | the running code (`device.prev` is the previous deploy) |
| `/home/<user>/dev/tappy/config.json` | live card/bookmark database; never overwritten by deploys |
| `/home/<user>/dev/tappy/.venv` | python environment |
| `/var/lib/tappy/VERSION` | commit, content hash and timestamp of what is deployed |
| `/var/lib/tappy/migrations.applied` | migration ledger |
| `/etc/systemd/system/tappy.service` | service (generated from `deploy/remote/tappy.service.template`) |

Logs: `sudo journalctl -u tappy` on the Pi (persistent across reboots after migration 004).
