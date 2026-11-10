import type { SimBuild, SimStep } from '@/engine/types';

export type AddressingMode =
  | 'immediate'
  | 'direct'
  | 'indirect'
  | 'register'
  | 'register-indirect'
  | 'indexed'
  | 'relative'
  | 'auto-increment'
  | 'auto-decrement';

export const MODES: { value: AddressingMode; label: string; syntax: (x: string) => string; ea: string }[] = [
  { value: 'immediate', label: 'Immediate', syntax: (x) => `#${x}`, ea: 'Operand = X (no memory access)' },
  { value: 'direct', label: 'Direct', syntax: (x) => `${x}`, ea: 'EA = X' },
  { value: 'indirect', label: 'Indirect', syntax: (x) => `(${x})`, ea: 'EA = [X]' },
  { value: 'register', label: 'Register direct', syntax: () => 'R1', ea: 'Operand = [R1]' },
  { value: 'register-indirect', label: 'Register indirect', syntax: () => '(R1)', ea: 'EA = [R1]' },
  { value: 'indexed', label: 'Indexed', syntax: (x) => `${x}(R2)`, ea: 'EA = X + [R2]' },
  { value: 'relative', label: 'Relative', syntax: (x) => `${x}(PC)`, ea: 'EA = X + [PC]' },
  { value: 'auto-increment', label: 'Auto-increment', syntax: () => '(R1)+', ea: 'EA = [R1], then R1 <- [R1] + 1' },
  { value: 'auto-decrement', label: 'Auto-decrement', syntax: () => '-(R1)', ea: 'R1 <- [R1] - 1, then EA = [R1]' },
];

export const INSTRUCTION_ADDRESS = 4;
export const DATA_START = 16;
export const DATA_END = 31;

export const DATA_PRESET: Record<number, number> = {
  16: 5, 17: 12, 18: 20, 19: 7, 20: 24, 21: 9, 22: 30, 23: 3,
  24: 42, 25: 17, 26: 8, 27: 26, 28: 11, 29: 64, 30: 15, 31: 2,
};

export interface AddressingState {
  stage: 'fetch' | 'decode' | 'address' | 'operand' | 'execute' | 'write' | 'initial';
  PC: number;
  IR: string;
  R0: number;
  R1: number;
  R2: number;
  memory: Record<number, number>;
  ea: number | null;
  operand: number | null;
  path: number[];
  flags: { Z: 0 | 1; N: 0 | 1 };
}

export interface AddressingInput {
  mode: AddressingMode;
  x: string;
  r0: string;
  r1: string;
  r2: string;
}

const inData = (a: number) => a >= DATA_START && a <= DATA_END;

export function buildAddressing(input: AddressingInput): SimBuild<AddressingState> {
  const parse = (label: string, t: string, lo: number, hi: number) => {
    const s = t.trim();
    if (!/^-?\d+$/.test(s)) return { error: `${label} must be a whole number.` };
    const v = Number(s);
    if (v < lo || v > hi) return { error: `${label} must be between ${lo} and ${hi}.` };
    return { v };
  };
  const px = parse('Address field X', input.x, -31, 99);
  if ('error' in px) return { steps: [], error: px.error };
  const p0 = parse('R0', input.r0, -999, 999);
  if ('error' in p0) return { steps: [], error: p0.error };
  const p1 = parse('R1', input.r1, 0, 32);
  if ('error' in p1) return { steps: [], error: p1.error };
  const p2 = parse('R2', input.r2, -31, 31);
  if ('error' in p2) return { steps: [], error: p2.error };
  const X = px.v as number;
  const mode = MODES.find((m) => m.value === input.mode)!;
  const text = `ADD R0, ${mode.syntax(String(X))}`;

  let s: AddressingState = {
    stage: 'initial',
    PC: INSTRUCTION_ADDRESS,
    IR: '',
    R0: p0.v as number,
    R1: p1.v as number,
    R2: p2.v as number,
    memory: { ...DATA_PRESET },
    ea: null,
    operand: null,
    path: [],
    flags: { Z: 0, N: 0 },
  };
  const steps: SimStep<AddressingState>[] = [];
  const push = (step: Omit<SimStep<AddressingState>, 'state'>, next: Partial<AddressingState>) => {
    s = { ...s, ...next };
    steps.push({ ...step, state: s });
  };

  push(
    { title: 'Initial state', operation: `PC = ${INSTRUCTION_ADDRESS}, instruction "${text}" stored at address ${INSTRUCTION_ADDRESS}`, changed: [], explanation: 'Registers and memory before the instruction is fetched. Data words live at addresses 16 to 31.' },
    {},
  );
  push(
    { title: 'Fetch', operation: `IR <- [[PC]];  PC <- [PC] + 1 = ${INSTRUCTION_ADDRESS + 1}`, changed: ['IR', 'PC'], explanation: 'The word whose address is in the PC is read into the instruction register, and the PC moves on to the next word.' },
    { stage: 'fetch', IR: text, PC: INSTRUCTION_ADDRESS + 1 },
  );
  push(
    { title: 'Decode', operation: `opcode ADD · destination R0 · source ${mode.syntax(String(X))}`, condition: `Mode: ${mode.label}`, changed: [], explanation: `The control unit identifies the operation and the addressing mode of the source operand. Rule: ${mode.ea}.` },
    { stage: 'decode' },
  );

  const fail = (msg: string): SimBuild<AddressingState> => ({ steps: [], error: msg });
  let ea: number | null = null;
  let operand: number;
  const path: number[] = [];

  switch (input.mode) {
    case 'immediate':
      operand = X;
      push({ title: 'Operand in instruction', operation: `operand = ${X}`, changed: ['operand'], explanation: 'Immediate mode: the value itself is part of the instruction, so no effective address is computed and memory is not read.' }, { stage: 'address', operand });
      break;
    case 'register':
      operand = s.R1;
      push({ title: 'Operand in register', operation: `operand = [R1] = ${operand}`, changed: ['operand'], explanation: 'Register direct mode: the operand is the contents of a processor register. Memory is not accessed.' }, { stage: 'address', operand });
      break;
    default: {
      let eaText = '';
      let pre: Partial<AddressingState> = {};
      if (input.mode === 'direct') {
        ea = X;
        eaText = `EA = X = ${X}`;
      } else if (input.mode === 'indirect') {
        if (!inData(X)) return fail(`Indirect mode reads a pointer from address X. Choose X between ${DATA_START} and ${DATA_END}.`);
        ea = s.memory[X];
        path.push(X);
        eaText = `EA = [X] = [${X}] = ${ea}`;
      } else if (input.mode === 'register-indirect') {
        ea = s.R1;
        eaText = `EA = [R1] = ${ea}`;
      } else if (input.mode === 'indexed') {
        ea = X + s.R2;
        eaText = `EA = X + [R2] = ${X} + ${s.R2} = ${ea}`;
      } else if (input.mode === 'relative') {
        ea = X + s.PC;
        eaText = `EA = X + [PC] = ${X} + ${s.PC} = ${ea}`;
      } else if (input.mode === 'auto-increment') {
        ea = s.R1;
        eaText = `EA = [R1] = ${ea}`;
      } else {
        const r1 = s.R1 - 1;
        pre = { R1: r1 };
        ea = r1;
        eaText = `R1 <- [R1] - 1 = ${r1};  EA = [R1] = ${ea}`;
      }
      if (!inData(ea)) return fail(`The effective address works out to ${ea}. In this teaching memory data words are at ${DATA_START} to ${DATA_END}; adjust the inputs.`);
      path.push(ea);
      push(
        { title: 'Effective address', operation: eaText, changed: ['EA', ...(pre.R1 !== undefined ? ['R1'] : [])], explanation: input.mode === 'indirect' ? 'Indirect mode needs an extra memory read: the word at X holds the address of the operand.' : input.mode === 'auto-decrement' ? 'Auto-decrement first decrements the register, then uses it as the address.' : 'The effective address is the memory location that holds the operand.' },
        { ...pre, stage: 'address', ea, path: [...path] },
      );
      operand = s.memory[ea];
      push({ title: 'Read operand', operation: `operand = [EA] = [${ea}] = ${operand}`, changed: ['operand'], explanation: 'The operand value is read from memory at the effective address. Note the difference between the address and the value stored there.' }, { stage: 'operand', operand });
      if (input.mode === 'auto-increment') {
        push({ title: 'Auto-increment register', operation: `R1 <- [R1] + 1 = ${s.R1 + 1}`, changed: ['R1'], explanation: 'After the operand is accessed, the register is incremented so it points to the next word.' }, { R1: s.R1 + 1 });
      }
    }
  }

  const result = s.R0 + operand;
  push(
    { title: 'Execute', operation: `ALU: ${s.R0} + ${operand} = ${result}`, changed: ['ALU'], explanation: 'The ALU adds the destination register and the source operand.' },
    { stage: 'execute' },
  );
  push(
    { title: 'Write back', operation: `R0 <- ${result};  Z = ${result === 0 ? 1 : 0}, N = ${result < 0 ? 1 : 0}`, changed: ['R0', 'Z', 'N'], explanation: 'The result is stored in R0 and the condition codes record whether it is zero or negative. RTN: R0 <- [R0] + source.' },
    { stage: 'write', R0: result, flags: { Z: result === 0 ? 1 : 0, N: result < 0 ? 1 : 0 } },
  );
  return { steps };
}
