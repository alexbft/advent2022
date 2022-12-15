from collections import namedtuple
from itertools import zip_longest


class Value:
    def __init__(self, kind, v, vlist):
        self.kind = kind
        self.v = v
        self.vlist = vlist

    @staticmethod
    def single(v):
        return Value("single", v, None)

    @staticmethod
    def list(vlist):
        return Value("list", None, vlist)

    def as_list(self):
        if self.kind == "single":
            return [self]
        else:
            return self.vlist

    def to_str(self):
        if self.kind == "single":
            return str(self.v)
        else:
            return "[" + ",".join(v.to_str() for v in self.vlist) + "]"


Token = namedtuple("Token", ["kind", "value"])


def parse(s):
    def read():
        token = read_token()
        if token.kind == "n":
            return Value.single(token.value)
        elif token.kind == "[":
            vlist = []
            while True:
                v = read_value_or_list_end()
                if v is None:
                    break
                vlist.append(v)
                separator = read_token()
                if separator.kind == ',':
                    continue
                elif separator.kind == ']':
                    break
                else:
                    bail(", or ]", separator)
            return Value.list(vlist)
        else:
            bail("n or [", token)

    def bail(expected, actual):
        raise "While parsing {0}:\nPosition {1}: expected {2}, got {3}".format(
            s, i, expected, actual)

    def read_token(peek=False):
        nonlocal i

        if i >= len(s):
            bail("valid token", "EOL")
        match s[i]:
            case '[':
                t = Token('[', '[')
                size = 1
            case ']':
                t = Token(']', ']')
                size = 1
            case ',':
                t = Token(',', ',')
                size = 1
            case c:
                if not (c >= '0' and c <= '9'):
                    bail("valid token", c)
                j = i
                buf = [c]
                while j + 1 < len(s) and s[j + 1] >= '0' and s[j + 1] <= '9':
                    j += 1
                    buf.append(s[j])
                t = Token('n', int("".join(buf)))
                size = j - i + 1
        if not peek:
            i += size
        return t

    def read_value_or_list_end():
        next_token = read_token(peek=True)
        if next_token.kind == ']':
            read_token()
            return None
        return read()

    i = 0
    return read()


def compare(v1, v2):
    if v1.kind == "single" and v2.kind == "single":
        return compare_ints(v1.v, v2.v)
    else:
        return compare_lists(v1.as_list(), v2.as_list())


def compare_ints(a, b):
    if a < b:
        return -1
    elif a > b:
        return 1
    else:
        return 0


def compare_lists(vlist1, vlist2):
    for v1, v2 in zip_longest(vlist1, vlist2):
        if v1 is None:
            return -1
        elif v2 is None:
            return 1
        else:
            res = compare(v1, v2)
            if res != 0:
                return res
    return 0


index_sum = 0
with open("13.txt") as finput:
    index = 0
    while True:
        index += 1
        a_raw = finput.readline()
        if a_raw == "":
            break
        b_raw = finput.readline()
        finput.readline()
        a = parse(a_raw.rstrip())
        b = parse(b_raw.rstrip())
        res = compare(a, b)
        print(a.to_str(), b.to_str(), res)
        if res <= 0:
            index_sum += index
print(index_sum)
