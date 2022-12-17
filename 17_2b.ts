/// Same as 17_2.ts, but works on test input as well.
/// It isn't _guaranteed_ that it would work on _all_ inputs, but there is a chance (and a very small chance that the result will be incorrect).

import { open } from 'fs/promises';

type Point = [number, number];

interface Pattern {
  iteration: number;
  stackHeight: number;
}

class Matrix {
  private readonly cells: number[];
  constructor(public readonly width: number, public readonly height: number) {
    this.cells = [];
  }
  get([x, y]: Point) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0;
    }
    return this.cells[y * this.width + x] ?? 0;
  }

  set([x, y]: Point, v: number) {
    this.cells[y * this.width + x] = v;
  }
}

class InfiniteStack {
  private readonly cells: number[];
  public height: number;

  constructor(public readonly width: number = 7) {
    this.cells = [];
    this.height = 0;
  }

  get([x, y]: Point) {
    if (x < 0 || x >= this.width || y < 0) {
      return 1;
    }
    return this.cells[y * this.width + x] ?? 0;
  }

  set([x, y]: Point, v: number) {
    this.cells[y * this.width + x] = v;
    if (y > this.height - 1) {
      this.height = y + 1;
    }
  }

  getFingerprint() {
    if (this.height < 16) {
      return null;
    }
    let result = '';
    for (let y = 0; y < 16; ++y) {
      let mask = 0;
      for (let x = 0; x < this.width; ++x) {
        mask = mask + this.get([x, this.height - 1 - y]) * (1 << x);
      }
      result += `${mask}_`;
    }
    return result;
  }
}

function parseFigure(s: string): Matrix {
  const rows = s.split('\n').map(row => row.trim());
  const result = new Matrix(rows[0].length, rows.length);
  for (let y = 0; y < result.height; ++y) {
    for (let x = 0; x < result.width; ++x) {
      result.set([x, y], rows[result.height - 1 - y][x] === '#' ? 1 : 0);
    }
  }
  return result;
}

function move(stack: InfiniteStack, figure: Matrix, figureX: number, figureY: number, dx: number, dy: number): boolean {
  const newX = figureX + dx;
  const newY = figureY + dy;
  for (let y = 0; y < figure.height; ++y) {
    for (let x = 0; x < figure.width; ++x) {
      if (figure.get([x, y]) === 1 && stack.get([newX + x, newY + y]) === 1) {
        return false;
      }
    }
  }
  return true;
}

const finput = await open('17.txt');
const input = (await finput.readFile({ encoding: 'utf-8' })).trim();
await finput.close();
const stack = new InfiniteStack();
const figures = [
  `####`,

  `.#.
   ###
   .#.`,

  `..#
   ..#
   ###`,

  `#
   #
   #
   #`,

  `##
   ##`,
].map(parseFigure);
let moveIndex = 0;
let figureIndex = 0;
let iter = 0;
let iterLeft = 0;
let cycleFound = false;
let extraHeight = 0;
const patternMap = new Map<string, Pattern>();
while (!cycleFound || iterLeft > 0) {
  iter += 1;
  if (iterLeft > 0) {
    iterLeft -= 1;
  }
  const figure = figures[figureIndex];
  figureIndex = (figureIndex + 1) % figures.length;
  let figureX = 2;
  let figureY = stack.height + 3;
  while (true) {
    if (input[moveIndex] === '<') {
      if (move(stack, figure, figureX, figureY, -1, 0)) {
        figureX -= 1;
      }
    } else {
      if (move(stack, figure, figureX, figureY, 1, 0)) {
        figureX += 1;
      }
    }
    moveIndex = (moveIndex + 1) % input.length;
    if (move(stack, figure, figureX, figureY, 0, -1)) {
      figureY -= 1;
    } else {
      for (let y = 0; y < figure.height; ++y) {
        for (let x = 0; x < figure.width; ++x) {
          if (figure.get([x, y]) === 1) {
            stack.set([x + figureX, y + figureY], 1);
          }
        }
      }
      if (!cycleFound) {
        const mask = stack.getFingerprint();
        if (mask != null) {
          const mapKey = `${moveIndex}_${figureIndex}_${mask}`;
          if (patternMap.has(mapKey)) {
            const prev = patternMap.get(mapKey)!;
            const tail = prev.iteration;
            const period = iter - prev.iteration;
            const heightDiff = stack.height - prev.stackHeight;
            console.log(`Found a cycle: tail = ${tail} period = ${period} height diff = ${heightDiff}`);
            cycleFound = true;
            const totalLengthWithoutTail = 1000000000000 - tail;
            const cyclesSkipped = Math.floor(totalLengthWithoutTail / period) - 1;
            iterLeft = totalLengthWithoutTail % period;
            extraHeight = cyclesSkipped * heightDiff;
          } else {
            patternMap.set(mapKey, { iteration: iter, stackHeight: stack.height });
          }
        }
      }
      break;
    }
  }
}
console.log(stack.height + extraHeight);
// console.log(stack.height);
// let buf = '';
// for (let y = stack.height - 1; y >= 0; --y) {
//   let s = '';
//   for (let x = 0; x < stack.width; ++x) {
//     s += stack.get([x, y]) === 1 ? '#' : '.';
//   }
//   buf += s + '\n';
// }
// console.log(buf);
