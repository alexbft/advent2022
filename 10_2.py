import re


def check_signal():
    pos = (cycle - 1) % 40
    if abs(x - pos) <= 1:
        print("#", end="")
    else:
        print(".", end="")
    if pos == 39:
        print()


def step(cycles, addx):
    global cycle, x
    for _ in range(cycles - 1):
        check_signal()
        cycle += 1
    check_signal()
    cycle += 1
    x += addx


cycle = 1
x = 1
with open("10.txt") as finput:
    for line in finput:
        m = re.match("noop", line)
        if m != None:
            step(1, 0)
            continue
        m = re.match(r"addx (-?\d+)", line)
        if m != None:
            step(2, int(m.group(1)))
            continue
        raise "Invalid cmd: " + line
check_signal()
