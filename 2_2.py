win_score = {'X': 0, 'Y': 3, 'Z': 6}
score = {'A': 1, 'B': 2, 'C': 3}


def hand(a, b):
    if a == 'A':
        return {'X': 'C', 'Y': 'A', 'Z': 'B'}[b]
    elif a == 'B':
        return {'X': 'A', 'Y': 'B', 'Z': 'C'}[b]
    elif a == 'C':
        return {'X': 'B', 'Y': 'C', 'Z': 'A'}[b]
    else:
        raise 'error'


def hand_score(a, b):
    return score[hand(a, b)]


total = 0
for line in open("2.txt"):
    a, b = line.strip().split(' ')
    total += win_score[b] + hand_score(a, b)
print(total)
