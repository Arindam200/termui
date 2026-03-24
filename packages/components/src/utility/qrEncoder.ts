// ---------------------------------------------------------------------------
// Minimal QR Code encoder — Version 1 (21×21), Error Correction Level M
// Supports: Numeric, Alphanumeric, and Byte (Latin-1) modes.
// Reference: ISO/IEC 18004:2015
// ---------------------------------------------------------------------------

// GF(256) arithmetic for Reed-Solomon — lazy-initialised on first encode call
let gfExp: Uint8Array | null = null;
let gfLog: Uint8Array | null = null;

function getGF(): [Uint8Array, Uint8Array] {
  if (gfExp) return [gfExp, gfLog!];
  const exp = new Uint8Array(512);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x = x << 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255]!;
  gfExp = exp;
  gfLog = log;
  return [exp, log];
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const [exp, log] = getGF();
  return exp[(log[a]! + log[b]!) % 255]!;
}

function gfPoly(degree: number): Uint8Array {
  const [exp] = getGF();
  let p = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const q = new Uint8Array(p.length + 1);
    const alpha = exp[i]!;
    for (let j = 0; j < p.length; j++) {
      q[j] ^= p[j]!;
      q[j + 1] ^= gfMul(p[j]!, alpha);
    }
    p = q;
  }
  return p;
}

function rsEncode(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = gfPoly(ecCount);
  const msg = new Uint8Array(data.length + ecCount);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i]!;
    if (coef !== 0) {
      for (let j = 1; j <= ecCount; j++) {
        msg[i + j] ^= gfMul(gen[j]!, coef);
      }
    }
  }
  return msg.slice(data.length);
}

// Version 1 QR constants (21×21 matrix)
const VERSION = 1;
export const SIZE = 17 + VERSION * 4; // 21

// Data capacity: V1-M (Error Correction M) = 14 data codewords, 10 EC codewords
const DATA_CODEWORDS = 14;
const EC_CODEWORDS = 10;

function encodeData(text: string): Uint8Array {
  const ALNUM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
  const isNumeric = /^[0-9]*$/.test(text);
  const isAlphanumeric = text.split('').every((c) => ALNUM_CHARS.includes(c));

  const bits: number[] = [];

  function pushBits(value: number, count: number) {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((value >> i) & 1);
    }
  }

  if (isNumeric) {
    pushBits(0b0001, 4);
    pushBits(text.length, 10);
    for (let i = 0; i < text.length; i += 3) {
      const group = text.slice(i, i + 3);
      const val = parseInt(group, 10);
      pushBits(val, group.length === 3 ? 10 : group.length === 2 ? 7 : 4);
    }
  } else if (isAlphanumeric) {
    pushBits(0b0010, 4);
    pushBits(text.length, 9);
    for (let i = 0; i < text.length; i += 2) {
      if (i + 1 < text.length) {
        const v = ALNUM_CHARS.indexOf(text[i]!) * 45 + ALNUM_CHARS.indexOf(text[i + 1]!);
        pushBits(v, 11);
      } else {
        pushBits(ALNUM_CHARS.indexOf(text[i]!), 6);
      }
    }
  } else {
    const bytes = Array.from(text).map((c) => c.charCodeAt(0) & 0xff);
    pushBits(0b0100, 4);
    pushBits(bytes.length, 8);
    for (const b of bytes) pushBits(b, 8);
  }

  for (let i = 0; i < 4 && bits.length < DATA_CODEWORDS * 8; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < DATA_CODEWORDS * 8) {
    pushBits(padBytes[padIdx++ % 2]!, 8);
  }

  const codewords = new Uint8Array(DATA_CODEWORDS);
  for (let i = 0; i < DATA_CODEWORDS; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i * 8 + j] ?? 0);
    codewords[i] = byte;
  }
  return codewords;
}

export type Matrix = boolean[][];

function makeMatrix(): Matrix {
  return Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
}

function placeFinderPattern(matrix: Matrix, row: number, col: number) {
  const finder = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const mr = row + r;
      const mc = col + c;
      if (mr >= 0 && mr < SIZE && mc >= 0 && mc < SIZE) {
        matrix[mr]![mc] = finder[r]![c] === 1;
      }
    }
  }
}

function placeTimingPatterns(matrix: Matrix) {
  for (let i = 8; i < SIZE - 8; i++) {
    matrix[6]![i] = i % 2 === 0;
    matrix[i]![6] = i % 2 === 0;
  }
}

function placeDarkModule(matrix: Matrix) {
  matrix[SIZE - 8]![8] = true;
}

function buildFunctionMask(matrix: Matrix): boolean[][] {
  const mask = makeMatrix();
  const setRegion = (r: number, c: number, h: number, w: number) => {
    for (let dr = 0; dr < h; dr++)
      for (let dc = 0; dc < w; dc++)
        if (r + dr >= 0 && r + dr < SIZE && c + dc >= 0 && c + dc < SIZE)
          mask[r + dr]![c + dc] = true;
  };
  setRegion(0, 0, 8, 8);
  setRegion(0, SIZE - 8, 8, 8);
  setRegion(SIZE - 8, 0, 8, 8);
  for (let i = 0; i < SIZE; i++) {
    mask[6]![i] = true;
    mask[i]![6] = true;
  }
  for (let i = 0; i < 9; i++) {
    mask[i]![8] = true;
    mask[8]![i] = true;
  }
  for (let i = SIZE - 8; i < SIZE; i++) {
    mask[8]![i] = true;
    mask[i]![8] = true;
  }
  return mask;
}

const FORMAT_STRINGS: Record<number, number> = {
  0: 0b101010000010010,
  1: 0b101000100100101,
  2: 0b101111001111100,
  3: 0b101101101001011,
  4: 0b100010111111001,
  5: 0b100000011001110,
  6: 0b100111110010111,
  7: 0b100101010100000,
};

function placeFormatInfo(matrix: Matrix, maskPattern: number) {
  const fmt = FORMAT_STRINGS[maskPattern] ?? FORMAT_STRINGS[0]!;
  const bits15 = Array.from({ length: 15 }, (_, i) => (fmt >> (14 - i)) & 1);
  const positions = [
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],
    [7, 8],
    [8, 8],
    [8, 7],
    [8, 5],
    [8, 4],
    [8, 3],
    [8, 2],
    [8, 1],
    [8, 0],
  ];
  positions.forEach(([r, c], i) => {
    matrix[r!]![c!] = bits15[i] === 1;
  });
  const positions2 = [
    [8, SIZE - 1],
    [8, SIZE - 2],
    [8, SIZE - 3],
    [8, SIZE - 4],
    [8, SIZE - 5],
    [8, SIZE - 6],
    [8, SIZE - 7],
    [8, SIZE - 8],
  ];
  positions2.forEach(([r, c], i) => {
    matrix[r!]![c!] = bits15[i] === 1;
  });
  const positions3 = [
    [SIZE - 7, 8],
    [SIZE - 6, 8],
    [SIZE - 5, 8],
    [SIZE - 4, 8],
    [SIZE - 3, 8],
    [SIZE - 2, 8],
    [SIZE - 1, 8],
  ];
  positions3.forEach(([r, c], i) => {
    matrix[r!]![c!] = bits15[8 + i] === 1;
  });
}

function placeData(matrix: Matrix, funcMask: boolean[][], bits: number[]) {
  let idx = 0;
  let goingUp = true;
  for (let col = SIZE - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    for (let rowStep = 0; rowStep < SIZE; rowStep++) {
      const row = goingUp ? SIZE - 1 - rowStep : rowStep;
      for (let dc = 0; dc <= 1; dc++) {
        const c = col - dc;
        if (funcMask[row]![c]) continue;
        matrix[row]![c] = (bits[idx] ?? 0) === 1;
        idx++;
      }
    }
    goingUp = !goingUp;
  }
}

function applyMask(matrix: Matrix, funcMask: boolean[][], pattern: number) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (funcMask[r]![c]) continue;
      let invert = false;
      switch (pattern) {
        case 0:
          invert = (r + c) % 2 === 0;
          break;
        case 1:
          invert = r % 2 === 0;
          break;
        case 2:
          invert = c % 3 === 0;
          break;
        case 3:
          invert = (r + c) % 3 === 0;
          break;
        case 4:
          invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
          break;
        case 5:
          invert = ((r * c) % 2) + ((r * c) % 3) === 0;
          break;
        case 6:
          invert = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
        case 7:
          invert = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
      }
      if (invert) matrix[r]![c] = !matrix[r]![c];
    }
  }
}

function scorePenalty(matrix: Matrix): number {
  let penalty = 0;
  for (let r = 0; r < SIZE; r++) {
    for (const isRow of [true, false]) {
      let run = 1;
      for (let i = 1; i < SIZE; i++) {
        const prev = isRow ? matrix[r]![i - 1] : matrix[i - 1]![r];
        const cur = isRow ? matrix[r]![i] : matrix[i]![r];
        if (cur === prev) {
          run++;
          if (run === 5) penalty += 3;
          else if (run > 5) penalty += 1;
        } else {
          run = 1;
        }
      }
    }
  }
  for (let r = 0; r < SIZE - 1; r++) {
    for (let c = 0; c < SIZE - 1; c++) {
      const v = matrix[r]![c];
      if (v === matrix[r]![c + 1] && v === matrix[r + 1]![c] && v === matrix[r + 1]![c + 1]) {
        penalty += 3;
      }
    }
  }
  return penalty;
}

export function generateQR(text: string): Matrix {
  const capped = text.slice(0, 17);
  const dataBytes = encodeData(capped);
  const ecBytes = rsEncode(dataBytes, EC_CODEWORDS);

  const allBytes = new Uint8Array([...dataBytes, ...ecBytes]);
  const bits: number[] = [];
  for (const b of allBytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  }

  let bestMatrix: Matrix | null = null;
  let bestPenalty = Infinity;

  for (let maskPattern = 0; maskPattern < 8; maskPattern++) {
    const matrix = makeMatrix();
    placeFinderPattern(matrix, 0, 0);
    placeFinderPattern(matrix, 0, SIZE - 7);
    placeFinderPattern(matrix, SIZE - 7, 0);
    placeTimingPatterns(matrix);
    placeDarkModule(matrix);

    const funcMask = buildFunctionMask(matrix);
    placeData(matrix, funcMask, bits);
    applyMask(matrix, funcMask, maskPattern);
    placeFormatInfo(matrix, maskPattern);

    const p = scorePenalty(matrix);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestMatrix = matrix;
    }
  }

  return bestMatrix!;
}
