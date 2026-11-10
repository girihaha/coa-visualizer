import type { SimBuild, SimStep } from '@/engine/types';
import { parseSignedInt, toBits } from './bits';

export type DivisionMode = 'restoring' | 'non-restoring';

export interface DivisionState {
  n: number;
  W: number;
  M: string;
  A: string;
  Q: string;
  iteration: number;
  operation: string;
  quotient: string;
  remainder: string | null;
}


export function buildDivision(dividend: string, divisor: string, n: number, mode: DivisionMode): SimBuild<DivisionState> {
  if (!Number.isInteger(n) || n < 2 || n > 8) return { steps: [], error: 'Choose a width between 2 and 8 bits.' };
  const d = parseSignedInt(dividend);
  const v = parseSignedInt(divisor);
  if (d === null || v === null) return { steps: [], error: 'Dividend and divisor must be whole numbers.' };
  const max = (1n << BigInt(n)) - 1n;
  if (d < 0n || v < 0n) return { steps: [], error: 'This division accepts only zero or positive values (unsigned).' };
  if (d > max || v > max) return { steps: [], error: `Dividend and divisor must fit in ${n} bits (0 to ${max}).` };
  if (v === 0n) return { steps: [], error: 'Division by zero is undefined. Choose a divisor of 1 or more.' };

  const W = n + 2;
  const Mv = Number(v);
  let A = 0;
  let Q = toBits(d, n);
  const label = mode === 'restoring' ? 'Restoring' : 'Non-restoring';
  const bitsA = () => toBits(A, W);
  const steps: SimStep<DivisionState>[] = [];
  const snap = (iteration: number, operation: string, quotient = '', remainder: string | null = null): DivisionState => ({
    n,
    W,
    M: toBits(Mv, W),
    A: bitsA(),
    Q,
    iteration,
    operation,
    quotient,
    remainder,
  });

  steps.push({
    title: 'Initial state',
    operation: `A = 0, Q = dividend ${d}, M = divisor ${v}`,
    changed: [],
    explanation: `${label} division of ${d} by ${v} with ${n}-bit registers. A holds the partial remainder and Q holds the dividend, which becomes the quotient bit by bit. A and M have ${W} bits so the shifted partial remainder never overflows.`,
    state: snap(0, '—'),
  });

  let quotientBits = '';
  for (let i = 1; i <= n; i++) {
    const msb = Q[0];
    A = 2 * A + Number(msb);
    Q = Q.slice(1) + '0';
    steps.push({
      title: `Iteration ${i}: shift left`,
      operation: 'Shift A and Q left as one register',
      condition: `Bit ${msb} from Q enters A`,
      changed: ['A', 'Q'],
      explanation: `The partial remainder A and the dividend bits in Q move one place left together. The vacated low bit of Q will hold the new quotient bit.`,
      state: snap(i - 1, 'shift'),
    });

    if (mode === 'restoring') {
      A = A - Mv;
      steps.push({
        title: `Iteration ${i}: trial subtract`,
        operation: `A ← A − M = ${A}`,
        condition: A < 0 ? 'Result is negative, so the divisor does not fit here' : 'Result is zero or positive, so the divisor fits here',
        changed: ['A'],
        explanation: `Subtract the divisor ${v} from the shifted partial remainder. The sign of the result decides the next action.`,
        state: snap(i - 1, 'subtract'),
      });
      if (A < 0) {
        A = A + Mv;
        Q = Q.slice(0, n - 1) + '0';
        quotientBits += '0';
        steps.push({
          title: `Iteration ${i}: restore`,
          operation: `A ← A + M (restore) = ${A}; quotient bit q${n - i} = 0`,
          condition: 'Negative trial result is undone',
          changed: ['A', 'Q'],
          explanation: 'The trial subtraction was negative, so the divisor is added back and this quotient bit is 0.',
          state: snap(i, 'restore', quotientBits),
        });
      } else {
        Q = Q.slice(0, n - 1) + '1';
        quotientBits += '1';
        steps.push({
          title: `Iteration ${i}: keep result`,
          operation: `Quotient bit q${n - i} = 1; A stays ${A}`,
          condition: 'Trial result is kept',
          changed: ['Q'],
          explanation: 'The subtraction did not go negative, so it is kept and the quotient bit is 1.',
          state: snap(i, 'keep', quotientBits),
        });
      }
    } else {
      const previousNegative = A < 0;
      A = previousNegative ? A + Mv : A - Mv;
      const opText = previousNegative ? 'A ← A + M' : 'A ← A − M';
      steps.push({
        title: `Iteration ${i}: add or subtract`,
        operation: `${opText} = ${A}`,
        condition: previousNegative ? 'Previous partial remainder was negative, so add M' : 'Previous partial remainder was non-negative, so subtract M',
        changed: ['A'],
        explanation: 'Non-restoring division never undoes a trial step. The sign of the partial remainder before this step selects add or subtract.',
        state: snap(i - 1, opText),
      });
      const bit = A >= 0 ? '1' : '0';
      Q = Q.slice(0, n - 1) + bit;
      quotientBits += bit;
      steps.push({
        title: `Iteration ${i}: set quotient bit`,
        operation: `q${n - i} = ${bit} (A is ${A >= 0 ? 'non-negative' : 'negative'})`,
        condition: `Quotient so far = ${quotientBits}`,
        changed: ['Q'],
        explanation: 'The new quotient bit is 1 when the partial remainder is non-negative after the step, and 0 otherwise.',
        state: snap(i, 'set', quotientBits),
      });
    }
  }

  if (mode === 'non-restoring' && A < 0) {
    A = A + Mv;
    steps.push({
      title: 'Final correction',
      operation: `A ← A + M = ${A}`,
      condition: 'Final partial remainder is negative',
      changed: ['A'],
      explanation: 'A negative remainder after the last iteration is corrected by adding the divisor once.',
      state: snap(n, 'correct', quotientBits),
    });
  }

  const quotient = BigInt('0b' + quotientBits);
  const remainder = BigInt(A);
  const ok = d === v * quotient + remainder && remainder >= 0n && remainder < v;
  steps.push({
    title: 'Result',
    operation: `Quotient = ${quotient}, Remainder = ${remainder}`,
    condition: `Check: ${v} × ${quotient} + ${remainder} = ${v * quotient + remainder}`,
    changed: [],
    explanation: `The quotient bits form ${quotientBits}. ${
      ok
        ? `The identity dividend = divisor × quotient + remainder holds, and the remainder is smaller than the divisor.`
        : 'The identity check failed.'
    }`,
    state: snap(n, 'done', quotientBits, bitsA()),
  });
  return { steps };
}
