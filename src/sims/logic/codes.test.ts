import { describe, it, expect } from 'vitest';
import { buildCodes, CODE_MODES, CODE_LABELS } from '@/sims/logic/codes';

const out = (...args: Parameters<typeof buildCodes>) => {
  const r = buildCodes(...args);
  expect(r.error).toBeUndefined();
  return r.steps[r.steps.length - 1].state.output;
};

describe('buildCodes', () => {
  it('exports modes and labels', () => {
    expect(CODE_MODES).toHaveLength(6);
    for (const m of CODE_MODES) expect(CODE_LABELS[m]).toBeTruthy();
  });

  it('BCD of 395 is 0011 1001 0101', () => {
    expect(out('bcd', '395')).toBe('0011 1001 0101');
  });

  it('excess-3 of 5 is 1000, of 9 is 1100, of 0 is 0011', () => {
    expect(out('xs3', '5')).toBe('1000');
    expect(out('xs3', '9')).toBe('1100');
    expect(out('xs3', '0')).toBe('0011');
  });

  it('Gray code of 1011 is 1110 and decodes back', () => {
    expect(out('gray-encode', '1011')).toBe('1110');
    expect(out('gray-decode', '1110')).toBe('1011');
  });

  it('Gray encode/decode round trip and single-bit adjacency for 4-bit values', () => {
    let prev: string | null = null;
    for (let v = 0; v < 16; v++) {
      const b = v.toString(2).padStart(4, '0');
      const g = out('gray-encode', b)!;
      expect(g).toBe((v ^ (v >> 1)).toString(2).padStart(4, '0'));
      expect(out('gray-decode', g)).toBe(b);
      if (prev) expect([...g].filter((c, i) => c !== prev![i]).length).toBe(1);
      prev = g;
    }
  });

  it('ASCII', () => {
    expect(out('ascii', 'A')).toBe('1000001');
    expect(out('ascii', 'Hi')).toBe('1001000 1101001');
  });

  it('even and odd parity', () => {
    expect(out('parity', '1011', 'even')).toBe('10111');
    expect(out('parity', '1001', 'even')).toBe('10010');
    expect(out('parity', '1011', 'odd')).toBe('10110');
    expect(out('parity', '1001', 'odd')).toBe('10011');
    expect(out('parity', '1011')).toBe('10111'); // default even
    const s = out('parity', '1101001', 'even')!;
    expect([...s].filter((c) => c === '1').length % 2).toBe(0);
  });

  it('rejects invalid input', () => {
    for (const r of [
      buildCodes('bcd', '12a'),
      buildCodes('xs3', '-5'),
      buildCodes('gray-encode', '102'),
      buildCodes('gray-decode', ''),
      buildCodes('ascii', ''),
      buildCodes('ascii', 'é'),
      buildCodes('parity', '12'),
    ]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
