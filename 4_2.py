import re


def overlap(s0, f0, s1, f1):
    return f0 >= s1 and f1 >= s0


result = 0
for line in open("4.txt"):
    m = re.match(r"(\d+)-(\d+),(\d+)-(\d+)", line)
    s0, f0, s1, f1 = [int(x) for x in m.groups()]
    if overlap(s0, f0, s1, f1):
        result += 1
print(result)
