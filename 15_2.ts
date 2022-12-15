import { open } from 'node:fs/promises';

type Interval = [number, number];
type Point = [number, number];

function union(intervals: Interval[]): Interval[] {
  const temp = [...intervals];
  temp.sort(([l0,], [l1,]) => l0 - l1);
  const result: Interval[] = [];
  for (const [l, r] of temp) {
    if (result.length === 0) {
      result.push([l, r]);
    } else {
      const [prevL, prevR] = result[result.length - 1];
      if (prevR + 1 >= l) {
        result[result.length - 1] = [prevL, Math.max(r, prevR)];
      } else {
        result.push([l, r]);
      }
    }
  }
  return result;
}

// const inputFile = '15_test.txt';
// const maxX = 20;
// const maxY = 20;
const inputFile = '15.txt';
const maxX = 4000000;
const maxY = 4000000;

const inputRe = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/;
const finput = await open(inputFile);
const sensors: [Point, number][] = [];
for await (const line of finput.readLines()) {
  const match = line.match(inputRe)!;
  const [sx, sy, bx, by] = [match[1], match[2], match[3], match[4]].map(Number);
  const radius = Math.abs(bx - sx) + Math.abs(by - sy);
  sensors.push([[sx, sy], radius]);
}

const sTime = Date.now();

for (let targetY = 0; targetY <= maxY; ++targetY) {
  const intervals: Interval[] = [];
  for (const [[sx, sy], radius] of sensors) {
    const radiusAtTargetRow = radius - Math.abs(sy - targetY);
    if (radiusAtTargetRow >= 0) {
      const interval: Interval = [sx - radiusAtTargetRow, sx + radiusAtTargetRow];
      intervals.push(interval);
    }
  }
  const intervalUnion = union(intervals);
  let targetX = 0;
  for (let i = 0; i < intervalUnion.length - 1; ++i) {
    const r0 = intervalUnion[i][1];
    const l1 = intervalUnion[i + 1][0];
    if (l1 - r0 === 2) {
      targetX = r0 + 1;
      if (targetX >= 0 && targetX <= maxX) {
        console.log(targetX, targetY, targetX * 4000000 + targetY);
      }
    }
  }
}

console.log(`Time: ${Date.now() - sTime}`);
