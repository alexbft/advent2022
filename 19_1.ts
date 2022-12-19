import { open } from 'fs/promises';

interface Blueprint {
  oreCost: number;
  clayCost: number;
  obsCost: number;
  obsCostClay: number;
  geodeCost: number;
  geodeCostObs: number;
  quality?: number;
}

interface GameState {
  ore: number;
  clay: number;
  obsidian: number;
  geodes: number;
  oreBots: number;
  clayBots: number;
  obsBots: number;
  geodeBots: number;
}

function key(s: GameState): string {
  return `${s.ore}_${s.clay}_${s.obsidian}_${s.oreBots}_${s.clayBots}_${s.obsBots}_${s.geodeBots}`;
}

function copy(s: GameState): GameState {
  return { ...s };
}

let bestResult = 0;
function produceAndSave(states: Map<string, GameState>, newState: GameState, prevState: GameState, timeLeft: number) {
  newState.ore += prevState.oreBots;
  newState.clay += prevState.clayBots;
  newState.obsidian += prevState.obsBots;
  newState.geodes += prevState.geodeBots;
  timeLeft -= 1;
  const lowerLimit = newState.geodes + timeLeft * newState.geodeBots;
  let upperLimit: number;
  if (timeLeft < 2) {
    upperLimit = lowerLimit;
  } else {
    upperLimit = lowerLimit + (timeLeft - 1) * (timeLeft - 2) / 2;
  }
  if (upperLimit < bestResult) {
    return;
  }
  if (bestResult < lowerLimit) {
    bestResult = lowerLimit;
    //console.log(`New best result! ${bestResult} ${JSON.stringify(newState)} time = ${32 - timeLeft}`);
  }
  const k = key(newState);
  const old = states.get(k);
  if (old == null || old.geodes < newState.geodes) {
    states.set(k, newState);
  }
}

const finput = await open('19.txt');
let blueprints: Blueprint[] = [];
const inputRe = /Blueprint \d+: Each ore robot costs (\d+) ore\. Each clay robot costs (\d+) ore\. Each obsidian robot costs (\d+) ore and (\d+) clay\. Each geode robot costs (\d+) ore and (\d+) obsidian\./;
for await (const line of finput.readLines()) {
  const m = line.match(inputRe)!;
  const [oreCost, clayCost, obsCost, obsCostClay, geodeCost, geodeCostObs] = m.slice(1).map(Number);
  blueprints.push({ oreCost, clayCost, obsCost, obsCostClay, geodeCost, geodeCostObs });
}
await finput.close();
for (let i = 0; i < blueprints.length; ++i) {
  const blueprint = blueprints[i];
  const start: GameState = { ore: 0, clay: 0, obsidian: 0, geodes: 0, oreBots: 1, clayBots: 0, obsBots: 0, geodeBots: 0 };
  let states = new Map<string, GameState>();
  states.set(key(start), start);
  const maxTime = 24;
  bestResult = 0;
  for (let time = 0; time < maxTime; ++time) {
    console.log(`Blueprint ${i + 1}, time: ${time} size: ${states.size} best: ${bestResult}`);
    const newStates = new Map<string, GameState>();
    for (const state of states.values()) {
      // Greedily produce geode bots. Other bots are optionally produced.
      if (state.obsidian >= blueprint.geodeCostObs && state.ore >= blueprint.geodeCost) {
        const newState = copy(state);
        newState.obsidian -= blueprint.geodeCostObs;
        newState.ore -= blueprint.geodeCost;
        newState.geodeBots += 1;
        produceAndSave(newStates, newState, state, maxTime - time);
      } else {
        if (state.clay >= blueprint.obsCostClay && state.ore >= blueprint.obsCost) {
          const newState = copy(state);
          newState.clay -= blueprint.obsCostClay;
          newState.ore -= blueprint.obsCost;
          newState.obsBots += 1;
          produceAndSave(newStates, newState, state, maxTime - time);
        }
        if (state.ore >= blueprint.oreCost) {
          const newState = copy(state);
          newState.ore -= blueprint.oreCost;
          newState.oreBots += 1;
          produceAndSave(newStates, newState, state, maxTime - time);
        }
        if (state.ore >= blueprint.clayCost) {
          const newState = copy(state);
          newState.ore -= blueprint.clayCost;
          newState.clayBots += 1;
          produceAndSave(newStates, newState, state, maxTime - time);
        }
        produceAndSave(newStates, copy(state), state, maxTime - time);
      }
    }
    states = newStates;
  }
  blueprint.quality = bestResult;
}
let result = 0;
for (let i = 0; i < blueprints.length; ++i) {
  console.log(`Blueprint ${i + 1}: ${blueprints[i].quality}`);
  result += (i + 1) * (blueprints[i].quality!);
}
console.log(result);
