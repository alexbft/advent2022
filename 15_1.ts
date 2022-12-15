import { open } from 'node:fs/promises';

type Interval = [number, number];

function join(existing: Interval[], aNew: Interval): Interval {
  if (existing.length === 0) {
    return aNew;
  }
  return [Math.min(aNew[0], existing[0][0]), Math.max(aNew[1], existing[existing.length - 1][1])];
}

function union(intervals: Interval[]): Interval[] {
  const intervalUnion: Interval[] = [];
  for (const [l, r] of intervals) {
    let lIndex = intervalUnion.length;
    for (let i = 0; i < intervalUnion.length; ++i) {
      if (intervalUnion[i][1] >= l) {
        lIndex = i;
        break;
      }
    }
    let rIndex = -1;
    for (let i = intervalUnion.length - 1; i >= 0; --i) {
      if (intervalUnion[i][0] <= r) {
        rIndex = i;
        break;
      }
    }
    const inner = intervalUnion.slice(lIndex, rIndex + 1);
    console.log(`add: ${JSON.stringify(intervalUnion)} <- ${[l, r]}`);
    const replace_with = join(inner, [l, r]);
    intervalUnion.splice(lIndex, rIndex - lIndex + 1, replace_with);
  }
  return intervalUnion;
}

const targetY = 2000000;
const inputRe = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/;
const finput = await open('15.txt');
const intervals: Interval[] = [];
const beaconX = new Set<number>();
for await (const line of finput.readLines()) {
  const match = line.match(inputRe)!;
  const [sx, sy, bx, by] = [match[1], match[2], match[3], match[4]].map(Number);
  if (by === targetY) {
    beaconX.add(bx);
  }
  const radius = Math.abs(bx - sx) + Math.abs(by - sy);
  const radiusAtTargetRow = radius - Math.abs(sy - targetY);
  if (radiusAtTargetRow >= 0) {
    const interval: Interval = [sx - radiusAtTargetRow, sx + radiusAtTargetRow];
    intervals.push(interval);
  }
}
const intervalUnion = union(intervals);
console.log(JSON.stringify(intervalUnion));
const totalLength = intervalUnion.reduce((acc, [l, r]) => {
  let beaconsInside = 0;
  for (let bx of beaconX) {
    if (l <= bx && bx <= r) {
      beaconsInside += 1;
    }
  }
  return acc + r - l + 1 - beaconsInside;
}, 0);
console.log(totalLength);
