import { readFile } from 'fs/promises';

const minX = -1000;
const maxX = 1000;
const minY = -1000;
const maxY = 1000;

const dirs = {
  'n': [0, -1],
  'ne': [1, -1],
  'e': [1, 0],
  'se': [1, 1],
  's': [0, 1],
  'sw': [-1, 1],
  'w': [-1, 0],
  'nw': [-1, -1],
};
type DirName = keyof typeof dirs;
const allDirNames = Object.keys(dirs) as DirName[];
const checks: [DirName, DirName, DirName][] = [['n', 'ne', 'nw'], ['s', 'se', 'sw'], ['w', 'nw', 'sw'], ['e', 'ne', 'se']];

function toKey(x: number, y: number): number {
  return (y - minY) * (maxX - minX) + (x - minX);
}

function fromKey(key: number): [number, number] {
  return [minX + (key % (maxX - minX)), minY + Math.floor(key / (maxX - minX))];
}

type Bounds = { x0: number, y0: number, y1: number, x1: number };
function bounds(elves: Map<number, [number, number]>): Bounds {
  let x0 = maxX;
  let y0 = maxY;
  let x1 = minX;
  let y1 = minY;
  for (const elf of elves.keys()) {
    const [x, y] = fromKey(elf);
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
}

function print(elves: Map<number, [number, number]>) {
  const { x0, y0, x1, y1 } = bounds(elves);
  let buf = '';
  for (let y = y0; y <= y1; ++y) {
    for (let x = x0; x <= x1; ++x) {
      buf += elves.has(toKey(x, y)) ? '#' : '.';
    }
    buf += '\n';
  }
  console.log(buf);
}

const input = (await readFile('23.txt', { encoding: 'utf-8' })).trim();
const rows = input.split('\n').map(s => s.trim());
let elves = new Map<number, [number, number]>();
for (let y = 0; y < rows.length; ++y) {
  for (let x = 0; x < rows[0].length; ++x) {
    const key = toKey(x, y);
    if (rows[y][x] === '#') {
      elves.set(key, [key, 0]);
    }
  }
}

let round: number;
for (round = 0; round < 10000; ++round) {
  console.log(`Round ${round}`);
  print(elves);

  const newElves = new Map<number, [number, number]>();
  let anyMoved = false;
  for (const [elf, [_prev, dir]] of elves) {
    const [x, y] = fromKey(elf);

    const newDir = (dir + 1) % 4;
    const neighbors = new Set<DirName>();
    let hasNeighbors = false;
    for (const dirName of allDirNames) {
      if (elves.has(toKey(x + dirs[dirName][0], y + dirs[dirName][1]))) {
        hasNeighbors = true;
        neighbors.add(dirName);
      }
    }
    let moved = false;
    if (hasNeighbors) {
      for (let i = 0; i < 4; ++i) {
        const check = checks[(i + dir) % 4];
        if (check.every(dirName => !neighbors.has(dirName))) {
          const [dx, dy] = dirs[check[0]];
          const nx = x + dx;
          const ny = y + dy;
          const nKey = toKey(nx, ny);
          if (!newElves.has(nKey)) {
            newElves.set(nKey, [elf, newDir]);
            moved = true;
          } else {
            const [otherPrev, otherDir] = newElves.get(nKey)!;
            newElves.set(otherPrev, [otherPrev, otherDir]);
            newElves.delete(nKey);
          }
          break;
        }
      }
    }
    if (!moved) {
      newElves.set(elf, [elf, newDir]);
    } else {
      anyMoved = true;
    }
  }
  elves = newElves;
  if (!anyMoved) {
    break;
  }
}
console.log(`Round ${round + 1}`);
print(elves);
console.log(round + 1);
