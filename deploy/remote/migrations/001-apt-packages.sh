# System packages tappy needs. Hardware libraries come from apt rather than pip so nothing has to
# compile on a Pi Zero. Skips apt entirely when everything is already installed.
PKGS="python3 python3-venv python3-pip python3-rpi.gpio python3-spidev python3-lxml python3-requests
      iw wireless-tools curl raspi-config"
missing=""
for p in $PKGS; do dpkg-query -W -f='${Status}' "$p" 2>/dev/null | grep -q 'install ok installed' || missing="$missing $p"; done
if [ -z "$missing" ]; then echo "  all packages present"; exit 0; fi
echo "  installing:$missing"
export DEBIAN_FRONTEND=noninteractive
# Old releases (buster) have lost some of their repos; a partial update is still useful.
apt-get update -q || echo "  (apt-get update reported errors; trying the install anyway)"
apt-get install -y -q --no-install-recommends $missing
