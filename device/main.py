#!/usr/bin/env python
# -*- coding: utf8 -*-

import signal
import faulthandler
import logging
log = logging.getLogger(__name__)
from tappy import Tappy

logging.basicConfig( level=logging.INFO)


tappy = Tappy()

# Capture SIGINT for cleanup when the script is aborted
def end_read(signal,frame):
    global tappy
    log.info ("Ctrl+C shutting down.")
    tappy.stop()

# Hook the SIGINT
signal.signal(signal.SIGINT, end_read)
signal.signal(signal.SIGTERM, end_read)
# `kill -USR1 <pid>` dumps every thread's Python stack to the log, for diagnosing a hang.
faulthandler.register(signal.SIGUSR1, all_threads=True)
log.info ("Press Ctrl-C to stop.")
tappy.start()
