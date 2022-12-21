import { open } from 'node:fs/promises';

type OpFunc = (a: number, b: number) => number;

type Ops = {
  [key: string]: OpFunc;
}
const ops = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
} satisfies Ops;
type OpKey = keyof (typeof ops);
const getArg1 = {
  '+': (res, b) => res - b,
  '-': (res, b) => res + b,
  '*': (res, b) => res / b,
  '/': (res, b) => res * b,
} satisfies Ops;
const getArg2 = {
  '+': (res, a) => res - a,
  '-': (res, a) => a - res,
  '*': (res, a) => res / a,
  '/': (res, a) => a / res,
} satisfies Ops;

function wrapOp(func: OpFunc, op1: number | string, op2: number | string): number | string {
  if (typeof op1 === 'string' && typeof op2 === 'string') {
    throw new Error('kill all humans');
  }
  if (typeof op1 === 'string') {
    return op1;
  }
  if (typeof op2 === 'string') {
    return op2;
  }
  return func(op1, op2);
}

class Monkey {
  kind!: 'single' | 'op';
  name!: string;
  private value?: number | string;
  public op1?: string;
  public op2?: string;
  private func?: OpFunc;
  private getArg1?: OpFunc;
  private getArg2?: OpFunc;

  private constructor() { }

  static single(name: string, value: number): Monkey {
    const result = new Monkey();
    result.kind = 'single';
    result.name = name;
    result.value = name === 'humn' ? 'humn' : value;
    return result;
  }

  static op(name: string, op1: string, op2: string, opKey: OpKey): Monkey {
    const result = new Monkey();
    result.kind = 'op';
    result.name = name;
    result.op1 = op1;
    result.op2 = op2;
    result.func = ops[opKey];
    result.getArg1 = getArg1[opKey];
    result.getArg2 = getArg2[opKey];
    return result;
  }

  calculate(monkeys: Map<string, Monkey>): number | string {
    if (this.value == null) {
      const op1 = monkeys.get(this.op1!)!.calculate(monkeys);
      const op2 = monkeys.get(this.op2!)!.calculate(monkeys);
      this.value = wrapOp(this.func!, op1, op2);
    }
    return this.value;
  }

  reverse(monkeys: Map<string, Monkey>, result: number): number {
    if (this.name === 'humn') {
      return result;
    }
    if (this.kind !== 'op') {
      throw new Error('too OP');
    }
    const op1 = monkeys.get(this.op1!)!.calculate(monkeys);
    const op2 = monkeys.get(this.op2!)!.calculate(monkeys);
    if (op1 === 'humn') {
      const res1 = this.getArg1!(result, op2 as number);
      return monkeys.get(this.op1!)!.reverse(monkeys, res1);
    } else if (op2 === 'humn') {
      const res2 = this.getArg2!(result, op1 as number);
      return monkeys.get(this.op2!)!.reverse(monkeys, res2);
    }
    throw new Error('no humans to kill');
  }
}

const finput = await open('21.txt');
const monkeys = new Map<string, Monkey>();
for await (const line of finput.readLines()) {
  const m1 = line.match(/(\w{4}): (\d+)/);
  if (m1 != null) {
    const monkey = Monkey.single(m1[1], Number(m1[2]));
    monkeys.set(monkey.name, monkey);
    continue;
  }
  const m2 = line.match(/(\w{4}): (\w{4}) (.) (\w{4})/);
  if (m2 != null) {
    const monkey = Monkey.op(m2[1], m2[2], m2[4], m2[3] as OpKey);
    monkeys.set(monkey.name, monkey);
    continue;
  }
  throw new Error(`parse fail: ${line}`);
}
await finput.close();
const monkey1 = monkeys.get('root')!.op1!;
const monkey2 = monkeys.get('root')!.op2!;
const res1 = monkeys.get(monkey1)!.calculate(monkeys);
const res2 = monkeys.get(monkey2)!.calculate(monkeys);
console.log(res1, res2);
let x: number;
if (res1 === 'humn') {
  x = monkeys.get(monkey1)!.reverse(monkeys, res2 as number);
} else {
  x = monkeys.get(monkey2)!.reverse(monkeys, res1 as number);
}
console.log(x);
