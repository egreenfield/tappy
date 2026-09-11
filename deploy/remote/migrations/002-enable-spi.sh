# The MFRC522 card reader talks over SPI, which is off by default on Raspberry Pi OS.
if [ -e /dev/spidev0.0 ]; then echo "  SPI already enabled"; exit 0; fi
if command -v raspi-config >/dev/null 2>&1; then
    raspi-config nonint do_spi 0
else
    cfg=/boot/firmware/config.txt; [ -f "$cfg" ] || cfg=/boot/config.txt
    grep -q '^dtparam=spi=on' "$cfg" || echo 'dtparam=spi=on' >> "$cfg"
fi
if [ ! -e /dev/spidev0.0 ]; then
    echo "  SPI enabled in config; reboot needed for /dev/spidev0.0 to appear"
    touch "$REBOOT_FLAG"
fi
