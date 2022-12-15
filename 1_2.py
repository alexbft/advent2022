def upd_max(x):
    global max_c
    for i in range(0, 3):
        if max_c[i] < x:
            max_c = max_c[:i] + [x] + max_c[i:-1]
            break


cur = 0
max_c = [0, 0, 0]
for line in open("1.txt"):
    x = line.strip()
    if x == "":
        upd_max(cur)
        cur = 0
    else:
        cur += int(x)
upd_max(cur)
print(sum(max_c))
