# Keep journald logs across reboots (capped so the SD card does not fill), so a crash can be
# investigated after the box has been power-cycled.
mkdir -p /etc/systemd/journald.conf.d /var/log/journal
printf '[Journal]\nStorage=persistent\nSystemMaxUse=64M\n' > /etc/systemd/journald.conf.d/tappy.conf
systemd-tmpfiles --create --prefix /var/log/journal 2>/dev/null || true
systemctl restart systemd-journald
echo "  journald now persistent (max 64M)"
