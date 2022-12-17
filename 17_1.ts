import { open } from 'fs/promises';

type Point = [number, number];

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
for (let figureIndex = 0; figureIndex < 2022; ++figureIndex) {
  const figure = figures[figureIndex % figures.length];
  let figureX = 2;
  let figureY = stack.height + 3;
  while (true) {
    if (input[moveIndex % input.length] === '<') {
      if (move(stack, figure, figureX, figureY, -1, 0)) {
        figureX -= 1;
      }
    } else {
      if (move(stack, figure, figureX, figureY, 1, 0)) {
        figureX += 1;
      }
    }
    moveIndex += 1;
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
      break;
    }
  }
}
console.log(stack.height);
