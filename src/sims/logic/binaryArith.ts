import type { SimBuild, SimStep } from '@/engine/types';
import { fromBitsSigned, fromBitsUnsigned, parseBinary } from './bits';
import { rippleColumns, type Column } from './adders';

export type ArithMode = 'add' | 'sub-1s' | 'sub-2s';

export interface BinaryArithState {
  width: number;
  A: string;
  B: string;
  Bc: string;
  carryIn: number;
  columns: Column[];
  sum: string;
  carryOut: number | null;
  endAround: boolean;
  overflow: boolean | null;
  result: string | null;
}

const MODE_LABEL: Record<ArithMode, string> = {
  add: 'Addition A + B',
  'sub-1s': "Subtraction A − B by 1's complement",
  'sub-2s': "Subtraction A − B by 2's complement",
};

export function buildBinaryArith(a: string, b: string, width: number, mode: ArithMode): SimBuild<BinaryArithState> {
  if (width < 4 || width > 16) return { steps: [], error: 'Choose a width between 4 and 16 bits.' };
  const pa = parseBinary(a);
  const pb = parseBinary(b);
  if (!pa || !pb) return { steps: [], error: 'Operands must contain only the digits 0 and 1.' };
  if (pa.length > width || pb.length > width) {
    return { steps: [], error: `Each operand must fit in ${width} bits. Shorten it or increase the width.` };
  }
  const A = pa.padStart(width, '0');
  const B = pb.padStart(width, '0');
  const sub = mode !== 'add';
  const Bc = sub ? B.replace(/[01]/g, (c) => (c === '0' ? '1' : '0')) : B;
  const cin = mode === 'sub-2s' ? 1 : 0;
  const pass = rippleColumns(A, Bc, cin);
  const msb = pass.columns[width - 1];
  const overflow = msb.cin ^ msb.cout ? true : false;

  const steps: SimStep<BinaryArithState>[] = [];
  const decA = `unsigned ${fromBitsUnsigned(A)}, signed ${fromBitsSigned(A)}`;
  const decB = `unsigned ${fromBitsUnsigned(B)}, signed ${fromBitsSigned(B)}`;
  const base = (): BinaryArithState => ({
    width,
    A,
    B,
    Bc,
    carryIn: cin,
    columns: [],
    sum: '?'.repeat(width),
    carryOut: null,
    endAround: false,
    overflow: null,
    result: null,
  });

  steps.push({
    title: 'Initial state',
    operation: MODE_LABEL[mode],
    condition: `A = ${A} (${decA})  B = ${B} (${decB})`,
    changed: [],
    explanation: `Both operands are aligned on the least significant bit and written with ${width} bits. Values are shown as unsigned and as signed two's complement.`,
    state: base(),
  });

  if (sub) {
    steps.push({
      title: "Complement B",
      operation: `B̅ = NOT B = ${Bc}`,
      condition: mode === 'sub-2s' ? "Two's complement step 1 of 2" : "One's complement of B",
      changed: ['B̅'],
      explanation: 'Every bit of B is inverted. Subtracting B is then done by adding its complement.',
      state: { ...base(), Bc },
    });
  }
  if (mode === 'sub-2s') {
    steps.push({
      title: 'Carry-in of 1',
      operation: 'Carry-in C0 = 1',
      condition: "Two's complement step 2 of 2: adding 1 to the complement",
      changed: ['C0'],
      explanation: "Adding the 1 that completes the two's complement is done through the carry into the least significant bit.",
      state: { ...base(), Bc },
    });
  }

  let sumSoFar = '?'.repeat(width);
  const cols: Column[] = [];
  for (const col of pass.columns) {
    cols.push(col);
    const bitPos = width - 1 - col.index;
    sumSoFar = sumSoFar.slice(0, bitPos) + col.sum + sumSoFar.slice(bitPos + 1);
    steps.push({
      title: `Column ${col.index} (LSB = 0)`,
      operation: `${col.a} + ${col.b} + ${col.cin} = ${col.cout}${col.sum}`,
      condition: `Carry-in ${col.cin} → carry-out ${col.cout}`,
      changed: [`Sum bit ${col.index}`, col.cout ? `Carry into column ${col.index + 1}` : 'No carry'],
      explanation: `${col.a} and ${col.b} with carry-in ${col.cin} give sum ${col.sum}. ${
        col.cout ? 'Carry out is 1 and moves to the next column.' : 'Carry out is 0.'
      }`,
      state: { ...base(), Bc, columns: [...cols], sum: sumSoFar, carryOut: col.cout },
    });
  }

  let result = pass.sum;
  let carryOut = pass.carryOut;
  let endAround = false;
  if (mode === 'sub-1s' && pass.carryOut === 1) {
    endAround = true;
    const again = rippleColumns(pass.sum, '0'.repeat(width), 1);
    result = again.sum;
    carryOut = again.carryOut;
    steps.push({
      title: 'End-around carry',
      operation: `Add the carry out (1) back to the least significant bit`,
      condition: `${pass.sum} + 1 = ${result}`,
      changed: ['Result', 'End-around carry'],
      explanation: "In one's complement, the carry out of the top bit is wrapped back to the bottom. Without this step the result would be one too small.",
      state: { ...base(), Bc, columns: pass.columns, sum: pass.sum, carryOut: 1, endAround: true, overflow, result },
    });
  }

  const resultSigned = fromBitsSigned(result);
  const aSigned = fromBitsSigned(A);
  const bSigned = fromBitsSigned(B);
  const expected = sub ? aSigned - bSigned : aSigned + bSigned;
  const overflowText = overflow
    ? 'Signed overflow: the result does not fit in the signed range.'
    : 'No signed overflow.';
  steps.push({
    title: 'Result',
    operation: `Result = ${result}`,
    condition: `Unsigned ${fromBitsUnsigned(result)}, signed ${resultSigned}`,
    changed: ['Result'],
    explanation: `Unsigned carry out is ${carryOut}. ${
      mode === 'add'
        ? 'A carry out of 1 means the unsigned sum needed more bits than the width.'
        : mode === 'sub-2s'
          ? 'For subtraction a carry out of 1 means no borrow was needed (A ≥ B as unsigned).'
          : 'For subtraction a carry out of 1 means no borrow (A ≥ B as unsigned), and it was added back as an end-around carry.'
    } ${overflowText} ${
      mode === 'sub-1s' && !endAround && result === '1'.repeat(width) && A === B
        ? 'An all-ones result after an equal-operand subtraction is negative zero in one\'s complement.'
        : ''
    } ${
      !overflow && resultSigned === expected
        ? `Check: ${aSigned} ${sub ? '−' : '+'} ${bSigned} = ${expected}.`
        : overflow
          ? `The true signed answer ${expected} is outside ${width}-bit range.`
          : ''
    }`,
    state: { ...base(), Bc, columns: pass.columns, sum: pass.sum, carryOut, endAround, overflow, result },
  });

  return { steps };
}
