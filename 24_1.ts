import { readFile } from 'fs/promises';

type Coords = [number, number, number];

class Matrix {
  private cells: number[] = [];
  constructor(public width: number, public height: number, public cycles: number) { }

  get(c: Coords): number {
    return this.cells[this.key(c)] ?? 0;
  }

  set(c: Coords, v: number) {
    this.cells[this.key(c)] = v;
  }

  private key([x, y, cycle]: Coords): number {
    return y * this.width * this.cycles + x * this.cycles + cycle;
  }
}

const cell = {
  '.': 0,
  '#': 1,
  '>': 2,
  'v': 3,
  '<': 4,
  '^': 5,
  visited: 6,
};
type CellKey = keyof typeof cell;

function gcm(a: number, b: number): number {
  let x = a, y = b;
  while (y > 1) {
    [x, y] = [y, x % y];
  }
  return a * b / x;
}

const input = (await readFile('24.txt', { encoding: 'utf-8' })).trim();
const rows = input.split('\n').map(s => s.trim());
const width = rows[0].length;
const height = rows.length;
const ww = width - 2;
const hh = height - 2;
const cycles = gcm(ww, hh);
const start = new Matrix(width, height, 1);
for (let y = 0; y < height; ++y) {
  for (let x = 0; x < width; ++x) {
    start.set([x, y, 0], cell[rows[y][x] as CellKey]);
  }
}

const map = new Matrix(width, height, cycles);
for (let cycle = 0; cycle < cycles; ++cycle) {
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const c = start.get([x, y, 0]);
      let n: number;
      switch (c) {
        case cell['.']:
          break;
        case cell['#']:
          map.set([x, y, cycle], 1);
          break;
        case cell['>']:
          n = 1 + (x - 1 + cycle) % ww;
          map.set([n, y, cycle], 1);
          break;
        case cell['v']:
          n = 1 + (y - 1 + cycle) % hh;
          map.set([x, n, cycle], 1);
          break;
        case cell['<']:
          n = (x - 1 - cycle) % ww;
          if (n < 0) {
            n += ww;
          }
          n += 1;
          map.set([n, y, cycle], 1);
          break;
        case cell['^']:
          n = (y - 1 - cycle) % hh;
          if (n < 0) {
            n += hh;
          }
          n += 1;
          map.set([x, n, cycle], 1);
          break;
        default:
          throw new Error();
      }
    }
  }
}
// for (let cycle = 0; cycle < 20; ++cycle) {
//   let buf = '';
//   for (let y = 0; y < height; ++y) {
//     for (let x = 0; x < width; ++x) {
//       buf += map.get([x, y, cycle]) === 1 ? '#' : '.';
//     }
//     buf += '\n';
//   }
//   console.log(buf);
// }

const queue: [Coords, number][] = [[[1, 0, 0], 0]];
map.set([1, 0, 0], cell.visited);
const endX = width - 2;
const endY = height - 1;
const dirs = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]];
let found = false;
let endDist = 0;
while (queue.length > 0 && !found) {
  const [[x, y, cycle], dist] = queue.shift()!;
  const newCycle = (cycle + 1) % cycles;
  const newDist = dist + 1;
  for (const dir of dirs) {
    const newX = x + dir[0];
    const newY = y + dir[1];
    if (newY < 0 || newY >= height) {
      continue;
    }
    if (map.get([newX, newY, newCycle]) === 0) {
      map.set([newX, newY, newCycle], cell.visited);
      queue.push([[newX, newY, newCycle], newDist]);
      if (newX === endX && newY === endY) {
        found = true;
        endDist = newDist;
      }
    }
  }
}
console.log(endDist);
