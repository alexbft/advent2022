import re

lines = (l.rstrip() for l in open("5.txt"))

cols = []
max_col = 0
for i in range(9):
    cols.append([])
for l in lines:
    if l.find('1') >= 0:
        break
    row = re.findall(r"\s\s\s\s?|\[\w\]", l)
    # print(row)
    for i, s in enumerate(row):
        if s.startswith('['):
            if max_col < i + 1:
                max_col = i + 1
            cols[i].append(s[1])
cols = [col[::-1] for col in cols]
# print(cols)

next(lines)
for l in lines:
    m = re.match(r"move (\d+) from (\d+) to (\d+)", l)
    if m == None:
        raise 'no match'
    num, a, b = [int(g) for g in m.groups()]
    a = a - 1
    b = b - 1
    to_move = cols[a][-num:]
    cols[a] = cols[a][:-num]
    to_move.reverse()
    cols[b] = cols[b] + to_move
print("".join(col[-1] for col in cols[:max_col]))
