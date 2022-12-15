import re

control_points = [20, 60, 100, 140, 180, 220]


def check_signal():
    global result
    if cycle in control_points:
        # print(cycle, x)
        result += cycle * x


def step(cycles, addx):
    global cycle, x
    for i in range(cycles - 1):
        cycle += 1
        check_signal()
    cycle += 1
    x += addx
    check_signal()


cycle = 1
x = 1
result = 0
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
print(result)
