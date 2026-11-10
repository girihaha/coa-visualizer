import { describe, it, expect } from 'vitest';
import { BUFFER_START, buildPolling } from '@/sims/logic/polling';

describe('program-controlled I/O polling', () => {
  it('delivers every character into the buffer in order', () => {
    const end = buildPolling({ text: 'COA', delay: 2, mapping: 'memory-mapped' }).steps.at(-1)!.state;
    expect(end.buffer).toEqual(['C', 'O', 'A']);
    expect(end.pc).toBe('idle');
    expect(end.sin).toBe(0);
  });

  it('reads status (delay + 1) times per character', () => {
    for (const delay of [0, 1, 4]) {
      const end = buildPolling({ text: 'AB', delay, mapping: 'memory-mapped' }).steps.at(-1)!.state;
      expect(end.statusReads).toBe(2 * (delay + 1));
    }
  });

  it('reading data clears SIN', () => {
    const steps = buildPolling({ text: 'X', delay: 1, mapping: 'memory-mapped' }).steps;
    const read = steps.find((s) => s.state.pc === 'read')!;
    expect(read.state.sin).toBe(0);
    expect(read.state.R0).toBe('X');
  });

  it('memory-mapped uses Load instructions; I/O-mapped uses In with a separate space', () => {
    const mm = buildPolling({ text: 'A', delay: 0, mapping: 'memory-mapped' }).steps;
    const io = buildPolling({ text: 'A', delay: 0, mapping: 'io-mapped' }).steps;
    expect(mm.find((s) => s.state.pc === 'poll')!.operation).toMatch(/^Load/);
    expect(io.find((s) => s.state.pc === 'poll')!.operation).toMatch(/^In/);
    expect(mm.find((s) => s.state.pc === 'poll')!.state.bus).toBe('address');
    expect(io.find((s) => s.state.pc === 'poll')!.state.bus).toBe('io');
  });

  it('stores at consecutive buffer addresses', () => {
    const stores = buildPolling({ text: 'HI', delay: 0, mapping: 'io-mapped' }).steps.filter((s) => s.state.pc === 'store');
    expect(stores.map((s) => s.operation)).toEqual([
      expect.stringContaining(`0x${BUFFER_START.toString(16).toUpperCase()}`),
      expect.stringContaining(`0x${(BUFFER_START + 1).toString(16).toUpperCase()}`),
    ]);
  });

  it('rejects invalid input', () => {
    expect(buildPolling({ text: '', delay: 0, mapping: 'memory-mapped' }).error).toBeTruthy();
    expect(buildPolling({ text: 'TOOLONG', delay: 0, mapping: 'memory-mapped' }).error).toBeTruthy();
    expect(buildPolling({ text: 'A', delay: 5, mapping: 'memory-mapped' }).error).toBeTruthy();
  });
});
