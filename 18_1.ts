import { open } from 'node:fs/promises';

type Point3d = [number, number, number];
type Vec3 = Point3d;

function add(p: Point3d, v: Vec3): Point3d {
  return [p[0] + v[0], p[1] + v[1], p[2] + v[2]];
}

function toKey(p: Point3d): string {
  return p.join(',');
}

const finput = await open('18.txt');
const cubes = new Map<string, Point3d>();
for await (const line of finput.readLines()) {
  const p = line.split(',').map(Number) as Point3d;
  cubes.set(line, p);
}
await finput.close();
const dirs: Vec3[] = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]];
let total = 0;
for (const cube of cubes.values()) {
  for (const dir of dirs) {
    const newP = add(cube, dir);
    if (!cubes.has(toKey(newP))) {
      total += 1;
    }
  }
}
console.log(total);
