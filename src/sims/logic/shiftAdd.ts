import type { SimBuild, SimStep } from '@/engine/types';
import { fromBitsUnsigned, parseSignedInt, toBits } from './bits';

export interface ShiftAddState {
  n: number;
  M: string;
  A: string;
  Q: string;
  carry: string;
  iteration: number;
  decision: string;
  product: string | null;
}

export function buildShiftAdd(multiplicand: string, multiplier: string, n: number): SimBuild<ShiftAddState> {
  if (!Number.isInteger(n) || n < 2 || n > 8) return { steps: [], error: 'Choose a width between 2 and 8 bits.' };
  const m = parseSignedInt(multiplicand);
  const q = parseSignedInt(multiplier);
  const max = (1n << BigInt(n)) - 1n;
  if (m === null || q === null) return { steps: [], error: 'Both operands must be whole numbers.' };
  if (m < 0n || q < 0n) return { steps: [], error: 'This unsigned algorithm accepts only zero or positive values.' };
  if (m > max || q > max) return { steps: [], error: `Operands must fit in ${n} bits (0 to ${max}).` };

  const M = toBits(m, n);
  let A = '0'.repeat(n);
  let Q = toBits(q, n);
  let carry = '0';
  const steps: SimStep<ShiftAddState>[] = [];
  const snap = (iteration: number, decision: string, product: string | null = null): ShiftAddState => ({
    n,
    M,
    A,
    Q,
    carry,
    iteration,
    decision,
    product,
  });

  steps.push({
    title: 'Initial state',
    operation: 'A = 0, Q = multiplier, M = multiplicand',
    changed: [],
    explanation: `Multiplicand M = ${m} and multiplier Q = ${q}, both ${n}-bit unsigned. The accumulator A starts at 0. The product will be ${2 * n} bits wide.`,
    state: snap(0, '—'),
  });

  for (let i = 1; i <= n; i++) {
    const q0 = Q[n - 1];
    steps.push({
      title: `Iteration ${i}: check Q0`,
      operation: `Inspect Q0 = ${q0}`,
      condition: q0 === '1' ? 'Q0 is 1, so the multiplicand is added' : 'Q0 is 0, so nothing is added',
      changed: [],
      explanation: 'Only the least significant multiplier bit decides whether a partial product is added in this iteration.',
      state: snap(i - 1, q0),
    });
    if (q0 === '1') {
      const sum = fromBitsUnsigned(A) + fromBitsUnsigned(M);
      A = toBits(sum & max, n);
      carry = sum > max ? '1' : '0';
      steps.push({
        title: `Iteration ${i}: add`,
        operation: 'A ← A + M',
        condition: `Carry out = ${carry}`,
        changed: ['A', 'carry'],
        explanation: `A + M = ${sum}. The low ${n} bits go back into A${carry === '1' ? ', and the carry out of the top bit is kept beside A' : ''}.`,
        state: snap(i - 1, q0),
      });
    }
    const newQ = A[n - 1] + Q.slice(0, n - 1);
    const newA = carry + A.slice(0, n - 1);
    A = newA;
    Q = newQ;
    carry = '0';
    steps.push({
      title: `Iteration ${i}: shift right`,
      operation: 'Shift carry, A, Q right by one bit',
      condition: `Bit moved from A into Q is ${newQ[0]}`,
      changed: ['A', 'Q', 'carry'],
      explanation: 'The combined register carry-A-Q shifts right. The carry enters the top of A, and the low bit of A moves into the top of Q. The multiplier bits that remain are the ones not yet used.',
      state: snap(i, q0),
    });
  }

  const product = A + Q;
  const check = m * q;
  steps.push({
    title: 'Result',
    operation: `Product = A Q = ${product} (binary)`,
    condition: `Decimal = ${fromBitsUnsigned(product)}`,
    changed: [],
    explanation: `After ${n} iterations the register pair holds the ${2 * n}-bit product. Direct check: ${m} × ${q} = ${check}, ${check === fromBitsUnsigned(product) ? 'which matches.' : 'which does not match.'}`,
    state: snap(n, '—', product),
  });
  return { steps };
}
