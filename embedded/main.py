# Group number: 24
# Student Names: Divy Patel, Elio Di Nino, Kelvin Wong, Matthew Chow

# if looking at pico from birds eye witht the usb pointing forward
# gyro x is pitch / front back
# gyro y is roll / side to side
# gyro z is yaw / clock counter clock

import sys # clear console

import time
import board
from digitalio import DigitalInOut, Direction, Pull

import busio
from adafruit_lsm6ds.lsm6ds33 import LSM6DS33

btn = DigitalInOut(board.GP28)
btn.direction = Direction.INPUT
btn.pull = Pull.DOWN

#  Onboard LED setup
led = DigitalInOut(board.LED)
led.direction = Direction.OUTPUT
led.value = True

i2c = busio.I2C(scl=board.GP1, sda=board.GP0)
sensor = LSM6DS33(i2c)

while True:

    # \x1b[2J clear the screen
    # \x1b[0;0H move the cursor to the top left corner
    sys.stderr.write("\x1b[2J\x1b[0;0H")

    led.value = btn.value

    print("Acceleration (m/s^2)")
    print("------------------------\n")
    print("X:\t%6.1f\n" % (sensor.acceleration[0]))
    print("Y:\t%6.1f\n" % (sensor.acceleration[1]))
    print("Z:\t%6.1f\n" % (sensor.acceleration[2]))
    print()
    print("Gyro (rad/s)")
    print("------------------------\n")
    print("X:\t%6.1f\n" % (sensor.gyro[0]))
    print("Y:\t%6.1f\n" % (sensor.gyro[1]))
    print("Z:\t%6.1f\n" % (sensor.gyro[2]))

    time.sleep(0.05)