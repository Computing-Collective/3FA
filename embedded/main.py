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
import ipaddress
import microcontroller
import adafruit_requests
from adafruit_httpserver.server import HTTPServer
from adafruit_httpserver.request import HTTPRequest
from adafruit_httpserver.response import HTTPResponse
from adafruit_httpserver.methods import HTTPMethod
from adafruit_httpserver.mime_type import MIMEType
from adafruit_httpserver.headers import HTTPHeaders
from adafruit_httpserver.status import CommonHTTPStatus


import json


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
sensitivity = 4
buffer_offset = 4 # there are typically 3 elements of feedback
                  # for example forward move is [20, -20, -18, -12, -4, 0, 0, 0]
z_offset = 10 # don't use z_offset on raw data (flip z needs to be not around 0 to detect flips as the sign of the number)

# The URL to send the sequence to for validation
VALIDATE_URL = "http://192.168.137.1:5000/api/login/motion_pattern/validate/"
# VALIDATE_URL = "http://cpen291-24.ece.ubc.ca:5000/api/login/motion_pattern/validate/"

# The pico ID (empty between each request to the server)
pico_id = None

# Wifi and server setup
ipv4 = ipaddress.IPv4Address(os.getenv('PICO_W_HOTSPOT_IPV4_ADDRESS'))
netmask = ipaddress.IPv4Address("255.255.255.0")
gateway = ipaddress.IPv4Address("192.168.137.1")
wifi.radio.set_ipv4_address(ipv4=ipv4, netmask=netmask, gateway=gateway)

#  Connect to laptop SSID
wifi.radio.connect(os.getenv('CIRCUITPY_WIFI_SSID'),
                   os.getenv('CIRCUITPY_WIFI_PASSWORD'))
pool = socketpool.SocketPool(wifi.radio)

# ssl_context = ssl.create_default_context()
# ssl_context.check_hostname = False
# ssl_context.load_verify_locations(None)
requests = adafruit_requests.Session(pool, ssl.create_default_context())

# Set CORS headers
headers = HTTPHeaders()
headers.setdefault("Access-Control-Allow-Headers", "*")
headers.setdefault("Access-Control-Allow-Origin", "*")
headers.setdefault("Access-Control-Allow-Methods", "*")

server = HTTPServer(pool)

print("\nStarting server...")
# Startup the server
try:
    server.start(str(wifi.radio.ipv4_address))
    print("Listening on http://%s\n" % wifi.radio.ipv4_address)

#  If the server fails to begin, restart the Pico W
except OSError:
    time.sleep(5)
    print("Restarting..")
    microcontroller.reset()
ping_address = ipaddress.ip_address("8.8.4.4")

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
    if num == 0:
        return 1
    return num / abs(num)

def add_all_sensor_data(sequence):
    sequence["AX"].append(round(sensor.acceleration[0], 1))
    sequence["AY"].append(round(sensor.acceleration[1], 1))
    sequence["AZ"].append(round(sensor.acceleration[2], 1))
    sequence["GX"].append(round(sensor.gyro[0], 1))
    sequence["GY"].append(round(sensor.gyro[1], 1))
    sequence["GZ"].append(round(sensor.gyro[2], 1))

# Requires a list of valid moves in order
# Just a case statement with added prints/led output
def add_moves_to_sequence(valid_moves):
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
                        valid_moves_indexed.append(("FLIP", i, 0))
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
            if x < (-1 * sensitivity):
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif x > sensitivity :
                valid_moves_indexed.append(("RIGHT", i, x))
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
            if y < (-1 * sensitivity):
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif y > sensitivity:
                valid_moves_indexed.append(("FORWARD", i, y))
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
            if z - z_offset < (-1 * sensitivity):
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif z - z_offset > sensitivity:
                valid_moves_indexed.append(("UP", i, (z - z_offset)))
                buffer = buffer + buffer_offset

    # -X
    for i, x in enumerate(sequence["AX"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1

        if buffer == 0:
            if x > sensitivity:
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif x < -1 * sensitivity :
                valid_moves_indexed.append(("LEFT", i, -1 * x))
                buffer = buffer + buffer_offset

    # -Y
    for i, y in enumerate(sequence["AY"]):
        # Update buffer
        if buffer < 0:
            buffer = 0
        elif buffer > 0:
            buffer = buffer - 1

        if buffer == 0:
            if y > sensitivity:
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif y < -1 * sensitivity:
                valid_moves_indexed.append(("BACKWARD", i, -1 * y))
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
            if (z - z_offset) > (sensitivity):
                # ignore the next buffer_offset elements in list
                buffer = buffer + buffer_offset
            elif (z - z_offset) < (-1 * sensitivity):
                valid_moves_indexed.append(("DOWN", i, (z - z_offset) * -1))
                buffer = buffer + buffer_offset


    # --------------------------------------------------------------------------------------------------------------------------------------------
    # SEQUENCE PROCESSING
    # --------------------------------------------------------------------------------------------------------------------------------------------
    if len(valid_moves_indexed) == 0:
        return valid_moves_indexed
    # Processing sequence
    # Sort based on time -> filter moves caused by feedback -> put in list of moves

    # Sort the valid moves based on index (which is time in 0.1s) ----------------------------------------------------------
    print("\n\nunsorted:", valid_moves_indexed, "\n\n")
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

    # Remove moves from list based on filter
    moves_to_remove = []
    for index in flip_occurence_indices:
        for move_index, pair in enumerate(valid_moves_indexed):
            # first condition checks if move is within tolerance * 0.1ms of the flip
            if abs(pair[1] - index) < tolerance  and pair[0] != "FLIP":
                # print("try to remove", pair, "at move index", move_index)
                # print("removing", pair)
                moves_to_remove.append(move_index)

    moves_to_remove.sort(reverse=True)  # Remove elements from end of list to prevent index errors
    for index in moves_to_remove:
        print("\tremoving", valid_moves_indexed[index])
        del valid_moves_indexed[index]

    print("flip filtered:", valid_moves_indexed, "\n\n")

    print("local max filter begin")
    sorted_moves = []
    if len(valid_moves_indexed) > 1:
        '''
        valid_moves_indexed[0][0] move string
        valid_moves_indexed[0][1] time occurrence value of move
        valid_moves_indexed[0][2] strength value of move
        '''
        i = 0   # current index
        starting_range_index = valid_moves_indexed[0][1]    # index for neighbour comparison
        current_max_val = valid_moves_indexed[0][2]         # value of max between neighbours
        current_max_index = 0                               # index of max neighbour in valid_moves_indexed
        while i < len(valid_moves_indexed):
            # outside neighbour compare region, update new starting comparison element
            if valid_moves_indexed[i][1] > starting_range_index + 3:
                # add the previous max to sorted_moves
                print("Appending Max", valid_moves_indexed[current_max_index])
                sorted_moves.append(valid_moves_indexed[current_max_index])
                # update variables to find next max
                starting_range_index = valid_moves_indexed[i][1]   
                current_max_val = valid_moves_indexed[i][2]       
                current_max_index = i                      
            # inside neighbour compare region, compare and update current max element
            else:
                if valid_moves_indexed[i][2] > current_max_val:
                    current_max_val = valid_moves_indexed[i][2]
                    current_max_index = i  
            # traverse
            i = i + 1
        
        print("Appending Max", valid_moves_indexed[current_max_index])
        sorted_moves.append(valid_moves_indexed[current_max_index])
    else:
        sorted_moves.append(valid_moves_indexed[0])
        
    print("final sequence:", sorted_moves)
    # print()
    final_moves = []
    for move in sorted_moves:
        final_moves.append(move[0])
    print("\n")

    return final_moves


# --------------------------------------------------------------------------------------------------------------------------------------------
# Wireless Functions
# --------------------------------------------------------------------------------------------------------------------------------------------
@server.route("/pico_id", method=HTTPMethod.OPTIONS)
# Route for complying with CORS
def options_handler(request: HTTPRequest):
    print("Options request received")
    response = HTTPResponse(request, status=CommonHTTPStatus.OK_200, headers=headers)
    with response:
        response.send(json.dumps({"status": "ok"}), content_type="application/json")

@server.route("/pico_id", method=HTTPMethod.POST)
# Route for uploading a pico_id
def set_pico_id(request: HTTPRequest):
    # Must use global to specify we want to modify the pico_id variable that was defined outside
    global pico_id
    #  Get the raw text
    raw_text = request.raw_request.decode("utf-8")
    print("Raw Text received: ", raw_text)

    # Get "pico_id" value out of the request and save it to the pico_id variable

    # Find the JSON data within the string
    start_index = raw_text.find('{')
    end_index = raw_text.find('}', start_index) + 1
    json_data = raw_text[start_index:end_index]

    # Parse the JSON data and extract the value of "a" key
    parsed_data = json.loads(json_data)
    pico_id = parsed_data['pico_id']

    print("Pico ID received: " + pico_id)

    output = {
        "success": 1,
        "msg": "Pico ID received successfully"
    }
    
    with HTTPResponse(request, headers=headers) as response:
        response.send(json.dumps(output),  content_type="application/json")

def transmit_wireless_message(sequence):
    # Transmit the sequence which is a list of strings
    # in the format needed by admin side
    print("\n\nTransmitting: ", sequence)

    json = {
        "pico_id" : pico_id,
        "data" : sequence
    }

    response = requests.post(VALIDATE_URL, json=json)
    output = response.text
    print("\nResponse from server: ", output)
    response.close()
    print("Transmission Complete")


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

        print("\nSetup Complete. Waiting for pico_id from client")

    # Wait to receive pico_id from client
    if pico_id is None:
        try:
            server.poll()
        except Exception as e:
            print("Error polling server", e)
            break

    else:
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
            add_moves_to_sequence(valid_moves)

            # Transmit the final sequence
            transmit_wireless_message(final_sequence)

            # Reset the sequence for next recording
            sequence = {"AX" : [], "AY" : [], "AZ" : [], "GX" : [], "GY" : [], "GZ" : [], }
            final_sequence = []
            pico_id = None
            print("\nWaiting for pico_id from client")


        # Recording
        if (is_recording):

            # Prevent overflow (sequence terminates if trying to record for more than 10 seconds)
            if len(sequence["AX"]) > 1000:
                print("\n\n\n\n\n\n\n\nRestarting, overflowed 10s\n\n")
                sequence = {"AX" : [], "AY" : [], "AZ" : [], "GX" : [], "GY" : [], "GZ" : [], }

            add_all_sensor_data(sequence)

            print((round(sensor.acceleration[0],1), round(sensor.acceleration[1],1), round(sensor.acceleration[2] - z_offset, 1), sensitivity, -1 * sensitivity))

        time.sleep(0.1)
