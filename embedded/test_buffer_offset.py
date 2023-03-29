# in this example, buffer offsetting breaks everything
# the 30 has a buffer offset that omits the next 5
# so then -14 doesn't get read
# but -14 is supposed to be a real signal and 25 is the feedback
# so the buffer offsetting is supposed to omit 25

sequence = [30,2,3,-14,-5,25,1,2,3]
sensitivity = 20
valid_moves_indexed = []
buffer = 0
buffer_offset = 5


for i, x in enumerate(sequence):
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
            
                
                
for i, x in enumerate(sequence):
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
            
            
            
print(valid_moves_indexed)