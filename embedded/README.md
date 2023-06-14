# Embedded

The embedded component of the multi-factor authentication system allows users to input a motion based password.

The embedded system uses a Raspberry Pico microcontroller running CircuitPython code. The microcontroller interfaces with an accelerometer and gyroscope sensor on the Adafruit LSM6DS33 inertial measurement unit over I2C protocol. Additionally, buttons, LEDs, and wireless microcontroller features are implemented for user interaction.

## Features

- 7 motion based passwords
  - Up, down, left right, forward, back, flip
- Wireless communication with 3FA admin API
- 2 buttons to record and transmit a password
- 3 LED indicators for ready, recording, and transmitting
- Live memory overflow protection
- Motion sensor noise detection and filtering
