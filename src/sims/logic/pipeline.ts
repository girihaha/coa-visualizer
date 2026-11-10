import type { SimBuild, SimStep } from '@/engine/types';

export type Stage = 'F' | 'D' | 'E' | 'W';
export const STAGES: Stage[] = ['F', 'D', 'E', 'W'];
export const STAGE_NAMES: Record<Stage, string> = { F: 'Fetch', D: 'Decode', E: 'Execute', W: 'Write' };

export interface PipeInstr {
  line: number;
  text: string;
  op: string;
  dest: string | null;
  srcs: string[];
  branchTo: number | null;
}

export interface PipeTiming {
  instr: PipeInstr;
  flushed: boolean;
  F: [number, number];
  D: [number, number] | null;
  E: [number, number] | null;
  W: [number, number] | null;
}

export interface PipelineState {
  cycle: number;
  timings: PipeTiming[];
  totalCycles: number;
  events: string[];
  forwards: { from: number; to: number; reg: string }[];
}

export interface PipelineOptions {
  program: string;
  forwarding: boolean;
  missLine: number;
  missPenalty: number;
}

const REG = /^R([0-9]|1[0-5])$/i;

export function parseProgram(program: string): { instrs: PipeInstr[]; error?: string } {
  const lines = program
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { instrs: [], error: 'Enter at least one instruction.' };
  if (lines.length > 8) return { instrs: [], error: 'Use at most 8 instructions so the cycle table stays readable.' };
  const instrs: PipeInstr[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const m = raw.match(/^([A-Za-z]+)\s*(.*)$/);
    if (!m) return { instrs: [], error: `Line ${i + 1}: could not read "${raw}".` };
    const op = m[1].toUpperCase();
    const args = m[2].split(',').map((a) => a.trim()).filter(Boolean);
    if (op === 'ADD' || op === 'SUB' || op === 'MUL' || op === 'AND' || op === 'OR') {
      if (args.length !== 3 || !args.every((a) => REG.test(a))) return { instrs: [], error: `Line ${i + 1}: ${op} needs three registers, for example "${op} R1, R2, R3" (destination first).` };
      instrs.push({ line: i + 1, text: raw, op, dest: args[0].toUpperCase(), srcs: [args[1].toUpperCase(), args[2].toUpperCase()], branchTo: null });
    } else if (op === 'LOAD') {
      const base = args[1]?.match(/^\((R\d+)\)$/i);
      if (args.length !== 2 || !REG.test(args[0]) || !base) return { instrs: [], error: `Line ${i + 1}: LOAD needs the form "LOAD R1, (R2)".` };
      instrs.push({ line: i + 1, text: raw, op, dest: args[0].toUpperCase(), srcs: [base[1].toUpperCase()], branchTo: null });
    } else if (op === 'BR') {
      const t = Number(args[0]);
      if (args.length !== 1 || !Number.isInteger(t) || t <= i + 1 || t > lines.length + 1) {
        return { instrs: [], error: `Line ${i + 1}: BR needs a later line number as its target, for example "BR ${Math.min(i + 3, lines.length + 1)}". Line ${lines.length + 1} means "after the last line".` };
      }
      instrs.push({ line: i + 1, text: raw, op, dest: null, srcs: [], branchTo: t });
    } else if (op === 'NOP') {
      instrs.push({ line: i + 1, text: raw, op, dest: null, srcs: [], branchTo: null });
    } else {
      return { instrs: [], error: `Line ${i + 1}: "${op}" is not in this teaching model. Use ADD, SUB, MUL, AND, OR, LOAD, BR or NOP.` };
    }
  }
  return { instrs };
}

export function schedule(instrs: PipeInstr[], forwarding: boolean, missLine: number, missPenalty: number): PipeTiming[] {
  const out: PipeTiming[] = [];
  let prev: PipeTiming | null = null;
  let nextFetch = 1;
  let i = 0;
  while (i < instrs.length) {
    const instr = instrs[i];
    const extra = instr.line === missLine ? missPenalty : 0;
    const fStart = nextFetch;
    const fEnd = Math.max(fStart + extra, prev?.D?.[1] ?? 0);
    const dStart = fEnd + 1;
    let ready = 0;
    for (const src of instr.srcs) {
      const producer = [...out].reverse().find((t) => !t.flushed && t.instr.dest === src);
      if (!producer || !producer.E || !producer.W) continue;
      ready = Math.max(ready, forwarding ? producer.E[1] + 1 : producer.W[1] + 1);
    }
    const dEnd = Math.max(dStart, prev?.E?.[1] ?? 0, ready - 1);
    const eStart = dEnd + 1;
    const eEnd = Math.max(eStart, prev?.W?.[1] ?? 0);
    const t: PipeTiming = { instr, flushed: false, F: [fStart, fEnd], D: [dStart, dEnd], E: [eStart, eEnd], W: [eEnd + 1, eEnd + 1] };
    out.push(t);
    prev = t;
    nextFetch = fEnd + 1;
    if (instr.branchTo !== null) {
      const wrong = instrs[i + 1];
      if (wrong && wrong.line !== instr.branchTo) {
        out.push({ instr: wrong, flushed: true, F: [dStart, dStart], D: null, E: null, W: null });
      }
      nextFetch = dEnd + 1;
      const target = instrs.findIndex((x) => x.line === instr.branchTo);
      i = target === -1 ? instrs.length : target;
      continue;
    }
    i++;
  }
  return out;
}

export function stageAt(t: PipeTiming, cycle: number): { stage: Stage; stalled: boolean } | null {
  for (const st of STAGES) {
    const r = t[st];
    if (r && cycle >= r[0] && cycle <= r[1]) return { stage: st, stalled: cycle > r[0] };
  }
  return null;
}

export function totalCycles(timings: PipeTiming[]): number {
  return timings.reduce((m, t) => Math.max(m, t.W?.[1] ?? t.F[1]), 0);
}

export function buildPipeline(opts: PipelineOptions): SimBuild<PipelineState> & { baseline?: number } {
  const { instrs, error } = parseProgram(opts.program);
  if (error) return { steps: [], error };
  if (!Number.isInteger(opts.missPenalty) || opts.missPenalty < 0 || opts.missPenalty > 5) return { steps: [], error: 'Cache-miss delay must be between 0 and 5 extra cycles.' };
  const timings = schedule(instrs, opts.forwarding, opts.missLine, opts.missPenalty);
  const total = totalCycles(timings);
  const baseline = totalCycles(schedule(instrs, false, 0, 0));
  const steps: SimStep<PipelineState>[] = [
    {
      title: 'Cycle 0',
      operation: `${instrs.length} instructions, 4 stages`,
      changed: [],
      explanation: 'Empty pipeline. Each cycle, every instruction that is free to do so moves to its next stage. Instructions stay in order.',
      state: { cycle: 0, timings, totalCycles: total, events: [], forwards: [] },
    },
  ];
  for (let c = 1; c <= total; c++) {
    const events: string[] = [];
    const forwards: PipelineState['forwards'] = [];
    const changed: string[] = [];
    timings.forEach((t, idx) => {
      const at = stageAt(t, c);
      if (!at) return;
      const name = `I${t.instr.line}`;
      if (t.flushed) {
        events.push(`${name} was fetched on the wrong path and is discarded once the branch is decoded.`);
        changed.push(`${name} flushed`);
        return;
      }
      changed.push(`${name}: ${at.stage}${at.stalled ? ' (stall)' : ''}`);
      if (at.stage === 'F' && at.stalled && t.instr.line === opts.missLine && opts.missPenalty > 0 && c <= t.F[0] + opts.missPenalty) {
        events.push(`${name} cache miss: fetch takes extra cycles, so the instructions behind it wait.`);
      } else if (at.stage === 'D' && at.stalled) {
        const deps = t.instr.srcs.filter((src) => timings.slice(0, idx).some((p) => !p.flushed && p.instr.dest === src && p.E && p.W && (opts.forwarding ? p.E[1] : p.W[1]) >= c));
        events.push(deps.length ? `${name} data hazard: waiting for ${deps.join(', ')} from an earlier instruction.` : `${name} held in Decode because the stage ahead is still busy.`);
      } else if (at.stage === 'F' && at.stalled) {
        events.push(`${name} held in Fetch because Decode is occupied.`);
      }
      if (at.stage === 'D' && t.instr.branchTo !== null && !at.stalled) events.push(`${name} branch decoded: target is line ${t.instr.branchTo}.`);
      if (opts.forwarding && at.stage === 'E' && !at.stalled) {
        for (const src of t.instr.srcs) {
          const p = [...timings.slice(0, idx)].reverse().find((x) => !x.flushed && x.instr.dest === src);
          if (p?.E && p.E[1] === c - 1) forwards.push({ from: p.instr.line, to: t.instr.line, reg: src });
        }
      }
    });
    forwards.forEach((f) => events.push(`Forwarding: ${f.reg} goes straight from I${f.from}'s ALU output to I${f.to}'s ALU input.`));
    const retired = timings.filter((t) => t.W && t.W[1] === c).map((t) => `I${t.instr.line}`);
    if (retired.length) events.push(`${retired.join(', ')} completes.`);
    steps.push({
      title: `Cycle ${c}`,
      operation: changed.join(' · ') || 'No instruction active',
      changed,
      explanation: events.length ? events.join(' ') : 'All active instructions advance one stage. No hazard in this cycle.',
      state: { cycle: c, timings, totalCycles: total, events, forwards },
    });
  }
  return { steps, baseline };
}
