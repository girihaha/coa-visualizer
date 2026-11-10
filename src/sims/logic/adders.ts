export interface Column {
  index: number;
  a: number;
  b: number;
  cin: number;
  sum: number;
  cout: number;
  g: number;
  p: number;
}

export function rippleColumns(a: string, b: string, cin: number): { columns: Column[]; sum: string; carryOut: number } {
  const w = a.length;
  const columns: Column[] = [];
  let carry = cin;
  for (let i = 0; i < w; i++) {
    const ai = Number(a[w - 1 - i]);
    const bi = Number(b[w - 1 - i]);
    const total = ai + bi + carry;
    const sum = total & 1;
    const cout = total >> 1;
    columns.push({ index: i, a: ai, b: bi, cin: carry, sum, cout, g: ai & bi, p: ai ^ bi });
    carry = cout;
  }
  const sum = columns
    .map((c) => c.sum)
    .reverse()
    .join('');
  return { columns, sum, carryOut: carry };
}

export function claCarries(p: number[], g: number[], c0: number): number[] {
  const [p0, p1, p2, p3] = p;
  const [g0, g1, g2, g3] = g;
  const c1 = g0 | (p0 & c0);
  const c2 = g1 | (p1 & g0) | (p1 & p0 & c0);
  const c3 = g2 | (p2 & g1) | (p2 & p1 & g0) | (p2 & p1 & p0 & c0);
  const c4 = g3 | (p3 & g2) | (p3 & p2 & g1) | (p3 & p2 & p1 & g0) | (p3 & p2 & p1 & p0 & c0);
  return [c0, c1, c2, c3, c4];
}

export const HALF_ADDER_ROWS = [0, 1].flatMap((a) => [0, 1].map((b) => ({ a, b, sum: a ^ b, carry: a & b })));

export const FULL_ADDER_ROWS = [0, 1].flatMap((a) =>
  [0, 1].flatMap((b) => [0, 1].map((c) => ({ a, b, c, sum: a ^ b ^ c, carry: (a & b) | (b & c) | (a & c) })))
);
