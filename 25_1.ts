import { open } from 'fs/promises';

function getDigit(d: string): number {
  switch (d) {
    case '0':
      return 0;
    case '1':
      return 1;
    case '2':
      return 2;
    case '-':
      return -1;
    case '=':
      return -2;
    default:
      throw new Error(d);
  }
}

function toDecimal(s: string): number {
  let result = 0;
  let factor = 1;
  for (let digit = 0; digit < s.length; ++digit) {
    result += getDigit(s[s.length - 1 - digit]) * factor;
    factor *= 5;
  }
  return result;
}

function toSnafu(x: number): string {
  let result = '';
  while (x > 0) {
    const digit = (x + 2) % 5;
    result = '=-012'[digit] + result;
    x = Math.floor((x - (digit - 2)) / 5);
  }
  return result;
}

const finput = await open('25.txt');
let total = 0;
for await (const line of finput.readLines()) {
  total += toDecimal(line);
}
await finput.close();
const result = toSnafu(total);
console.log(result);
