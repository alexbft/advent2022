score = {'A': 1, 'B': 2, 'C': 3}
score2 = {'X': 1, 'Y': 2, 'Z': 3}


def win_score(a, b):
    p1 = score[a]
    p2 = score2[b]
    if p1 == 1:
        return {1: 3, 2: 6, 3: 0}[p2]
    elif p1 == 2:
        return {1: 0, 2: 3, 3: 6}[p2]
    elif p1 == 3:
        return {1: 6, 2: 0, 3: 3}[p2]
    else:
        raise 'error'


total = 0
for line in open("2.txt"):
    a, b = line.strip().split(' ')
    total += score2[b] + win_score(a, b)
print(total)
