import type { UnitId } from '@/content/curriculum';

export interface FormulaEntry {
  id: string;
  unit: UnitId;
  name: string;
  expression: string;
  notes: string;
  simulatorId?: string;
}

export const FORMULAS: FormulaEntry[] = [
  {
    id: 'positional',
    unit: 1,
    name: 'Positional value',
    expression: 'Value = sum over i of digit(i) x base^i',
    notes: 'Each digit is weighted by a power of its base. Fraction positions use negative powers.',
    simulatorId: 'base-conversion',
  },
  {
    id: 'address-bits',
    unit: 2,
    name: 'Address bits for N locations',
    expression: 'Address bits = ceil(log2 N)',
    notes: 'Assumes each location has one address (byte-addressable memory). Verify the unit convention on the slide before quoting a capacity.',
  },
  {
    id: 'twos-complement',
    unit: 1,
    name: 'Two\'s complement negation',
    expression: '-X = (complement of X) + 1',
    notes: 'Subtraction by complement adds the complement of B and a carry-in of 1.',
    simulatorId: 'binary-arith',
  },
  {
    id: 'ones-complement',
    unit: 1,
    name: 'One\'s complement subtraction',
    expression: 'A - B = A + (complement of B), then add any end-around carry',
    notes: 'The end-around carry is added back into the least significant bit.',
    simulatorId: 'binary-arith',
  },
  {
    id: 'booth-table',
    unit: 3,
    name: 'Booth decision table',
    expression: 'Pair (Q0, Q-1): 01 -> A = A + M; 10 -> A = A - M; 00 or 11 -> no operation; then arithmetic right shift of A, Q, Q-1',
    notes: 'Basic Booth procedure as presented in the Unit III material.',
    simulatorId: 'booth',
  },
  {
    id: 'ieee-bias',
    unit: 3,
    name: 'Biased exponent examples',
    expression: 'Single precision: 127 + 6 = 133; double precision: 1023 + 6 = 1029',
    notes: 'Worked bias examples from the Unit III slides. Format details are pending visual verification.',
  },
  {
    id: 'cla-generate',
    unit: 3,
    name: 'Generate and propagate',
    expression: 'G(i) = A(i) AND B(i); P(i) = A(i) XOR B(i)',
    notes: 'Operational rule for the simulator; confirm the printed expressions against the Unit III slides.',
    simulatorId: 'cla',
  },
];
