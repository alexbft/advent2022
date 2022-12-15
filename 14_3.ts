import { open } from 'node:fs/promises';

type Point = [number, number];
type Vector = Point;
type Line = [Point, Point];

let minX = 500;
let maxX = 500;
let minY = 0;
let maxY = 0;
function updateBounds([x, y]: Point) {
  if (x < minX) {
    minX = x;
  }
  if (x > maxX) {
    maxX = x;
  }
  if (y < minY) {
    minY = y;
  }
  if (y > maxY) {
    maxY = y;
  }
}

const Cell = {
  empty: 0,
  wall: 1,
  sand: 2,
};

class Matrix {
  private readonly width: number;
  private readonly height: number;
  private readonly cells: number[];

  constructor(
    private readonly minX: number,
    private readonly maxX: number,
    private readonly minY: number,
    private readonly maxY: number) {
    this.width = maxX - minX + 1;
    this.height = maxY - minY + 1;
    this.cells = new Array(this.width * this.height).fill(Cell.empty);
  }

  get(p: Point) {
    return this.cells[this.pointToIndex(p)];
  }

  set(p: Point, v: number) {
    this.cells[this.pointToIndex(p)] = v;
  }

  private pointToIndex([x, y]: Point) {
    return (y - this.minY) * this.width + (x - this.minX);
  }

  drawLine([pFrom, pTo]: Line) {
    const vec: Vector = [Math.sign(pTo[0] - pFrom[0]), Math.sign(pTo[1] - pFrom[1])];
    let cur = pFrom;
    while (!pEqual(cur, pTo)) {
      this.set(cur, Cell.wall);
      cur = pRelative(cur, vec);
    }
    this.set(cur, Cell.wall);
  }

  inBounds([x, y]: Point) {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
  }
}

function pEqual([x0, y0]: Point, [x1, y1]: Point) {
  return x0 === x1 && y0 === y1;
}

function pRelative([x, y]: Point, [dx, dy]: Vector): Point {
  return [x + dx, y + dy];
}

const file = await open('./14.txt');

const lines: Line[] = [];
for await (const line of file.readLines()) {
  const items = line.split(' -> ');
  for (let i = 1; i < items.length; ++i) {
    const pFrom = items[i - 1].split(',').map(Number) as Point;
    const pTo = items[i].split(',').map(Number) as Point;
    updateBounds(pFrom);
    updateBounds(pTo);
    lines.push([pFrom, pTo]);
  }
}

const sTime = Date.now();

maxY += 1;
minX = Math.min(minX, 500 - (maxY + 1));
maxX = Math.max(maxX, 500 + (maxY + 1));
const m = new Matrix(minX, maxX, minY, maxY);
for (const l of lines) {
  m.drawLine(l);
}
const startPoint: Point = [500, 0];
m.set(startPoint, Cell.sand);
let sandCount = 1;
const shifts: Vector[] = [[0, 1], [-1, 1], [1, 1]];
for (let y = minY; y < maxY; ++y) {
  for (let x = minX; x <= maxX; ++x) {
    if (m.get([x, y]) === Cell.sand) {
      for (const shift of shifts) {
        const np = pRelative([x, y], shift);
        if (m.get(np) === Cell.empty) {
          m.set(np, Cell.sand);
          sandCount += 1;
        }
      }
    }
  }
}

const time = Date.now() - sTime
console.log(sandCount);
console.log(`Time: ${time}`);
