# Group number: 24
# Student Names: Divy Patel, Elio Di Nino, Kelvin Wong, Matthew Chow


'''
                             USB
                         +----------+                        
                         |    +Y    |                        
                         |          | Button: Start Recording
                         |          |                        
                         |          | Button: Stop Recording 
                         |          |                        
                         | -X    +X |                        
                         |          |                        
                         |          |                        
 LED: READY TO RECORD    |          | LED: Sequence Status   
                         |          |                        
      LED: RECORDING     |          |                        
                         |          |                        
                         |    -Y    |                        
                         +----------+     

'''

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

# Push button start stop
start_btn = DigitalInOut(board.GP28)    # upper
start_btn.direction = Direction.INPUT
start_btn.pull = Pull.DOWN

stop_btn = DigitalInOut(board.GP22)     # lower
stop_btn.direction = Direction.INPUT
stop_btn.pull = Pull.DOWN

# Status LED setup
ready_led = DigitalInOut(board.GP12)       # left upper
ready_led.direction = Direction.OUTPUT

recording_led = DigitalInOut(board.GP11)   # left lower
recording_led.direction = Direction.OUTPUT

correct_led = DigitalInOut(board.GP16)    # bottom right
correct_led.direction = Direction.OUTPUT


#  Onboard LED setup
onboard_led = DigitalInOut(board.LED)
onboard_led.direction = Direction.OUTPUT

i2c = busio.I2C(scl=board.GP1, sda=board.GP0)
sensor = LSM6DS33(i2c)

def print_all_imu():
    # \x1b[2J clear the screen
    # \x1b[0;0H move the cursor to the top left corner
    sys.stderr.write("\x1b[2J\x1b[0;0H")
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

# First boot code to run
init = False
def init_hardware():
    global init
    ready_led.value = True
    recording_led.value = True
    correct_led.value = True
    onboard_led.value = True
    time.sleep(0.3)
    ready_led.value = False
    recording_led.value = False
    correct_led.value = False
    onboard_led.value = False
    time.sleep(0.1)
    
    init = True

def sequence_correct_led():
    for i in range(5):
        correct_led.value = True    
        time.sleep(0.1)
        correct_led.value = False
        time.sleep(0.1)
    
    # Reset the correct LED after blinking
    correct_led.value = False

# Return a list of all the valid moves that happened in the sequence
def check_sequence(sequence):
    valid_moves = []

    # Check that the imu was flipped over at some point
    for z in sequence["AZ"]:
        if z < 0:
            valid_moves.append("Z FLIP")
            break

    # X motion forward first
    for x in sequence["AX"]:
        # if see a negative acceleration motion first, not +X motion
        if x < -15:
            break
        elif x > 15:
            valid_moves.append("+X TRAVEL")
            break

    # Check for forward movement (at least 1 second)
    # This would mean 10 occurances in a row of +Y acceleration (since 0.1s delay in main)
    for y in sequence["AY"]:
        # if see a negative acceleration motion first, not +Y motion
        if y < -15:
            break
        elif y > 15:
            valid_moves.append("+Y TRAVEL")
            break

    # Z
    for z in sequence["AZ"]:
        # if see a negative acceleration motion first, not +Z motion
        if z < -15:
            break
        elif z > 15:
            valid_moves.append("+Z TRAVEL")
            break

    return valid_moves





# Sequence variable
sequence = {"AX" : [],
            "AY" : [],
            "AZ" : [],
            "GX" : [],
            "GY" : [],
            "GZ" : [],
            }

while True:
    if not init:
        init_hardware()
        init_hardware()
        init_hardware()
        print("Started Program")

        # Initial state
        ready_led.value = True
        recording_led.value = False
        is_recording = False

    # Update states for stop/start buttons
    if start_btn.value and not is_recording:
        is_recording = True
        ready_led.value = False
        recording_led.value = True
    elif stop_btn.value and is_recording:
        is_recording = False
        ready_led.value = True
        recording_led.value = False

        # Validate move
        valid_moves = check_sequence(sequence)
        for move in valid_moves:
            if move == "Z FLIP":
                sequence_correct_led()
                print(move)
            if move == "+X TRAVEL":
                sequence_correct_led()
                print(move)
            if move == "+Y TRAVEL":
                sequence_correct_led()
                print(move)
            if move == "+Z TRAVEL":
                sequence_correct_led()
                print(move)

        # will flood serial print if too long of a sequence
        # print(sequence["AY"]) # for debugging check recording of AZ
        
        # Reset the sequence for next recording    
        sequence = {"AX" : [],
            "AY" : [],
            "AZ" : [],
            "GX" : [],
            "GY" : [],
            "GZ" : [],
            }
         

    # Recording
    if (is_recording):
        sequence["AX"].append(round(sensor.acceleration[0], 1))
        sequence["AY"].append(round(sensor.acceleration[1], 1))
        sequence["AZ"].append(round(sensor.acceleration[2], 1))
        sequence["GX"].append(round(sensor.gyro[0], 1))
        sequence["GY"].append(round(sensor.gyro[1], 1))
        sequence["GZ"].append(round(sensor.gyro[2], 1))
        
        print((sensor.acceleration[0], sensor.acceleration[1], sensor.acceleration[2], 15, -15))
        # print((sensor.acceleration[1], 15, -15))

    time.sleep(0.1)

    # print as tuple for the plotter
    # AX: Green
    # AY: Blue
    # AZ: Orange
    # print((sensor.acceleration[0], sensor.acceleration[1], sensor.acceleration[2]))
    # print((sensor.gyro[0], sensor.gyro[1], sensor.gyro[2]))

    # print_all_imu()





    '''
    Notes on IMU data

    Fast movement is +/- 20    (m/s^2)

    There is speed up and slow down
    - Identify which came first
    
    
    '''
