import { open } from 'node:fs/promises';

type Point3d = [number, number, number];
type Vec3 = Point3d;

function add(p: Point3d, v: Vec3): Point3d {
  return [p[0] + v[0], p[1] + v[1], p[2] + v[2]];
}

const Cell = {
  empty: 0,
  lava: 1,
  air: 2,
  bounds: 3,
};

class Tensor3 {
  private readonly cells: number[] = [];

  constructor(
    public readonly sx: number,
    public readonly sy: number,
    public readonly sz: number) { }


  get(p: Point3d) {
    return this.isInside(p) ? (this.cells[this.key(p)] ?? Cell.empty) : Cell.bounds;
  }

  set(p: Point3d, v: number) {
    this.cells[this.key(p)] = v;
  }

  isInside([x, y, z]: Point3d) {
    return x >= 0 && x < this.sx && y >= 0 && y < this.sy && z >= 0 && z < this.sz;
  }

  key([x, y, z]: Point3d) {
    return z * this.sy * this.sx + y * this.sx + x;
  }
}

const finput = await open('18.txt');
const cubes: Point3d[] = [];
const ts = new Tensor3(22, 22, 22);
for await (const line of finput.readLines()) {
  const p = line.split(',').map(Number) as Point3d;
  const pp = add(p, [1, 1, 1]);
  cubes.push(pp);
  ts.set(pp, Cell.lava);
}
await finput.close();
const dirs: Vec3[] = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]];
const queue: Point3d[] = [[0, 0, 0]];
ts.set(queue[0], Cell.air);
while (queue.length > 0) {
  const cur = queue.shift()!;
  for (const dir of dirs) {
    const next = add(cur, dir);
    if (ts.get(next) === Cell.empty) {
      ts.set(next, Cell.air);
      queue.push(next);
    }
  }
}
let total = 0;
for (const cube of cubes) {
  for (const dir of dirs) {
    const newP = add(cube, dir);
    if (ts.get(newP) === Cell.air) {
      total += 1;
    }
  }
}
console.log(total);
