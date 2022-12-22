import { readFile } from 'node:fs/promises';

type Point = [number, number];
type Vec = Point;
type Interval = Point;

class Matrix {
  private readonly cells: number[];

  constructor(public readonly width: number, public readonly height: number) {
    this.cells = [];
  }

  get([x, y]: Point) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      throw new Error();
    }
    const result = this.cells[y * this.width + x];
    if (result != null) {
      return ' #.'[result];
    }
    return ' ';
  }

  set([x, y]: Point, v: string) {
    this.cells[y * this.width + x] = { ' ': 0, '#': 1, '.': 2 }[v]!;
  }
}

function add(p: Point, v: Vec): Point {
  return [p[0] + v[0], p[1] + v[1]];
}

const input = await readFile('22.txt', { encoding: 'utf-8' });
const rows = input.trimEnd().split('\n').map(row => row.trimEnd());
const partMap = rows.slice(0, -2);
const directions = rows.at(-1)!;
const width = Math.max(...partMap.map(row => row.length));
const height = partMap.length;
const map = new Matrix(width, height);
for (let y = 0; y < height; ++y) {
  for (let x = 0; x < partMap[y].length; ++x) {
    map.set([x, y], partMap[y][x]);
  }
}

const rowBounds: Interval[] = [];
for (let y = 0; y < height; ++y) {
  let l = 0;
  while (map.get([l, y]) === ' ') {
    ++l;
  }
  let r = width - 1;
  while (map.get([r, y]) === ' ') {
    --r;
  }
  rowBounds.push([l, r]);
}
const colBounds: Interval[] = [];
for (let x = 0; x < width; ++x) {
  let u = 0;
  while (map.get([x, u]) === ' ') {
    ++u;
  }
  let d = height - 1;
  while (map.get([x, d]) === ' ') {
    --d;
  }
  colBounds.push([u, d]);
}
let position: Point = [rowBounds[0][0], 0];
let rotation = 0;
const dirByRotation: Vec[] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const re = /(\d+)(\w)?/g;
let m: RegExpExecArray | null = null;
while (m = re.exec(directions)) {
  const [len, rot] = [Number(m[1]), m[2]];
  for (let i = 0; i < len; ++i) {
    let [nx, ny] = add(position, dirByRotation[rotation]);
    switch (rotation) {
      case 0:
        if (nx > rowBounds[ny][1]) {
          nx = rowBounds[ny][0];
        }
        break;
      case 1:
        if (ny > colBounds[nx][1]) {
          ny = colBounds[nx][0];
        }
        break;
      case 2:
        if (nx < rowBounds[ny][0]) {
          nx = rowBounds[ny][1];
        }
        break;
      case 3:
        if (ny < colBounds[nx][0]) {
          ny = colBounds[nx][1];
        }
        break;
      default:
        throw new Error();
    }
    if (map.get([nx, ny]) === '.') {
      position = [nx, ny];
    } else {
      break;
    }
  }
  if (rot != null) {
    rotation = rotation + (rot === 'R' ? 1 : -1);
    rotation = (rotation + 4) % 4;
  }
}
console.log(position, rotation, (position[1] + 1) * 1000 + (position[0] + 1) * 4 + rotation);
