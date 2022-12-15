from collections import deque


def can_walk(cell_from, cell_to):
    if cell_from == 'S':
        cell_from = 'a'
    if cell_to == 'E':
        cell_to = 'z'
    return ord(cell_to) - ord(cell_from) <= 1


with open("12.txt") as finput:
    raw = finput.read().rstrip()
rows = [row.rstrip() for row in raw.split("\n")]
for y in range(len(rows)):
    x = rows[y].find("S")
    if x >= 0:
        start_x = x
        start_y = y
    x = rows[y].find("E")
    if x >= 0:
        end_x = x
        end_y = y
max_x = len(rows[0])
max_y = len(rows)
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
print(dist[end_y][end_x] - 1)
