import { open } from 'node:fs/promises';

const finput = await open('20.txt');
const input = await finput.readFile({ encoding: 'utf-8' });
await finput.close();
const a = input.trim().split('\n').map(s => Number(s.trim()));
const len = a.length;
const aPos = a.map((x, i) => [x * 811589153, i]);
for (let rnd = 0; rnd < 10; ++rnd) {
  for (let i = 0; i < len; ++i) {
    const index = aPos.findIndex(([, index]) => index === i);
    const item = aPos[index]
    let newIndex = (index + item[0]) % (len - 1);
    if (newIndex < 0) {
      newIndex += (len - 1);
    }
    aPos.splice(index, 1);
    aPos.splice(newIndex, 0, item);
  }
}
const zeroIndex = aPos.findIndex(([a,]) => a === 0);
const i1 = (zeroIndex + 1000) % len;
const i2 = (zeroIndex + 2000) % len;
const i3 = (zeroIndex + 3000) % len;
console.log(aPos[i1][0], aPos[i2][0], aPos[i3][0]);
console.log(aPos[i1][0] + aPos[i2][0] + aPos[i3][0]);

