import re
from functools import reduce


class Monkey:
    def __init__(self):
        self.inspect_count = 0

    def do_turn(self):
        for it in self.items:
            self.inspect_count += 1
            result = self.op(it) % base
            if result % self.test_div == 0:
                monkeys[self.test_true].items.append(result)
            else:
                monkeys[self.test_false].items.append(result)
        self.items = []


def op_add(x):
    def fn(a):
        return a + x
    return fn


def op_mult(x):
    def fn(a):
        return a * x
    return fn


def op_sqr():
    def fn(a):
        return a * a
    return fn


monkeys = []
with open("11.txt") as finput:
    for line in finput:
        s = line.strip()
        if not s:
            continue
        if re.match(r"Monkey", s):
            monkeys.append(Monkey())
            continue
        if m := re.match(r"Starting items: (.+)", s):
            monkeys[-1].items = [int(x) for x in m.group(1).split(", ")]
            continue
        if m := re.match(r"Operation: new = old (.) (.+)", s):
            if m.group(1) == "+":
                op = op_add(int(m.group(2)))
            elif m.group(1) == "*":
                if m.group(2) == "old":
                    op = op_sqr()
                else:
                    op = op_mult(int(m.group(2)))
            else:
                raise "Invalid op"
            monkeys[-1].op = op
            continue
        if m := re.match(r"Test: divisible by (\d+)", s):
            monkeys[-1].test_div = int(m.group(1))
            continue
        if m := re.match(r"If true: throw to monkey (\d+)", s):
            monkeys[-1].test_true = int(m.group(1))
            continue
        if m := re.match(r"If false: throw to monkey (\d+)", s):
            monkeys[-1].test_false = int(m.group(1))
            continue
        raise "Invalid line: " + s
base = reduce((lambda acc, x: acc * x.test_div), monkeys, 1)
for rnd in range(10000):
    for monkey in monkeys:
        monkey.do_turn()
monkeys_sorted = sorted(monkeys, key=lambda m: m.inspect_count, reverse=True)
print(monkeys_sorted[0].inspect_count * monkeys_sorted[1].inspect_count)
