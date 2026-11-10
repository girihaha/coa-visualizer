import type { SimBuild, SimStep } from '@/engine/types';
import { fromBitsSigned, signedRange, toBits } from './bits';

export interface BoothState {
  n: number;
  M: string;
  A: string;
  Q: string;
  Qm1: string;
  iteration: number;
  pair: string;
  operation: string;
  product: string | null;
}

export interface BoothInput {
  m: string;
  q: string;
  n: number;
}

export function arithmeticRightShift(a: string, q: string): { A: string; Q: string; Qm1: string } {
  const sign = a[0];
  const A = sign + a.slice(0, -1);
  const Qm1 = q[q.length - 1];
  const Q = a[a.length - 1] + q.slice(0, -1);
  return { A, Q, Qm1 };
}

export function buildBooth(input: BoothInput): SimBuild<BoothState> {
  const { n } = input;
  if (!Number.isInteger(n) || n < 2 || n > 8) {
    return { steps: [], error: 'Choose a register width between 2 and 8 bits.' };
  }
  const [lo, hi] = signedRange(n);
  const parse = (label: string, text: string) => {
    const t = text.trim();
    if (!/^[+-]?\d+$/.test(t)) return `${label} must be a whole number such as 5 or -3.`;
    const v = BigInt(t);
    if (v < lo || v > hi) return `${label} must be between ${lo} and ${hi} for ${n}-bit two's complement.`;
    return null;
  };
  const mErr = parse('Multiplicand M', input.m);
  if (mErr) return { steps: [], error: mErr };
  const qErr = parse('Multiplier Q', input.q);
  if (qErr) return { steps: [], error: qErr };

  const w = n + 1;
  const M = toBits(BigInt(input.m.trim()), w);
  let A = '0'.repeat(w);
  let Q = toBits(BigInt(input.q.trim()), n);
  let Qm1 = '0';
  const steps: SimStep<BoothState>[] = [];
  const snap = (iteration: number, pair: string, operation: string, product: string | null = null): BoothState => ({
    n,
    M,
    A,
    Q,
    Qm1,
    iteration,
    pair,
    operation,
    product,
  });

  steps.push({
    title: 'Initial state',
    operation: 'A = 0, Q = multiplier, Q-1 = 0, M = multiplicand',
    changed: [],
    explanation: `M = ${input.m.trim()} and Q = ${input.q.trim()} are stored as two's complement. A and M use ${w} bits (one extra sign bit) so that A ± M cannot overflow. Q-1 starts at 0.`,
    state: snap(0, '--', '—'),
  });

  for (let i = 1; i <= n; i++) {
    const pair = Q[n - 1] + Qm1;
    let operation: string;
    let explanation: string;
    if (pair === '01') {
      operation = 'A ← A + M';
      explanation = 'Q0 Q-1 = 01 marks the end of a run of 1s in the multiplier, so M is added to A.';
    } else if (pair === '10') {
      operation = 'A ← A − M';
      explanation = 'Q0 Q-1 = 10 marks the start of a run of 1s in the multiplier, so M is subtracted from A.';
    } else {
      operation = 'No operation';
      explanation = `Q0 Q-1 = ${pair} means the multiplier bits do not change here, so A is left as it is.`;
    }
    steps.push({
      title: `Iteration ${i}: inspect pair`,
      operation: `Inspect Q0 Q-1 = ${pair}`,
      condition: `Q0 = ${Q[n - 1]}, Q-1 = ${Qm1}`,
      changed: [],
      explanation: `${explanation} The decision is shown before any register changes.`,
      state: snap(i - 1, pair, operation),
    });

    if (pair === '01' || pair === '10') {
      const before = A;
      const mValue = fromBitsSigned(M);
      const sum = fromBitsSigned(before) + (pair === '01' ? mValue : -mValue);
      A = toBits(sum, w);
      steps.push({
        title: `Iteration ${i}: arithmetic`,
        operation,
        condition: `A ${before} → ${A}`,
        changed: ['A'],
        explanation: `A = ${fromBitsSigned(before)} ${pair === '01' ? '+' : '−'} ${mValue < 0n ? `(${mValue})` : mValue} = ${sum}, stored as ${A}.`,
        state: snap(i - 1, pair, operation),
      });
    }

    const shifted = arithmeticRightShift(A, Q);
    A = shifted.A;
    Q = shifted.Q;
    Qm1 = shifted.Qm1;
    steps.push({
      title: `Iteration ${i}: arithmetic right shift`,
      operation: 'Arithmetic right shift of A, Q, Q-1',
      condition: `Sign bit ${A[0]} of A is copied into the vacated left bit`,
      changed: ['A', 'Q', 'Q-1'],
      explanation: `The combined register A Q Q-1 moves one place right. The sign bit of A is repeated so the value stays signed. The old Q0 becomes the new Q-1.`,
      state: snap(i, pair, operation),
    });
  }

  const productBits = A.slice(1) + Q;
  const product = fromBitsSigned(productBits);
  const expected = BigInt(input.m.trim()) * BigInt(input.q.trim());
  const ok = product === expected;
  steps.push({
    title: 'Result',
    operation: `Product = A Q = ${productBits}`,
    condition: `Signed ${2 * n}-bit value = ${product}`,
    changed: [],
    explanation: `After ${n} iterations, A and Q together form the ${2 * n}-bit product (the extra sign bit of A is dropped). ${
      ok ? `Direct check: ${input.m.trim()} × ${input.q.trim()} = ${expected}, which matches.` : `Direct check: ${input.m.trim()} × ${input.q.trim()} = ${expected}, which does not match.`
    }`,
    state: snap(n, '--', 'Done', productBits),
  });

  return { steps };
}
