def check_vis(rows, visibility, sx, sy, transform_xy):
    for x in range(sx):
        tallest = -1
        for y in range(sy):
            xx, yy = transform_xy(x, y)
            if rows[yy][xx] > tallest:
                visibility[yy][xx] = True
                tallest = rows[yy][xx]


rows = []
with open("8.txt") as finput:
    for line in finput:
        rows.append([int(x) for x in line.rstrip()])
sx = len(rows[0])
sy = len(rows)
visibility = [[False]*sx for _ in range(sy)]
check_vis(rows, visibility, sx, sy, lambda x, y: (x, y))  # from top
check_vis(rows, visibility, sy, sx, lambda x, y: (sx - 1 - y, x))  # from right
check_vis(rows, visibility, sx, sy, lambda x, y: (x, sy - 1 - y))  # bottom
check_vis(rows, visibility, sy, sx, lambda x, y: (y, x))  # from left
total = sum(sum(1 for cell in row if cell) for row in visibility)
print(total)
# vis = [['1' if cell else '0' for cell in row] for row in visibility]
# print("\n".join("".join(cell for cell in row) for row in vis))
