def look(x, y, dx, dy):
    result = 0
    height = rows[y][x]
    while True:
        if x <= 0 or y <= 0 or x >= sx - 1 or y >= sy - 1:
            break
        x += dx
        y += dy
        result += 1
        if rows[y][x] >= height:
            break
    return result


rows = []
with open("8.txt") as finput:
    for line in finput:
        rows.append([int(x) for x in line.rstrip()])
sx = len(rows[0])
sy = len(rows)
top_score = 0
for y in range(sy):
    for x in range(sx):
        vis_left = look(x, y, -1, 0)
        vis_top = look(x, y, 0, -1)
        vis_right = look(x, y, 1, 0)
        vis_bottom = look(x, y, 0, 1)
        score = vis_left * vis_top * vis_right * vis_bottom
        if top_score < score:
            top_score = score
print(top_score)
