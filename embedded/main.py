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

import os
import ssl
import wifi
import socketpool
import adafruit_requests


# --------------------------------------------------------------------------------------------------------------------------------------------
# INIT
# --------------------------------------------------------------------------------------------------------------------------------------------

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


# Global parameters
sensitivity = 18
buffer_offset = 5 # there are typically 3 elements of feedback 
                  # for example forward move is [20, -20, -18, -12, -4, 0, 0, 0]
z_offset = 10 # don't use z_offset on raw data (flip z needs to be not around 0 to detect flips as the sign of the number)

# --------------------------------------------------------------------------------------------------------------------------------------------
# ADDITIONAL FUNCTIONS
# --------------------------------------------------------------------------------------------------------------------------------------------

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
    for i in range(3):
        ready_led.value = True
        recording_led.value = True
        correct_led.value = True
        onboard_led.value = True
        time.sleep(0.1)
        ready_led.value = False
        recording_led.value = False
        correct_led.value = False
        onboard_led.value = False
        time.sleep(0.1)
    
    init = True



def sequence_correct_led():
    for i in range(5):
        correct_led.value = True    
        time.sleep(0.05)
        correct_led.value = False
        time.sleep(0.05)
    
    # Reset the correct LED after blinking
    correct_led.value = False

def sign(num):
    return num / abs(num)

# --------------------------------------------------------------------------------------------------------------------------------------------
# IMU DATA PARSING -> SEQUENCE
# --------------------------------------------------------------------------------------------------------------------------------------------

# Return a list of all the valid moves that happened in the sequence
# Note sequence is a dict of <string, list> where all lists are the same length
def check_sequence(sequence):
    buffer = 0


    # List of pairs (index, move)
    valid_moves_indexed = []

    # Check that the imu was flipped over at some 
    started_up = False

    for i, z in enumerate(sequence["AZ"]):

        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1

        if buffer == 0:
            if z >= 0:
                started_up = True
            elif z < 0 and started_up:
                # To avoid noise, check that neighbouring values are also negative (for sure flipped for a period of time)
                if (i + 1) < (len(sequence["AZ"]) - 1) and (i - 1) > 0:
                    flip = True
                    # If the IMU is rotated up in the neighbouring data, ignore the data
                    for j in range(i - 1, i + 1 + 1):
                        if sequence["AZ"][j] > 0:
                            flip = False
                    if flip == True:
                        valid_moves_indexed.append(("FLIP", i))
                        buffer = buffer + buffer_offset
                        started_up = False

    # X: check move forward and ignore move backward
    # To deal with inverse acceleration feedback, add a buffer whenever the IMU is moved backward
    # For example, moving backward will spike -sensitivitym/s^2 back then sensitivitym/s^2 forward withing a short period after
    # We need to ignore that sensitivitym/s^2 signal since it will detect as forward motion (when really we moved the IMU backward)
    # We achieve this by ignoring the following elements after a negative motion
    for i, x in enumerate(sequence["AX"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1

        if buffer == 0:
            # sensitivity of a false signal is lower than a correct signal
            # this is because we want to ignore more noise even if that means missing some correct signals
            # for debugging, it's easier to have a small amount of correct signals
            # than having many all the correct signals and a lot of bad signals
            if x < (-1 * sensitivity) / 2:
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif x > sensitivity :
                valid_moves_indexed.append(("RIGHT", i))
                buffer = buffer + buffer_offset
                started_up = False

    # Y
    for i, y in enumerate(sequence["AY"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1
        
        if buffer == 0:
            if y < (-1 * sensitivity) / 2:
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif y > sensitivity:
                valid_moves_indexed.append(("FORWARD", i))
                buffer = buffer + buffer_offset

    # Z
    for i, z in enumerate(sequence["AZ"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1

        # Note: z axis offsetting requires 2 cases
        # if z > 0 then SUBTRACT 9.8m/s^s
        # if z < 0 then ADD 9.8m/s^s
        if buffer == 0:
            # if see a negative acceleration motion first, not +Z motion
            if z - sign(z) * z_offset < (-1 * sensitivity) / 2:
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif z - sign(z) * z_offset > sensitivity:
                valid_moves_indexed.append(("UP", i))
                buffer = buffer + buffer_offset

    # -X
    for i, x in enumerate(sequence["AX"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1

        if buffer == 0:
            if x > sensitivity / 2:
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif x < -1 * sensitivity :
                valid_moves_indexed.append(("LEFT", i))
                buffer = buffer + buffer_offset

    # -Y
    for i, y in enumerate(sequence["AY"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1
        
        if buffer == 0:
            if y > sensitivity / 2:
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif y < -1 * sensitivity - 2:  # manually increase by 2 because -Y seems to be sensitive
                valid_moves_indexed.append(("BACKWARD", i))
                buffer = buffer + buffer_offset

    # -Z
    for i, z in enumerate(sequence["AZ"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1

        if buffer == 0:
            # if see a negative acceleration motion first, not +Z motion
            if (z - sign(z) * z_offset) > (sensitivity / 2):
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif (z - sign(z) * z_offset) < (-1 * sensitivity):
                valid_moves_indexed.append(("DOWN", i))  
                buffer = buffer + buffer_offset

    # --------------------------------------------------------------------------------------------------------------------------------------------
    # SEQUENCE PROCESSING
    # --------------------------------------------------------------------------------------------------------------------------------------------

    # Processing sequence
    # Sort based on time -> filter moves caused by feedback -> put in list of moves

    # Sort the valid moves based on index (which is time in 0.1s) ----------------------------------------------------------
    print("unsorted:", valid_moves_indexed, "\n\n")
    valid_moves_indexed.sort(key = lambda x: x[1])
    print("sorted", valid_moves_indexed, "\n\n")

    # We now have to filter the overlapping moves that shouldn't exist
    # This depends on a precedence
    # For example, FLIP can also triggers other moves if the flip is aggressive
    # We do this be removing any neighbouring moves that occured within +/-0.3ms of the flip
    tolerance = 4

    # Note the filters occur in order based on precedence
    # Flip, up/down, left/right (these compound)

    # Filter so that flip takes precedence over all moves ----------------------------------------------------------
    print("flip filter begin")
    flip_occurence_indices = []
    for pair in valid_moves_indexed:
        if pair[0] == "FLIP":
            flip_occurence_indices.append(pair[1])

    # print("flip indices", flip_occurence_indices)

    # Remove moves from list based on filter
    for index in flip_occurence_indices:
        for move_index, pair in enumerate(valid_moves_indexed):
            # first condition checks if move is within tolerance * 0.1ms of the flip
            if abs(pair[1] - index) < tolerance  and pair[0] != "FLIP":
                # print("try to remove", pair, "at move index", move_index)
                print("removing", pair)
                del valid_moves_indexed[move_index]

    print("flip filtered:", valid_moves_indexed, "\n\n")


    # Filter so that up down takes precedence over other moves ----------------------------------------------------------
    print("up/down filter begin")
    up_down_occurence_indices = []
    for pair in valid_moves_indexed:
        if pair[0] == "UP" or pair[0] == "DOWN":
            up_down_occurence_indices.append(pair[1])

    # print("flip indices", flip_occurence_indices)

    # Remove moves from list based on filter
    for index in up_down_occurence_indices:
        for move_index, pair in enumerate(valid_moves_indexed):
            # first condition checks if move is within tolerance * 0.1ms of the flip
            if abs(pair[1] - index) < tolerance  and pair[0] != "UP" and pair[0] != "DOWN":
                # print("try to remove", pair, "at move index", move_index)
                print("removing", pair)
                del valid_moves_indexed[move_index]

    print("up/down filtered:", valid_moves_indexed, "\n\n")

    # Filter so that left right takes precedence over front back (more coupled baesd on analysis of data) -----------------------------------
    print("left/right filter begin")
    left_right_occurence_indices = []
    for pair in valid_moves_indexed:
        if pair[0] == "LEFT" or pair[0] == "RIGHT":
            left_right_occurence_indices.append(pair[1])

    # print("flip indices", flip_occurence_indices)

    # Remove moves from list based on filter
    for index in left_right_occurence_indices:
        for move_index, pair in enumerate(valid_moves_indexed):
            # first condition checks if move is within tolerance * 0.1ms of the flip
            if abs(pair[1] - index) < tolerance  and pair[0] != "LEFT" and pair[0] != "RIGHT":
                # print("try to remove", pair, "at move index", move_index)
                print("removing", pair)
                del valid_moves_indexed[move_index]

    print("left/right filtered:", valid_moves_indexed, "\n\n")



    sorted_moves = []
    for move in valid_moves_indexed:
        sorted_moves.append(move[0])

    print("final sequence:", sorted_moves)
    print()

    return sorted_moves


# --------------------------------------------------------------------------------------------------------------------------------------------
# Wireless Functions
# --------------------------------------------------------------------------------------------------------------------------------------------

def init_wifi():
    # Wifi setup
    wifi.radio.connect(
        os.getenv("CIRCUITPY_WIFI_SSID"), os.getenv("CIRCUITPY_WIFI_PASSWORD")
    )
    pool = socketpool.SocketPool(wifi.radio)
    requests = adafruit_requests.Session(pool, ssl.create_default_context())

def request_pico_id():
    return "PICO_XX_AA_123"

# --------------------------------------------------------------------------------------------------------------------------------------------
# MAIN LOGIC
# --------------------------------------------------------------------------------------------------------------------------------------------

# Sequence variable
sequence = {"AX" : [],
            "AY" : [],
            "AZ" : [],
            "GX" : [],
            "GY" : [],
            "GZ" : [],
            }

final_sequence = []

while True:
    if not init:
        init_hardware()
        # init_wifi()
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
        
        # TODO: GET PICO ID HERE
        pico_id = request_pico_id()
        final_sequence.append(pico_id)

    elif stop_btn.value and is_recording:
        is_recording = False
        ready_led.value = True
        recording_led.value = False

        # Validate move
        valid_moves = check_sequence(sequence)
        for move in valid_moves:
            if move == "FLIP":
                sequence_correct_led()
                print(move)
                final_sequence.append("FLIP")
            if move == "RIGHT":
                sequence_correct_led()
                print(move)
                final_sequence.append("RIGHT")
            if move == "FORWARD":
                sequence_correct_led()
                print(move)
                final_sequence.append("FORWARD")
            if move == "UP":
                sequence_correct_led()
                print(move)
                final_sequence.append("UP")
            if move == "LEFT":
                sequence_correct_led()
                print(move)
                final_sequence.append("LEFT")
            if move == "BACKWARD":
                sequence_correct_led()
                print(move)
                final_sequence.append("BACKWARD")
            if move == "DOWN":
                sequence_correct_led()
                print(move)
                final_sequence.append("DOWN")

        # TODO: Transmit the final sequence
        # send -> final_sequence

        print("\n\nTransmitting: ", final_sequence)
        
        # Reset the sequence for next recording    
        sequence = {"AX" : [],
            "AY" : [],
            "AZ" : [],
            "GX" : [],
            "GY" : [],
            "GZ" : [],
            }
        
        final_sequence = []
         

    # Recording
    if (is_recording):

        # Prevent overflow (sequence terminates if trying to record for more than 10 seconds)    
        if len(sequence["AX"]) > 1000:
            print("\n\n\n\n\n\n\n\nRestarting, overflowed 10s")
            sequence = {"AX" : [],
                "AY" : [],
                "AZ" : [],
                "GX" : [],
                "GY" : [],
                "GZ" : [],
                }

        sequence["AX"].append(round(sensor.acceleration[0], 1))
        sequence["AY"].append(round(sensor.acceleration[1], 1))
        sequence["AZ"].append(round(sensor.acceleration[2], 1))
        sequence["GX"].append(round(sensor.gyro[0], 1))
        sequence["GY"].append(round(sensor.gyro[1], 1))
        sequence["GZ"].append(round(sensor.gyro[2], 1))
        
        if sensor.acceleration[2] > 0:
            print((round(sensor.acceleration[0],1), round(sensor.acceleration[1],1), round(sensor.acceleration[2] - z_offset, 1), sensitivity, -1 * sensitivity))
        else:
            print((round(sensor.acceleration[0],1), round(sensor.acceleration[1],1), round(sensor.acceleration[2] + z_offset, 1), sensitivity, -1 * sensitivity))

            
        # print((sensor.acceleration[1], 16, -16))

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

    Fast movement is +/- 16    (m/s^2)

    There is speed up and slow down
    - Identify which came first



    Note giving a slight smooth motion in the opposite direciton of where you want to go before doing the motion
    Can get a stronger signal since the acceleration will be relatively greater
    
    
    '''
