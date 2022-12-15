def to_int(s):
    return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".find(s) + 1


total = 0
for line in open("3.txt"):
    s = line.strip()
    l = len(s) // 2
    s1, s2 = s[:l], s[l:]
    sc = set(s1) & set(s2)
    if len(sc) != 1:
        raise 'fail'
    total += to_int(sc.pop())
print(total)
