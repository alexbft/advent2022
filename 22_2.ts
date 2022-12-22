import { readFile } from 'node:fs/promises';

type Point = [number, number];
type Vec = Point;

interface EdgeInfo {
  cubeId: number;
  side: number;
}
type CubeInfo = EdgeInfo[];

class Matrix {
  public cells: number[];

  constructor(public readonly width: number, public readonly height: number) {
    this.cells = [];
  }

  get([x, y]: Point) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      throw new Error(`${x} ${y} ${this.width} ${this.height}`);
    }
    const result = this.cells[y * this.width + x];
    if (result != null) {
      return ' #.>v<^'[result];
    }
    return ' ';
  }

  set([x, y]: Point, v: string) {
    this.cells[y * this.width + x] = { ' ': 0, '#': 1, '.': 2 }[v]!;
  }

  set2([x, y]: Point, n: number) {
    this.cells[y * this.width + x] = n;
  }
}

const dirByRotation: Vec[] = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function add(p: Point, v: Vec): Point {
  return [p[0] + v[0], p[1] + v[1]];
}

function cubeId(cx: number, cy: number): number {
  return cy * widthCubes + cx;
}

function opposite(dir: number): number {
  return (dir + 2) % 4;
}

function normalizeDir(dir: number): number {
  return (dir + 4) % 4;
}

function addConnection(cubeInfo: CubeInfo[], c1Id: number, c1Side: number, c2Id: number, c2Side: number) {
  function _add(c1Id: number, c1Side: number, c2Id: number, c2Side: number) {
    const info = cubeInfo[c1Id][c1Side];
    if (info != null) {
      if (info.cubeId !== c2Id || info.side !== c2Side) {
        throw new Error('invalid cube');
      }
    } else {
      cubeInfo[c1Id][c1Side] = { cubeId: c2Id, side: c2Side };
      for (let i = 0; i < 4; ++i) {
        const j = (i + 1) % 4;
        if (cubeInfo[c1Id][i] != null && cubeInfo[c1Id][j] != null) {
          const info1 = cubeInfo[c1Id][i];
          const info2 = cubeInfo[c1Id][j];
          addConnection(cubeInfo, info1.cubeId, normalizeDir(info1.side - 1), info2.cubeId, normalizeDir(info2.side + 1));
        }
      }
    }
  }
  _add(c1Id, c1Side, c2Id, c2Side);
  _add(c2Id, c2Side, c1Id, c1Side);
}

const input = await readFile('22.txt', { encoding: 'utf-8' });
const rows = input.trimEnd().split('\n').map(row => row.trimEnd());
const partMap = rows.slice(0, -2);
const directions = rows.at(-1)!;
const width = Math.max(...partMap.map(row => row.length));
const height = partMap.length;
const cubeSize = width > height ? width / 4 : height / 4;
const map = new Matrix(width, height);
for (let y = 0; y < partMap.length; ++y) {
  for (let x = 0; x < partMap[y].length; ++x) {
    map.set([x, y], partMap[y][x]);
  }
}
const widthCubes = width / cubeSize;
const heightCubes = height / cubeSize;
const cubeInfo: CubeInfo[] = [];
for (let cy = 0; cy < heightCubes; ++cy) {
  for (let cx = 0; cx < widthCubes; ++cx) {
    cubeInfo.push([]);
  }
}
for (let cy = 0; cy < heightCubes; ++cy) {
  for (let cx = 0; cx < widthCubes; ++cx) {
    const cId = cubeId(cx, cy);
    const x = cx * cubeSize;
    const y = cy * cubeSize;
    if (map.get([x, y]) === ' ') {
      continue;
    }
    for (let i = 0; i < 4; ++i) {
      const dir = dirByRotation[i];
      const [ncx, ncy] = add([cx, cy], dir);
      const nx = ncx * cubeSize;
      const ny = ncy * cubeSize;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height && map.get([nx, ny]) !== ' ') {
        addConnection(cubeInfo, cId, i, cubeId(ncx, ncy), opposite(i));
      }
    }
  }
}

let startX = 0;
while (map.get([startX, 0]) === ' ') {
  ++startX;
}

const moves = new Matrix(width, height);
moves.cells = [...map.cells];
let position: Point = [startX, 0];
let rotation = 0;
const re = /(\d+)(\w)?/g;
let m: RegExpExecArray | null = null;
moves.set2(position, rotation + 3);
while (m = re.exec(directions)) {
  const [len, rot] = [Number(m[1]), m[2]];
  for (let i = 0; i < len; ++i) {
    const cx = Math.floor(position[0] / cubeSize);
    const cy = Math.floor(position[1] / cubeSize);
    const cId = cubeId(cx, cy);
    const localX = position[0] % cubeSize;
    const localY = position[1] % cubeSize;
    let [newLocalX, newLocalY] = add([localX, localY], dirByRotation[rotation]);
    let newCId = cId;
    let newRotation = rotation;
    if (newLocalX < 0 || newLocalY < 0 || newLocalX >= cubeSize || newLocalY >= cubeSize) {
      const info = cubeInfo[cId][rotation];
      newCId = info.cubeId;
      const side = info.side;
      newRotation = opposite(side);
      switch (rotation) {
        case 0:
          if (side === 0) {
            newLocalX = cubeSize - 1;
            newLocalY = cubeSize - 1 - localY;
          } else if (side === 1) {
            newLocalX = localY;
            newLocalY = cubeSize - 1;
          } else if (side === 2) {
            newLocalX = 0;
            newLocalY = localY;
          } else /*side === 3*/ {
            newLocalX = cubeSize - 1 - localY;
            newLocalY = 0;
          }
          break;
        case 1:
          if (side === 0) {
            newLocalX = cubeSize - 1;
            newLocalY = localX;
          } else if (side === 1) {
            newLocalX = cubeSize - 1 - localX;
            newLocalY = cubeSize - 1;
          } else if (side === 2) {
            newLocalX = 0;
            newLocalY = cubeSize - 1 - localX;
          } else /*side === 3*/ {
            newLocalX = localX;
            newLocalY = 0;
          }
          break;
        case 2:
          if (side === 0) {
            newLocalX = cubeSize - 1;
            newLocalY = localY;
          } else if (side === 1) {
            newLocalX = cubeSize - 1 - localY;
            newLocalY = cubeSize - 1;
          } else if (side === 2) {
            newLocalX = 0;
            newLocalY = cubeSize - 1 - localY;
          } else /*side === 3*/ {
            newLocalX = localY;
            newLocalY = 0;
          }
          break;
        case 3:
          if (side === 0) {
            newLocalX = cubeSize - 1;
            newLocalY = cubeSize - 1 - localX;
          } else if (side === 1) {
            newLocalX = localX;
            newLocalY = cubeSize - 1;
          } else if (side === 2) {
            newLocalX = 0;
            newLocalY = localX;
          } else /*side === 3*/ {
            newLocalX = cubeSize - 1 - localX;
            newLocalY = 0;
          }
          break;
        default:
          throw new Error();
      }
    }

    const ncx = newCId % widthCubes;
    const ncy = Math.floor(newCId / widthCubes);
    const nx = ncx * cubeSize + newLocalX;
    const ny = ncy * cubeSize + newLocalY;
    if (map.get([nx, ny]) === '.') {
      position = [nx, ny];
      rotation = newRotation;
      moves.set2(position, 3 + rotation);
    } else {
      break;
    }
  }
  if (rot != null) {
    rotation = rotation + (rot === 'R' ? 1 : -1);
    rotation = (rotation + 4) % 4;
    moves.set2(position, 3 + rotation);
  }
}
// let buf = '';
// for (let y = 0; y < height; ++y) {
//   buf += '\n';
//   for (let x = 0; x < width; ++x) {
//     buf += moves.get([x, y]);
//   }
// }
// console.log(buf);
console.log(position, rotation, (position[1] + 1) * 1000 + (position[0] + 1) * 4 + rotation);
