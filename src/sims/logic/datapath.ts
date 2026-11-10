import type { SimBuild, SimStep } from '@/engine/types';

export type DatapathProgram = 'add-indirect' | 'branch' | 'three-bus';

export const PROGRAMS: { value: DatapathProgram; label: string; instruction: string; topology: 'single' | 'three' }[] = [
  { value: 'add-indirect', label: 'Add (R3), R1', instruction: 'Add (R3), R1', topology: 'single' },
  { value: 'branch', label: 'Branch', instruction: 'Branch offset', topology: 'single' },
  { value: 'three-bus', label: 'Add R4, R5, R6', instruction: 'Add R4, R5, R6', topology: 'three' },
];

export interface DatapathState {
  step: number;
  signals: string[];
  PC: number;
  IR: string;
  MAR: number | null;
  MDR: string;
  Y: number | null;
  Z: number | null;
  regs: Record<string, number>;
  bus: string;
  busA: string;
  busB: string;
  busC: string;
  waiting: boolean;
  active: string[];
}

export interface DatapathInput {
  program: DatapathProgram;
  pc: string;
  r1: string;
  r3: string;
  operand: string;
  offset: string;
  r4: string;
  r5: string;
}

type Word = number | string;

export function buildDatapath(input: DatapathInput): SimBuild<DatapathState> {
  const nums: Record<string, number> = {};
  const fields: [keyof DatapathInput, string, number, number][] = [
    ['pc', 'Starting PC', 0, 996],
    ['r1', 'R1', -9999, 9999],
    ['r3', 'R3 (pointer)', 0, 996],
    ['operand', 'Memory word at [R3]', -9999, 9999],
    ['offset', 'Branch offset', -400, 400],
    ['r4', 'R4', -9999, 9999],
    ['r5', 'R5', -9999, 9999],
  ];
  for (const [key, label, lo, hi] of fields) {
    const t = input[key].trim();
    if (!/^-?\d+$/.test(t)) return { steps: [], error: `${label} must be a whole number.` };
    const v = Number(t);
    if (v < lo || v > hi) return { steps: [], error: `${label} must be between ${lo} and ${hi}.` };
    nums[key] = v;
  }
  if (nums.pc % 4 !== 0 || nums.r3 % 4 !== 0) return { steps: [], error: 'Addresses must be multiples of 4: this model uses byte addressing with 4-byte words.' };
  const program = PROGRAMS.find((p) => p.value === input.program)!;
  if (program.value === 'add-indirect' && nums.r3 === nums.pc) return { steps: [], error: 'R3 must point to a data word, not to the instruction address.' };

  const memory: Record<number, Word> = { [nums.pc]: program.value === 'branch' ? `Branch ${nums.offset}` : program.instruction, [nums.r3]: nums.operand };

  let s: DatapathState = {
    step: 0,
    signals: [],
    PC: nums.pc,
    IR: '',
    MAR: null,
    MDR: '',
    Y: null,
    Z: null,
    regs: program.topology === 'single' ? { R1: nums.r1, R3: nums.r3 } : { R4: nums.r4, R5: nums.r5, R6: 0 },
    bus: '',
    busA: '',
    busB: '',
    busC: '',
    waiting: false,
    active: [],
  };
  const steps: SimStep<DatapathState>[] = [];
  steps.push({
    title: 'Initial state',
    operation: `PC = ${s.PC}; memory[${nums.pc}] holds "${memory[nums.pc]}"`,
    changed: [],
    explanation: program.topology === 'single' ? 'Single-bus organization: only one value can be placed on the internal bus in each control step.' : 'Three-bus organization: buses A and B carry the two ALU inputs and bus C carries the result, so one step can read two registers and write one.',
    state: s,
  });

  let readAddress: number | null = null;
  const apply = (n: number, signals: string[], explanation: string) => {
    const next: DatapathState = { ...s, regs: { ...s.regs }, step: n, signals, waiting: false, bus: '', busA: '', busB: '', busC: '', active: [] };
    const changed: string[] = [];
    const active = new Set<string>();
    const out = signals.find((x) => x.endsWith('out'));
    let bus: number | string = '';
    if (out === 'PCout') bus = s.PC;
    else if (out === 'Zout') bus = s.Z ?? 0;
    else if (out === 'MDRout') bus = s.MDR;
    else if (out === 'Offset-field-of-IRout') bus = nums.offset;
    else if (out && /^R\dout$/.test(out)) bus = s.regs[out.slice(0, 2)];
    if (out) {
      active.add(out.replace(/out$/, '').replace('Offset-field-of-IR', 'IR'));
      next.bus = String(bus);
    }
    if (signals.includes('Add')) {
      const left = signals.includes('Select4') ? 4 : (s.Y ?? 0);
      next.Z = left + Number(bus);
      active.add('ALU');
    }
    if (signals.includes('Zin')) {
      changed.push('Z');
      active.add('Z');
    }
    for (const sig of signals) {
      if (!sig.endsWith('in') || sig === 'Zin') continue;
      const target = sig.slice(0, -2);
      active.add(target);
      changed.push(target);
      if (target === 'MAR') next.MAR = Number(bus);
      else if (target === 'PC') next.PC = Number(bus);
      else if (target === 'Y') next.Y = Number(bus);
      else if (target === 'IR') next.IR = String(bus);
      else if (/^R\d$/.test(target)) next.regs[target] = Number(bus);
    }
    if (signals.includes('Read')) {
      readAddress = next.MAR;
      active.add('Memory');
    }
    if (signals.includes('WMFC')) {
      next.waiting = true;
      next.MDR = String(memory[readAddress ?? -1] ?? 0);
      changed.push('MDR');
      active.add('MDR');
      active.add('Memory');
    }
    next.active = [...active];
    s = next;
    steps.push({ title: `Step ${n}`, operation: signals.join(', '), condition: signals.includes('WMFC') ? 'Wait for memory function completed (MFC)' : undefined, changed, explanation, state: s });
  };

  if (program.topology === 'single') {
    apply(1, ['PCout', 'MARin', 'Read', 'Select4', 'Add', 'Zin'], 'The PC is sent to MAR to start reading the instruction. At the same time the ALU adds 4 to the PC value and holds it in Z.');
    apply(2, ['Zout', 'PCin', 'Yin', 'WMFC'], 'The incremented PC is written back to PC (and copied into Y). The processor waits until memory delivers the instruction word into MDR.');
    apply(3, ['MDRout', 'IRin'], 'The instruction moves from MDR to the instruction register, where it is decoded.');
    if (program.value === 'add-indirect') {
      apply(4, ['R3out', 'MARin', 'Read'], 'The contents of R3 are an address. They are sent to MAR and a memory read of the operand begins.');
      apply(5, ['R1out', 'Yin', 'WMFC'], 'While memory responds, R1 is copied into Y so it can be the first ALU input.');
      apply(6, ['MDRout', 'SelectY', 'Add', 'Zin'], 'The operand from memory is placed on the bus; the ALU adds it to Y and stores the sum in Z.');
      apply(7, ['Zout', 'R1in', 'End'], 'The sum is transferred to R1 and the control sequence ends.');
    } else {
      apply(4, ['Offset-field-of-IRout', 'SelectY', 'Add', 'Zin'], 'The branch offset from the instruction is added to the updated PC held in Y.');
      apply(5, ['Zout', 'PCin', 'End'], 'The branch target address is loaded into PC. The next fetch starts from the target.');
    }
  } else {
    const push = (n: number, signals: string[], patch: Partial<DatapathState>, changed: string[], explanation: string) => {
      s = { ...s, ...patch, step: n, signals, waiting: false };
      steps.push({ title: `Step ${n}`, operation: signals.join(', '), condition: signals.includes('WMFC') ? 'Wait for memory function completed (MFC)' : undefined, changed, explanation, state: s });
    };
    push(1, ['PCout', 'R=B', 'MARin', 'Read', 'IncPC'], { MAR: s.PC, PC: s.PC + 4, busB: String(s.PC), busC: String(s.PC), bus: '', active: ['PC', 'MAR', 'ALU', 'Memory'] }, ['MAR', 'PC'], 'PC passes through the ALU (R=B) to MAR and a read begins. The incrementer advances PC by 4 without using the ALU.');
    push(2, ['WMFC'], { waiting: true, MDR: String(memory[nums.pc]), busA: '', busB: '', busC: '', active: ['Memory', 'MDR'] }, ['MDR'], 'The processor waits for memory to return the instruction into MDR.');
    push(3, ['MDRoutB', 'R=B', 'IRin'], { IR: program.instruction, busB: String(memory[nums.pc]), busC: String(memory[nums.pc]), active: ['MDR', 'ALU', 'IR'] }, ['IR'], 'The instruction travels from MDR on bus B, through the ALU, to IR on bus C.');
    const sum = nums.r4 + nums.r5;
    push(4, ['R4outA', 'R5outB', 'SelectA', 'Add', 'R6in', 'End'], { regs: { ...s.regs, R6: sum }, busA: String(nums.r4), busB: String(nums.r5), busC: String(sum), active: ['R4', 'R5', 'ALU', 'R6'] }, ['R6'], 'Both source registers are read at once on buses A and B, added, and the result is written to R6 over bus C, all in one step.');
  }
  return { steps };
}
