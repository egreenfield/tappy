# WiFi power save on the Pi Zero W (brcmfmac) drops multicast, which makes Sonos SSDP discovery
# fail intermittently, which is what took tappy down. The driver re-enables power save every time
# wlan0 associates, so it has to be switched off on every connection, not just once at boot.
IFACE=wlan0
if systemctl is-active -q NetworkManager; then
    # Raspberry Pi OS bookworm and later: NetworkManager applies this on every connect.
    mkdir -p /etc/NetworkManager/conf.d
    printf '[connection]\nwifi.powersave = 2\n' > /etc/NetworkManager/conf.d/tappy-wifi-powersave.conf
    nmcli general reload 2>/dev/null || true
    echo "  configured via NetworkManager"
else
    # buster/bullseye: dhcpcd sources /etc/dhcpcd.exit-hook on every interface event.
    hook=/etc/dhcpcd.exit-hook
    if ! grep -q 'tappy-wifi-powersave' "$hook" 2>/dev/null; then
        cat >> "$hook" <<'HOOK'
# tappy-wifi-powersave: keep wifi power save off (it drops multicast, breaking Sonos discovery)
if [ "$interface" = "wlan0" ] && [ "$if_up" = "true" ]; then
    if command -v iw >/dev/null 2>&1; then iw dev wlan0 set power_save off; else /sbin/iwconfig wlan0 power off; fi
fi
HOOK
    fi
    echo "  configured via dhcpcd exit hook"
fi
# Apply immediately too.
if command -v iw >/dev/null 2>&1; then iw dev $IFACE set power_save off; else /sbin/iwconfig $IFACE power off; fi
