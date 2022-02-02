
import RPi.GPIO as GPIO
import time
buzzer = 26
GPIO.setmode(GPIO.BCM)
GPIO.setup(buzzer, GPIO.OUT)
GPIO.output(buzzer, GPIO.HIGH)

for i in range(1,3):
    GPIO.output(buzzer, GPIO.LOW)
    time.sleep(0.01)
    GPIO.output(buzzer, GPIO.HIGH)
    time.sleep(0.01)

