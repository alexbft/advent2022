import re


def fully_contains(s_out, f_out, s_in, f_in):
    return s_in >= s_out and f_in <= f_out


result = 0
for line in open("4.txt"):
    m = re.match(r"(\d+)-(\d+),(\d+)-(\d+)", line)
    s0, f0, s1, f1 = [int(x) for x in m.groups()]
    if fully_contains(s0, f0, s1, f1) or fully_contains(s1, f1, s0, f0):
        result += 1
print(result)
