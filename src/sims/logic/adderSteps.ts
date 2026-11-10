import type { SimBuild, SimStep } from '@/engine/types';
import { parseBinary, fromBitsUnsigned } from './bits';
import { claCarries, rippleColumns } from './adders';

export interface AdderState {
  width: number;
  A: string;
  B: string;
  Bx: string;
  M: number;
  carries: (number | null)[];
  P: (number | null)[];
  G: (number | null)[];
  sum: string;
}

export interface RippleInput {
  a: string;
  b: string;
  width: number;
  subtract: boolean;
}

function padTo(text: string, width: number): string | null {
  const bits = parseBinary(text);
  if (!bits) return null;
  if (bits.length > width) return null;
  return bits.padStart(width, '0');
}

export function buildRipple(input: RippleInput): SimBuild<AdderState> {
  const { width, subtract } = input;
  if (width < 2 || width > 8) return { steps: [], error: 'Choose a width between 2 and 8 bits.' };
  const A = padTo(input.a, width);
  const B = padTo(input.b, width);
  if (!A) return { steps: [], error: `First operand must be binary digits only and at most ${width} bits.` };
  if (!B) return { steps: [], error: `Second operand must be binary digits only and at most ${width} bits.` };

  const M = subtract ? 1 : 0;
  const Bx = B.split('')
    .map((c) => Number(c) ^ M)
    .join('');
  const full = rippleColumns(A, Bx, M);
  const carries: (number | null)[] = Array(width + 1).fill(null);
  carries[0] = M;
  const sum: string[] = Array(width).fill('?');
  const steps: SimStep<AdderState>[] = [];
  const snap = (): AdderState => ({ width, A, B, Bx, M, carries: [...carries], P: [], G: [], sum: sum.join('') });

  steps.push({
    title: 'Initial state',
    operation: subtract ? 'Mode M = 1: subtract, computed as A + B̅ + 1' : 'Mode M = 0: add',
    changed: [],
    explanation: subtract
      ? 'M = 1 complements every bit of B (XOR with M) and feeds M into the carry-in, so the adder computes A + (2s complement of B).'
      : 'M = 0 leaves B unchanged and the carry-in is 0.',
    state: snap(),
  });

  for (const col of full.columns) {
    const bitPos = width - 1 - col.index;
    sum[bitPos] = String(col.sum);
    carries[col.index + 1] = col.cout;
    steps.push({
      title: `Bit ${col.index} (from LSB)`,
      operation: `${col.a} + ${col.b} + ${col.cin} = ${col.cout}${col.sum}  (carry out, sum)`,
      condition: `Inputs: a=${col.a}, b⊕M=${col.b}, carry-in=${col.cin}`,
      changed: [`S${col.index}`, `C${col.index + 1}`],
      explanation: `Full-adder logic: sum = a ⊕ b ⊕ c = ${col.sum}; carry out = majority(a, b, c) = ${col.cout}. ${
        col.cout ? 'This carry ripples into the next column.' : 'No carry goes to the next column.'
      }`,
      state: snap(),
    });
  }

  const signedOverflow = full.columns[width - 1].cin ^ full.columns[width - 1].cout;
  steps.push({
    title: 'Result',
    operation: `S = ${full.sum}, carry out C${width} = ${full.carryOut}`,
    condition: signedOverflow ? 'Signed overflow: carry into and out of the sign position differ' : 'No signed overflow',
    changed: [],
    explanation: `Result ${full.sum} (unsigned ${fromBitsUnsigned(full.sum)}). ${
      subtract
        ? `In two's complement subtraction, a carry out of 1 means no borrow was needed.`
        : `The carry out from the top bit is ${full.carryOut}, which is the unsigned carry.`
    }`,
    state: { ...snap(), sum: full.sum },
  });
  return { steps };
}

export function buildCla(a: string, b: string, cin: number): SimBuild<AdderState> {
  const width = 4;
  const A = padTo(a, width);
  const B = padTo(b, width);
  if (!A) return { steps: [], error: 'First operand must be up to 4 binary digits.' };
  if (!B) return { steps: [], error: 'Second operand must be up to 4 binary digits.' };
  const aBits = A.split('').map(Number).reverse();
  const bBits = B.split('').map(Number).reverse();
  const P = aBits.map((x, i) => x ^ bBits[i]);
  const G = aBits.map((x, i) => x & bBits[i]);
  const C = claCarries(P, G, cin);
  const sumBits = P.map((p, i) => p ^ C[i]);
  const sum = sumBits.reverse().join('');
  const check = rippleColumns(A, B, cin);
  const steps: SimStep<AdderState>[] = [];
  const base = (): AdderState => ({
    width,
    A,
    B,
    Bx: B,
    M: 0,
    carries: Array(5).fill(null),
    P: Array(4).fill(null),
    G: Array(4).fill(null),
    sum: '????',
  });
  steps.push({
    title: 'Initial state',
    operation: `A = ${A}, B = ${B}, carry-in C0 = ${cin}`,
    changed: [],
    explanation: 'A carry-lookahead adder does not wait for each carry. It first computes, for every bit position, a propagate signal and a generate signal.',
    state: { ...base(), carries: [cin, null, null, null, null] },
  });
  steps.push({
    title: 'Step 1: propagate and generate',
    operation: 'Pi = Ai ⊕ Bi,  Gi = Ai · Bi',
    condition: `P = ${P.slice().reverse().join('')}  G = ${G.slice().reverse().join('')}`,
    changed: ['P', 'G'],
    explanation: 'Pi = 1 means a carry entering the bit passes through it. Gi = 1 means the bit creates a carry by itself. All bits compute these in parallel.',
    state: { ...base(), carries: [cin, null, null, null, null], P: [...P], G: [...G] },
  });
  steps.push({
    title: 'Step 2: lookahead carries',
    operation: 'C1 = G0 + P0·C0;  C2 = G1 + P1·G0 + P1·P0·C0;  …',
    condition: `C1=${C[1]} C2=${C[2]} C3=${C[3]} C4=${C[4]}`,
    changed: ['C1', 'C2', 'C3', 'C4'],
    explanation: 'Each carry is written directly in terms of P, G and C0, so every carry is available at the same time instead of rippling from bit to bit.',
    state: { ...base(), carries: [...C], P: [...P], G: [...G] },
  });
  steps.push({
    title: 'Step 3: sums',
    operation: 'Si = Pi ⊕ Ci',
    condition: `S = ${sum}`,
    changed: ['S'],
    explanation: 'Each sum bit is its propagate bit XOR the carry into that position. The result matches a ripple-carry adder on the same inputs.',
    state: { ...base(), carries: [...C], P: [...P], G: [...G], sum },
  });
  if (check.sum !== sum || check.carryOut !== C[4]) {
    return { steps: [], error: 'Internal check failed: lookahead result differs from ripple result.' };
  }
  return { steps };
}
