import { open } from 'node:fs/promises';

const finput = await open('16.txt');
const reInput = /Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.+)/;
const pathMap = new Map<string, string[]>();
const flow = new Map<string, number>();
for await (const line of finput.readLines()) {
  const m = line.match(reInput)!;
  const src = m[1];
  flow.set(src, Number(m[2]));
  pathMap.set(src, m[3].split(', '));
}
const valves = [...pathMap.keys()];
const dist = new Map<string, number>();
for (const v of valves) {
  for (const v2 of pathMap.get(v)!) {
    dist.set(`${v}${v2}`, 1);
  }
}
for (const mid of valves) {
  for (const v of valves) {
    for (const v2 of valves) {
      if (v === mid || v2 === mid || v === v2) {
        continue;
      }
      const d1 = dist.get(`${v}${mid}`);
      const d2 = dist.get(`${mid}${v2}`);
      if (d1 == null || d2 == null) {
        continue;
      }
      const d = dist.get(`${v}${v2}`);
      if (d == null || d1 + d2 < d) {
        dist.set(`${v}${v2}`, d1 + d2);
      }
    }
  }
}
const nonZeroValves = valves.filter(v => flow.get(v)! > 0);
const dyn: Map<number, number>[][] = [];
for (let time = 0; time < 30; ++time) {
  dyn.push([]);
  for (let valve = 0; valve < nonZeroValves.length; ++valve) {
    dyn[time].push(new Map<number, number>());
  }
}
let maxVolume = 0;
for (let valve = 0; valve < nonZeroValves.length; ++valve) {
  const vCode = nonZeroValves[valve];
  const timeLeft = 30 - (dist.get(`AA${vCode}`)! + 1);
  const valveMask = 1 << valve;
  const volume = flow.get(vCode)! * timeLeft;
  dyn[timeLeft][valve].set(valveMask, volume);
  if (maxVolume < volume) {
    maxVolume = volume;
  }
}
for (let time = 29; time >= 0; --time) {
  for (let valve = 0; valve < nonZeroValves.length; ++valve) {
    const valveCode = nonZeroValves[valve];
    for (const valveMask of dyn[time][valve].keys()) {
      for (let nextValve = 0; nextValve < nonZeroValves.length; ++nextValve) {
        if ((valveMask & (1 << nextValve)) !== 0) {
          continue;
        }
        const nextValveCode = nonZeroValves[nextValve];
        const nextTime = time - (dist.get(`${valveCode}${nextValveCode}`)! + 1);
        if (nextTime <= 0) {
          continue;
        }
        const nextValveMask = valveMask | (1 << nextValve);
        const nextVolume = dyn[time][valve].get(valveMask)! + (nextTime * flow.get(nextValveCode)!);
        const curVolume = dyn[nextTime][nextValve].get(nextValveMask);
        if (curVolume == null || curVolume < nextVolume) {
          dyn[nextTime][nextValve].set(nextValveMask, nextVolume);
          if (maxVolume < nextVolume) {
            maxVolume = nextVolume;
          }
        }
      }
    }
  }
}

console.log(maxVolume);
