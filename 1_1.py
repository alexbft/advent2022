def upd_max(x):
    global max_c
    if max_c < x:
        max_c = x


cur = 0
max_c = 0
for line in open("1.txt"):
    x = line.strip()
    if x == "":
        upd_max(cur)
        cur = 0
    else:
        cur += int(x)
upd_max(cur)
print(max_c)
