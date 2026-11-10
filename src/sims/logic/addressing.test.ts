import { describe, it, expect } from 'vitest';
import { buildAddressing, DATA_PRESET, type AddressingMode } from '@/sims/logic/addressing';

const run = (mode: AddressingMode, x = '0', r0 = '100', r1 = '18', r2 = '3') => {
  const build = buildAddressing({ mode, x, r0, r1, r2 });
  return { ...build, final: build.steps[build.steps.length - 1]?.state };
};

describe('addressing modes (ADD R0, src)', () => {
  it('immediate uses X itself with no memory access', () => {
    const { final, error } = run('immediate', '7');
    expect(error).toBeUndefined();
    expect(final.ea).toBeNull();
    expect(final.R0).toBe(107);
  });

  it('direct reads memory at X', () => {
    const { final } = run('direct', '17');
    expect(final.ea).toBe(17);
    expect(final.R0).toBe(100 + DATA_PRESET[17]);
  });

  it('indirect follows the pointer stored at X', () => {
    const { final } = run('indirect', '20');
    expect(final.ea).toBe(DATA_PRESET[20]);
    expect(final.R0).toBe(100 + DATA_PRESET[DATA_PRESET[20]]);
  });

  it('register direct adds the register value', () => {
    expect(run('register').final.R0).toBe(118);
  });

  it('register indirect reads memory at [R1]', () => {
    const { final } = run('register-indirect');
    expect(final.ea).toBe(18);
    expect(final.R0).toBe(100 + DATA_PRESET[18]);
  });

  it('indexed computes X + [R2]', () => {
    const { final } = run('indexed', '16', '100', '18', '3');
    expect(final.ea).toBe(19);
    expect(final.R0).toBe(100 + DATA_PRESET[19]);
  });

  it('relative computes X + [PC] after PC has been incremented', () => {
    const { final } = run('relative', '15');
    expect(final.ea).toBe(20);
  });

  it('auto-increment uses [R1] then increments R1', () => {
    const { final } = run('auto-increment');
    expect(final.ea).toBe(18);
    expect(final.R1).toBe(19);
  });

  it('auto-decrement decrements R1 first', () => {
    const { final } = run('auto-decrement');
    expect(final.ea).toBe(17);
    expect(final.R1).toBe(17);
  });

  it('rejects an effective address outside the data area', () => {
    const { error, steps } = run('direct', '90');
    expect(error).toBeTruthy();
    expect(steps).toHaveLength(0);
  });

  it('passes through the fetch, decode and execute stages', () => {
    const stages = run('direct', '17').steps.map((s) => s.state.stage);
    for (const st of ['fetch', 'decode', 'execute']) expect(stages).toContain(st);
  });
});
