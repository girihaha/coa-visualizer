import { describe, it, expect } from 'vitest';
import { buildMemoryLayout, addressBitsFor, UNIT_BYTES } from '@/sims/logic/memory';

type Opts = Parameters<typeof buildMemoryLayout>[0];
const opts = (o: Partial<Opts> = {}): Opts => ({
  value: '0x1A2B3C4D',
  wordBytes: 4,
  endian: 'big',
  start: 100,
  capacityAmount: 32,
  capacityUnit: 'MB',
  ...o,
});

describe('addressBitsFor', () => {
  it('ceil(log2 N)', () => {
    expect(addressBitsFor(1n)).toBe(0);
    expect(addressBitsFor(2n)).toBe(1);
    expect(addressBitsFor(1024n)).toBe(10);
    expect(addressBitsFor(1000n)).toBe(10);
    expect(addressBitsFor(1025n)).toBe(11);
    expect(addressBitsFor(32n * UNIT_BYTES.MB)).toBe(25);
    expect(addressBitsFor(4n * UNIT_BYTES.GB)).toBe(32);
  });
});

describe('buildMemoryLayout', () => {
  it('32 MB byte-addressable -> 25 address bits', () => {
    const r = buildMemoryLayout(opts());
    expect(r.error).toBeUndefined();
    const s = r.steps[r.steps.length - 1].state;
    expect(s.addressBits).toBe(25);
    expect(s.locations).toBe(33554432);
  });

  it('big-endian places MSB at lowest address', () => {
    const s = buildMemoryLayout(opts()).steps.at(-1)!.state;
    expect(s.bytes).toEqual([
      { address: 100, value: '1A' },
      { address: 101, value: '2B' },
      { address: 102, value: '3C' },
      { address: 103, value: '4D' },
    ]);
  });

  it('little-endian places LSB at lowest address', () => {
    const s = buildMemoryLayout(opts({ endian: 'little', start: 0 })).steps.at(-1)!.state;
    expect(s.bytes.map((b) => b.value)).toEqual(['4D', '3C', '2B', '1A']);
    expect(s.bytes.map((b) => b.address)).toEqual([0, 1, 2, 3]);
  });

  it('decimal value and 2-byte word', () => {
    const s = buildMemoryLayout(opts({ value: '258', wordBytes: 2, endian: 'little', capacityAmount: 64, capacityUnit: 'KB' })).steps.at(-1)!.state;
    expect(s.bytes.map((b) => b.value)).toEqual(['02', '01']);
    expect(s.addressBits).toBe(16);
  });

  it('rejects invalid input', () => {
    for (const r of [
      buildMemoryLayout(opts({ capacityAmount: 0 })),
      buildMemoryLayout(opts({ capacityAmount: 1.5 })),
      buildMemoryLayout(opts({ value: 'xyz' })),
      buildMemoryLayout(opts({ value: '0x10000', wordBytes: 2 })),
      buildMemoryLayout(opts({ value: '256', wordBytes: 1 })),
      buildMemoryLayout(opts({ start: -1 })),
    ]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
