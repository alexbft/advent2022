f = open("6.txt", encoding="utf-8")
s = f.read().rstrip()
f.close()

buf = []
pos = 0
found = False
for c in s:
    pos += 1
    buf.append(c)
    if len(buf) > 4:
        buf = buf[1:]
    if len(set(buf)) == 4:
        found = True
        break
if found:
    print(pos)
else:
    print("not found")
