export type GateName = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export const GATES: { name: GateName; expression: string; inputs: 1 | 2; note: string }[] = [
  { name: 'AND', expression: 'Y = A · B', inputs: 2, note: 'Output is 1 only when every input is 1.' },
  { name: 'OR', expression: 'Y = A + B', inputs: 2, note: 'Output is 1 when at least one input is 1.' },
  { name: 'NOT', expression: "Y = A'", inputs: 1, note: 'Output is the complement of the single input.' },
  { name: 'NAND', expression: "Y = (A · B)'", inputs: 2, note: 'Complement of AND. A universal gate: any gate can be built from NAND alone.' },
  { name: 'NOR', expression: "Y = (A + B)'", inputs: 2, note: 'Complement of OR. Also a universal gate.' },
  { name: 'XOR', expression: 'Y = A ⊕ B', inputs: 2, note: 'Output is 1 when the inputs differ.' },
  { name: 'XNOR', expression: "Y = (A ⊕ B)'", inputs: 2, note: 'Output is 1 when the inputs are equal.' },
];

export function evalGate(gate: GateName, a: 0 | 1, b: 0 | 1): 0 | 1 {
  switch (gate) {
    case 'AND':
      return (a & b) as 0 | 1;
    case 'OR':
      return (a | b) as 0 | 1;
    case 'NOT':
      return (a ^ 1) as 0 | 1;
    case 'NAND':
      return ((a & b) ^ 1) as 0 | 1;
    case 'NOR':
      return ((a | b) ^ 1) as 0 | 1;
    case 'XOR':
      return (a ^ b) as 0 | 1;
    case 'XNOR':
      return ((a ^ b) ^ 1) as 0 | 1;
  }
}

export function truthTable(gate: GateName): { a: 0 | 1; b: 0 | 1; y: 0 | 1 }[] {
  const rows: { a: 0 | 1; b: 0 | 1; y: 0 | 1 }[] = [];
  const bs: (0 | 1)[] = gate === 'NOT' ? [0] : [0, 1];
  for (const a of [0, 1] as const) for (const b of bs) rows.push({ a, b, y: evalGate(gate, a, b) });
  return rows;
}

export function halfAdder(a: 0 | 1, b: 0 | 1) {
  return { sum: (a ^ b) as 0 | 1, carry: (a & b) as 0 | 1 };
}

export function fullAdder(a: 0 | 1, b: 0 | 1, cin: 0 | 1) {
  const sum = (a ^ b ^ cin) as 0 | 1;
  const carry = ((a & b) | (cin & (a ^ b))) as 0 | 1;
  return { sum, carry };
}

export function deMorgan(a: 0 | 1, b: 0 | 1) {
  const not = (x: number) => (x ^ 1) as 0 | 1;
  return {
    law1Left: not(a & b),
    law1Right: (not(a) | not(b)) as 0 | 1,
    law2Left: not(a | b),
    law2Right: (not(a) & not(b)) as 0 | 1,
  };
}
