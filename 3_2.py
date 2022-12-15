def to_int(s):
    return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".find(s) + 1


total = 0
for s3 in zip(*[open("3.txt")]*3, strict=True):
    a, b, c = [s.strip() for s in s3]
    sc = set(a) & set(b) & set(c)
    if len(sc) != 1:
        raise 'fail'
    total += to_int(sc.pop())
print(total)
