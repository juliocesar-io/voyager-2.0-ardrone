#!/usr/bin/env python
import RPi.GPIO as GPIO
from time import sleep
import atexit

class Servo():

    def start(self):
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(14, GPIO.OUT)
        self.pwm = GPIO.PWM(14, 50)
        self.pwm.start(0)

    def set_angle(self, angle):
    	duty = angle / 18 + 2
    	GPIO.output(14, True)
    	self.pwm.ChangeDutyCycle(duty)
    	sleep(0.3)
    	GPIO.output(14, False)
    	self.pwm.ChangeDutyCycle(0)

    def stop(self):
        self.pwm.stop()
        GPIO.cleanup()

    def turn_180(self):
        while True:
            self.set_angle(0)
            self.set_angle(90)
            self.set_angle(180)
            self.set_angle(90)

s = Servo()
s.start()
s.turn_180()

def exit_handler():
    print 'Stoping servo!'
    s.stop()

atexit.register(exit_handler)
