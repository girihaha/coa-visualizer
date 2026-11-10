import { describe, it, expect } from 'vitest';
import { buildCarrySave, parseSummands } from '@/sims/logic/carrySave';

const finalValue = (text: string) => {
  const r = buildCarrySave(text);
  expect(r.error).toBeUndefined();
  const s = r.steps[r.steps.length - 1].state;
  return { s, value: parseInt(s.finalSum!, 2) };
};

describe('parseSummands', () => {
  it('parses comma/space separated values', () => {
    expect(parseSummands('0101, 0011 1111')).toEqual({ summands: ['0101', '0011', '1111'] });
  });
  it('validates count, digits, width', () => {
    expect(parseSummands('01,10').error).toBeTruthy();
    expect(parseSummands('1,1,1,1,1,1,1').error).toBeTruthy();
    expect(parseSummands('01,12,11').error).toBeTruthy();
    expect(parseSummands('01,101,11').error).toBeTruthy();
    expect(parseSummands('111111111,111111111,111111111').error).toBeTruthy();
  });
});

describe('buildCarrySave', () => {
  it('three summands: 5 + 3 + 7 = 15', () => {
    const { s, value } = finalValue('0101,0011,0111');
    expect(value).toBe(15);
    expect(s.width).toBe(7);
    expect(s.rows).toHaveLength(2);
  });

  it('first reduction round produces sum and shifted carry rows', () => {
    const r = buildCarrySave('0101,0011,0111');
    const round1 = r.steps[1].state;
    // x=0000101 y=0000011 z=0000111 -> xor=0000001, majority=0000111 << 1 = 0001110
    expect(round1.rows).toEqual(['0000001', '0001110']);
  });

  it('six max-value 8-bit summands: 6 x 255 = 1530', () => {
    expect(finalValue(Array(6).fill('11111111').join(',')).value).toBe(1530);
  });

  it('sum of several summands equals arithmetic sum (sweep)', () => {
    const sets = [
      [1, 2, 3],
      [15, 15, 15, 15],
      [9, 6, 12, 3, 10],
      [0, 0, 0],
      [7, 1, 14, 8, 2, 11],
    ];
    for (const set of sets) {
      const text = set.map((v) => v.toString(2).padStart(4, '0')).join(',');
      expect(finalValue(text).value).toBe(set.reduce((a, b) => a + b, 0));
    }
  });

  it('rejects invalid input', () => {
    const r = buildCarrySave('1,2,3');
    expect(r.error).toBeTruthy();
    expect(r.steps).toHaveLength(0);
  });
});
