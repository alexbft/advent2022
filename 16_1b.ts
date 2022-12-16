import { open } from 'node:fs/promises';

type DynMap = Map<string, Map<number, number>>;

function updateDynValue(map: DynMap, valveCode: string, valveMask: number, volume: number) {
  let maskMap = map.get(valveCode);
  if (maskMap == null) {
    maskMap = new Map();
    map.set(valveCode, maskMap);
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
updateDynValue(dyn, 'AA', 0, 0);
for (let time = 30; time > 0; --time) {
  const newDyn: DynMap = new Map();
  for (const valveCode of dyn.keys()) {
    const valve = valveByCode.get(valveCode);
    const maskMap = dyn.get(valveCode)!;
    const paths = pathMap.get(valveCode)!;
    for (const valveMask of maskMap.keys()) {
      const volume = maskMap.get(valveMask)!;
      if (valve != null && (valveMask & (1 << valve)) === 0) {
        const newVolume = volume + flow.get(valveCode)! * (time - 1);
        updateDynValue(newDyn, valveCode, (valveMask | (1 << valve)), newVolume);
      }
      for (const nextValveCode of paths) {
        updateDynValue(newDyn, nextValveCode, valveMask, volume);
      }
    }
  }
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
