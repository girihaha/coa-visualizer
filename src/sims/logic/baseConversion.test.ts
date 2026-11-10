import { describe, it, expect } from 'vitest';
import {
  buildBaseConversion,
  parseRadixDigits,
  parseFraction,
  toRadixString,
  type BaseInput,
} from '@/sims/logic/baseConversion';

const conv = (over: Partial<BaseInput>) =>
  buildBaseConversion({ source: 10, target: 2, integer: '0', fraction: '', maxFraction: 12, ...over });

const resultState = (b: ReturnType<typeof conv>) => b.steps.find((s) => s.state.phase === 'result')!.state;

describe('baseConversion helpers', () => {
  it('parseRadixDigits', () => {
    expect(parseRadixDigits('FF', 16)).toBe(255n);
    expect(parseRadixDigits('ff', 16)).toBe(255n);
    expect(parseRadixDigits('777', 8)).toBe(511n);
    expect(parseRadixDigits('102', 2)).toBeNull();
    expect(parseRadixDigits('G', 16)).toBeNull();
  });
  it('parseFraction', () => {
    expect(parseFraction('', 10)).toEqual({ num: 0n, den: 1n });
    expect(parseFraction('1011', 2)).toEqual({ num: 11n, den: 16n });
    expect(parseFraction('9', 8)).toBeNull();
  });
  it('toRadixString', () => {
    expect(toRadixString(255n, 16)).toBe('FF');
    expect(toRadixString(46n, 2)).toBe('101110');
  });
});

describe('buildBaseConversion', () => {
  it('46.6875 decimal -> 101110.1011 binary', () => {
    const b = conv({ integer: '46', fraction: '6875' });
    expect(b.error).toBeUndefined();
    const last = b.steps[b.steps.length - 1].state;
    expect(last.phase).toBe('check');
    expect(last.note).toBe('101110.1011');
    expect(last.digits).toBe('101110');
    expect(last.fractionDigits).toBe('1011');
  });

  it('101110.1011 binary -> 46.6875 decimal', () => {
    const b = conv({ source: 2, target: 10, integer: '101110', fraction: '1011' });
    expect(b.steps[b.steps.length - 1].state.note).toBe('46.6875');
  });

  it('binary fraction with leading zeros -> decimal (0.0001b = 0.0625)', () => {
    const b = conv({ source: 2, target: 10, integer: '0', fraction: '0001' });
    expect(b.steps[b.steps.length - 1].state.note).toBe('0.0625');
  });

  it('integer conversions between radices', () => {
    expect(conv({ source: 10, target: 16, integer: '255' }).steps.at(-1)!.state.note).toBe('FF');
    expect(conv({ source: 16, target: 2, integer: 'FF' }).steps.at(-1)!.state.note).toBe('11111111');
    expect(conv({ source: 8, target: 16, integer: '777' }).steps.at(-1)!.state.note).toBe('1FF');
    expect(conv({ source: 16, target: 10, integer: '1A' }).steps.at(-1)!.state.note).toBe('26');
    expect(conv({ source: 10, target: 2, integer: '0' }).steps.at(-1)!.state.note).toBe('0');
    expect(conv({ source: 2, target: 2, integer: '1010' }).steps.at(-1)!.state.note).toBe('1010');
  });

  it('hex fraction to binary (0.A hex = 0.101 binary)', () => {
    const b = conv({ source: 16, target: 2, integer: '1', fraction: 'A' });
    expect(b.steps.at(-1)!.state.note).toBe('1.101');
  });

  it('0.1 decimal -> repeating binary 0.0(0011)', () => {
    const b = conv({ integer: '0', fraction: '1' });
    const r = resultState(b);
    expect(r.note).toBe('0.0(0011)');
  });

  it('truncates when the limit is reached before a repeat', () => {
    const b = conv({ integer: '0', fraction: '1', maxFraction: 3 });
    expect(resultState(b).note).toBe('0.000…');
  });

  it('every non-negative integer up to 300 converts to base 2/8/16 correctly', () => {
    for (let v = 0; v <= 300; v++) {
      for (const target of [2, 8, 16] as const) {
        const b = conv({ integer: String(v), target });
        expect(b.steps.at(-1)!.state.note).toBe(v.toString(target).toUpperCase());
      }
    }
  });

  it('rejects invalid digits and bad limits', () => {
    for (const b of [
      conv({ source: 2, integer: '102' }),
      conv({ source: 2, integer: '1', fraction: '2' }),
      conv({ source: 8, integer: '8' }),
      conv({ integer: '5', maxFraction: 0 }),
      conv({ integer: '5', maxFraction: 25 }),
    ]) {
      expect(b.error).toBeTruthy();
      expect(b.steps).toHaveLength(0);
    }
  });
});
