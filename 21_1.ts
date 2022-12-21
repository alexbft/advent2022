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

class Monkey {
  kind!: 'single' | 'op';
  name!: string;
  private value?: number;
  private op1?: string;
  private op2?: string;
  private func?: OpFunc;

  private constructor() { }

  static single(name: string, value: number): Monkey {
    const result = new Monkey();
    result.kind = 'single';
    result.name = name;
    result.value = value;
    return result;
  }

  static op(name: string, op1: string, op2: string, func: OpFunc): Monkey {
    const result = new Monkey();
    result.kind = 'op';
    result.name = name;
    result.op1 = op1;
    result.op2 = op2;
    result.func = func;
    return result;
  }

  calculate(monkeys: Map<string, Monkey>): number {
    if (this.value == null) {
      const op1 = monkeys.get(this.op1!)!.calculate(monkeys);
      const op2 = monkeys.get(this.op2!)!.calculate(monkeys);
      this.value = this.func!(op1, op2);
    }
    return this.value;
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
    const monkey = Monkey.op(m2[1], m2[2], m2[4], ops[m2[3] as OpKey]);
    monkeys.set(monkey.name, monkey);
    continue;
  }
  throw new Error(`parse fail: ${line}`);
}
await finput.close();
console.log(monkeys.get('root')!.calculate(monkeys));
