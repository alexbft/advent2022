import re

dirs = {
    'L': (-1, 0),
    'U': (0, -1),
    'R': (1, 0),
    'D': (0, 1),
}


def sign(x):
    if x > 0:
        return 1
    elif x < 0:
        return -1
    else:
        return 0


head_pos = (0, 0)
tail_pos = (0, 0)
tail_been = set([tail_pos])
with open("9.txt") as finput:
    for line in finput:
        m = re.match(r"(L|U|R|D) (\d+)", line)
        dir, dist = dirs[m.group(1)], int(m.group(2))
        for step in range(dist):
            head_pos = (head_pos[0] + dir[0], head_pos[1] + dir[1])
            dx, dy = head_pos[0] - tail_pos[0], head_pos[1] - tail_pos[1]
            if abs(dx) >= 2 or abs(dy) >= 2:
                dir_tail = (sign(dx), sign(dy))
                tail_pos = (tail_pos[0] + dir_tail[0],
                            tail_pos[1] + dir_tail[1])
                tail_been.add(tail_pos)
print(len(tail_been))
