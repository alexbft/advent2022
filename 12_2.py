from collections import deque


def can_walk(cell_from, cell_to):
    if cell_from == 'E':
        cell_from = 'z'
    if cell_to == 'S':
        cell_to = 'a'
    return ord(cell_from) - ord(cell_to) <= 1


with open("12.txt") as finput:
    raw = finput.read().rstrip()
rows = [row.rstrip() for row in raw.split("\n")]
max_x = len(rows[0])
max_y = len(rows)
for y in range(max_y):
    x = rows[y].find("E")
    if x >= 0:
        start_x = x
        start_y = y
dist = [[0] * max_x for _ in range(max_y)]
dist[start_y][start_x] = 1
queue = deque([(start_x, start_y)])
while len(queue) > 0:
    x, y = queue.popleft()
    for dx, dy in [(-1, 0), (0, -1), (1, 0), (0, 1)]:
        nx, ny = x + dx, y + dy
        if nx >= 0 and nx < max_x and ny >= 0 and ny < max_y and dist[ny][nx] == 0 and can_walk(rows[y][x], rows[ny][nx]):
            dist[ny][nx] = dist[y][x] + 1
            queue.append((nx, ny))
min_dist = 999999
for y in range(max_y):
    for x in range(max_x):
        c = rows[y][x]
        if (c == 'a' or c == 'S') and dist[y][x] > 0 and dist[y][x] < min_dist:
            min_dist = dist[y][x]
print(min_dist - 1)
