/// Run with --max-old-space-size=8192
/// Should take several minutes to complete

import { open } from 'node:fs/promises';

type DynMap = Map<string, Map<number, number>>;

function updateDynValue(map: DynMap, valve1Code: string, valve2Code: string, valveMask: number, volume: number) {
  const mapCode = `${valve1Code}${valve2Code}`;
  let maskMap = map.get(mapCode);
  if (maskMap == null) {
    maskMap = new Map();
    map.set(mapCode, maskMap);
  }
  const curVolume = maskMap.get(valveMask);
  if (curVolume == null || curVolume < volume) {
    maskMap.set(valveMask, volume);
  }
}

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
const nonZeroValves = valves.filter(v => flow.get(v)! > 0);
const valveByCode = new Map<string, number>();
for (let v = 0; v < nonZeroValves.length; ++v) {
  valveByCode.set(nonZeroValves[v], v);
}

let dyn: DynMap = new Map();
updateDynValue(dyn, 'AA', 'AA', 0, 0);
for (let time = 26; time > 0; --time) {
  const newDyn: DynMap = new Map();
  let sizeCounter = 0;
  for (const mapCode of dyn.keys()) {
    const valve1Code = mapCode.substring(0, 2);
    const valve2Code = mapCode.substring(2, 4);
    const valve1 = valveByCode.get(valve1Code);
    const valve2 = valveByCode.get(valve2Code);
    const maskMap = dyn.get(mapCode)!;
    const paths1 = [valve1Code, ...pathMap.get(valve1Code)!];
    const paths2 = [valve2Code, ...pathMap.get(valve2Code)!];
    for (const valveMask of maskMap.keys()) {
      sizeCounter += 1;
      const volume = maskMap.get(valveMask)!;
      for (const nextValve1Code of paths1) {
        for (const nextValve2Code of paths2) {
          let nextVolume = volume;
          let nextValveMask = valveMask;
          if (nextValve1Code === valve1Code) {
            if (valve1 != null && (valveMask & (1 << valve1)) === 0) {
              nextVolume = nextVolume + flow.get(valve1Code)! * (time - 1);
              nextValveMask = nextValveMask | (1 << valve1);
            } else {
              continue;
            }
          }
          if (nextValve2Code === valve2Code) {
            if (valve2 != null && (nextValveMask & (1 << valve2)) === 0) {
              nextVolume = nextVolume + flow.get(valve2Code)! * (time - 1);
              nextValveMask = nextValveMask | (1 << valve2);
            } else {
              continue;
            }
          }
          updateDynValue(newDyn, nextValve1Code, nextValve2Code, nextValveMask, nextVolume);
        }
      }
    }
  }
  console.log(`Time: ${time} size: ${sizeCounter}`);
  dyn = newDyn;
}

let maxVolume = 0;
for (const valveCode of dyn.keys()) {
  for (const [_, volume] of dyn.get(valveCode)!.entries()) {
    if (maxVolume < volume) {
      maxVolume = volume;
    }
  }
}
console.log(maxVolume);
