import type { SimBuild, SimStep } from '@/engine/types';
import { parseBinary, fromBitsUnsigned } from './bits';
import { rippleColumns } from './adders';

export interface CarrySaveState {
  width: number;
  rows: string[];
  label: string;
  round: number;
  finalSum: string | null;
}

export function parseSummands(text: string): { summands: string[]; error?: string } {
  const parts = text
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 3) return { summands: [], error: 'Enter at least three binary summands separated by commas.' };
  if (parts.length > 6) return { summands: [], error: 'Enter at most six summands.' };
  const bits = parts.map((p) => parseBinary(p));
  if (bits.some((b) => b === null)) return { summands: [], error: 'Summands may contain only the digits 0 and 1.' };
  const w = bits[0]!.length;
  if (bits.some((b) => b!.length !== w)) return { summands: [], error: 'All summands must have the same number of bits.' };
  if (w > 8) return { summands: [], error: 'Summands may have at most 8 bits.' };
  return { summands: bits as string[] };
}

export function buildCarrySave(summandsText: string): SimBuild<CarrySaveState> {
  const { summands, error } = parseSummands(summandsText);
  if (error) return { steps: [], error };
  const w = summands[0].length;
  const W = w + summands.length;
  let rows = summands.map((s) => s.padStart(W, '0'));
  const expected = summands.reduce((acc, s) => acc + fromBitsUnsigned(s), 0n);
  const steps: SimStep<CarrySaveState>[] = [];
  const snap = (round: number, label: string, finalSum: string | null = null): CarrySaveState => ({
    width: W,
    rows: [...rows],
    label,
    round,
    finalSum,
  });

  steps.push({
    title: 'Initial summands',
    operation: `${summands.length} summands of ${w} bits`,
    condition: `Expected total = ${expected}`,
    changed: [],
    explanation: 'Carry-save addition does not propagate carries while reducing rows. Rows are reduced three at a time into one sum row and one carry row.',
    state: snap(0, 'Input rows'),
  });

  let round = 0;
  while (rows.length > 2) {
    round++;
    const [x, y, z, ...rest] = rows;
    const sumRow = x
      .split('')
      .map((_, i) => Number(x[i]) ^ Number(y[i]) ^ Number(z[i]))
      .join('');
    const majority = x
      .split('')
      .map((_, i) => (Number(x[i]) & Number(y[i])) | (Number(y[i]) & Number(z[i])) | (Number(x[i]) & Number(z[i])));
    const carryRow = majority.join('').slice(1) + '0';
    rows = [sumRow, carryRow, ...rest];
    steps.push({
      title: `Reduction round ${round}`,
      operation: 'Full adders on each column: sum row = x ⊕ y ⊕ z, carry row = majority(x, y, z) shifted left',
      condition: `Remaining rows: ${rows.length}`,
      changed: ['Sum row', 'Carry row'],
      explanation: 'Each column is a full adder: its sum bit stays in the sum row, and its carry bit moves one column to the left, into the carry row. No carry propagates across columns yet.',
      state: snap(round, `After round ${round}`),
    });
  }

  const finalRes = rippleColumns(rows[0], rows[1], 0);
  const total = fromBitsUnsigned(rows[0]) + fromBitsUnsigned(rows[1]);
  steps.push({
    title: 'Final carry-propagate addition',
    operation: `${rows[0]} + ${rows[1]} = ${finalRes.sum}`,
    condition: `Result = ${finalRes.sum} (${fromBitsUnsigned(finalRes.sum)})`,
    changed: ['Result'],
    explanation: `Only two rows remain, so an ordinary carry-propagating addition finishes the job. ${
      total === expected ? `The total ${expected} matches the sum of the original summands.` : 'The total does not match the summands.'
    }`,
    state: snap(round, 'Final addition', finalRes.sum),
  });
  return { steps };
}
