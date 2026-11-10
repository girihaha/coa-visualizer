export type UnitId = 1 | 2 | 3 | 4 | 5;

export type TopicMode = 'reference' | 'visualize' | 'simulate';

export interface Topic {
  id: string;
  unit: UnitId;
  title: string;
  summary: string;
  modes: TopicMode[];
  simulatorId?: string;
  sourcePending?: boolean;
}

export interface Unit {
  id: UnitId;
  title: string;
  sourceFile: string;
  pages: string;
  topics: Topic[];
}

export const UNITS: Unit[] = [
  {
    id: 1,
    title: 'Foundations, Number Systems & Logic',
    sourceFile: 'unit 1 (3).pdf',
    pages: '161 pages',
    topics: [
      { id: 'coa-overview', unit: 1, title: 'COA overview', summary: 'Architecture vs organization, ISA as the software/hardware interface, design tradeoffs.', modes: ['reference'] },
      { id: 'computer-components', unit: 1, title: 'Computer components', summary: 'Processor, main memory and input/output, and how the CPU relates to memory and I/O.', modes: ['reference'] },
      { id: 'computer-evolution', unit: 1, title: 'Computer evolution', summary: 'Vacuum tubes, transistors, integrated circuits and microprocessors as named in the slides.', modes: ['reference'] },
      { id: 'abstraction-levels', unit: 1, title: 'Layered abstraction levels', summary: 'Levels 0 to 6 from Digital Logic to User, using the source numbering.', modes: ['reference'] },
      { id: 'von-neumann', unit: 1, title: 'von Neumann architecture', summary: 'Stored program, shared pathway for data and instructions, and the fetch-execute cycle.', modes: ['reference'] },
      { id: 'non-von-neumann', unit: 1, title: 'Non-von Neumann models', summary: 'Multiprocessor and dual-processor examples, shown as a static comparison.', modes: ['reference'] },
      { id: 'digital-systems', unit: 1, title: 'Digital systems', summary: 'Digital signals and their representation over time.', modes: ['reference'], sourcePending: true },
      { id: 'number-systems', unit: 1, title: 'Number systems', summary: 'Positional representation in decimal, binary, octal and hexadecimal.', modes: ['reference', 'simulate'], simulatorId: 'base-conversion' },
      { id: 'base-conversion', unit: 1, title: 'Base conversion', summary: 'Integer and fractional conversion between bases 2, 8, 10 and 16, with reverse checking.', modes: ['reference', 'simulate'], simulatorId: 'base-conversion' },
      { id: 'binary-codes', unit: 1, title: 'Binary numbers and binary coding', summary: 'n-bit representation, representable element counts and binary codes for decimal digits.', modes: ['reference'] },
      { id: 'bcd', unit: 1, title: 'Binary-coded decimal (BCD)', summary: 'Decimal digits encoded as 4-bit groups, with the bit-cost tradeoff.', modes: ['reference', 'simulate'], simulatorId: 'codes' },
      { id: 'gray-code', unit: 1, title: 'Gray code', summary: 'Adjacent values differ by one bit; binary and Gray conversion.', modes: ['reference', 'simulate'], simulatorId: 'codes' },
      { id: 'excess-3', unit: 1, title: 'Excess-3 code', summary: 'Digit plus 3 encoding and its self-complementary property.', modes: ['reference', 'simulate'], simulatorId: 'codes' },
      { id: 'ascii', unit: 1, title: 'ASCII', summary: 'Seven-bit character codes, including control characters 0 to 31 and 127.', modes: ['reference', 'simulate'], simulatorId: 'codes' },
      { id: 'parity', unit: 1, title: 'Parity code', summary: 'Even and odd parity bits and the receiver-side check.', modes: ['reference', 'simulate'], simulatorId: 'codes' },
      { id: 'binary-arithmetic', unit: 1, title: 'Binary arithmetic', summary: 'Addition, subtraction, multiplication and division in binary.', modes: ['reference', 'simulate'], simulatorId: 'binary-arith' },
      { id: 'signed-numbers', unit: 1, title: 'Signed binary representations', summary: 'Sign-magnitude, 1s complement and 2s complement, with subtraction by complement.', modes: ['reference', 'simulate'], simulatorId: 'binary-arith' },
      { id: 'logic-gates', unit: 1, title: 'Logic gates and Boolean algebra', summary: 'AND, OR, NOT, NAND, NOR, XOR and XNOR with truth tables.', modes: ['reference', 'simulate'], simulatorId: 'gates' },
    ],
  },
  {
    id: 2,
    title: 'Basic Structure, Memory & Instructions',
    sourceFile: 'unit 2 (5).pdf',
    pages: '129 pages',
    topics: [
      { id: 'functional-units', unit: 2, title: 'Functional units and buses', summary: 'Input, memory, ALU, output and control units; single and two-bus structures.', modes: ['reference'] },
      { id: 'memory-addressing', unit: 2, title: 'Memory, address space and endianness', summary: 'Addressability, address bits and byte order in memory.', modes: ['reference', 'simulate'], simulatorId: 'memory' },
      { id: 'instruction-formats', unit: 2, title: 'Instruction formats', summary: 'Zero-, one-, two- and three-address instructions and RTN notation.', modes: ['reference', 'simulate'], simulatorId: 'addressing' },
      { id: 'instruction-cycle', unit: 2, title: 'Instruction cycle', summary: 'Fetch, decode, execute and program-counter sequencing.', modes: ['reference', 'simulate'], simulatorId: 'addressing' },
      { id: 'addressing-modes', unit: 2, title: 'Addressing modes', summary: 'Immediate, direct, indirect, register, indexed, relative and auto-increment/decrement.', modes: ['reference', 'simulate'], simulatorId: 'addressing' },
      { id: 'microprocessors', unit: 2, title: 'Microprocessors and microcontrollers', summary: 'Distinction, internal structure and evolution as named in the slides.', modes: ['reference'] },
      { id: '8086', unit: 2, title: '8086 case study', summary: 'Instruction queue, segments, general and pointer registers, IP and flags.', modes: ['reference'], sourcePending: true },
    ],
  },
  {
    id: 3,
    title: 'ALU & Arithmetic Algorithms',
    sourceFile: 'Unit III (1).pptx',
    pages: '116 slides',
    topics: [
      { id: 'alu', unit: 3, title: 'ALU', summary: 'ALU role, configurations and block symbol.', modes: ['reference'], sourcePending: true },
      { id: 'adders', unit: 3, title: 'Half and full adders', summary: 'Half adder and full adder definitions, truth tables and Boolean expressions.', modes: ['reference', 'simulate'], simulatorId: 'gates' },
      { id: 'de-morgan', unit: 3, title: 'De Morgan theorems', summary: 'Both laws and their truth-table verification.', modes: ['reference', 'simulate'], simulatorId: 'gates', sourcePending: true },
      { id: 'ripple-carry', unit: 3, title: 'Ripple-carry adder', summary: 'Carry propagation from bit 0 upward.', modes: ['simulate'], simulatorId: 'ripple' },
      { id: 'cla', unit: 3, title: 'Carry-lookahead adder', summary: 'Generate and propagate signals and 4-bit lookahead carries.', modes: ['simulate'], simulatorId: 'cla' },
      { id: 'adder-subtractor', unit: 3, title: 'Binary adder and subtractor', summary: 'Subtraction by 1s and 2s complement with carry and overflow.', modes: ['simulate'], simulatorId: 'binary-arith' },
      { id: 'unsigned-multiplication', unit: 3, title: 'Unsigned multiplication', summary: 'Partial products and the shift-and-add process.', modes: ['simulate'], simulatorId: 'shift-add' },
      { id: 'booth', unit: 3, title: 'Booth signed multiplication', summary: 'A, Q, Q-1 and M with add, subtract or no-op decisions and arithmetic right shifts.', modes: ['simulate'], simulatorId: 'booth' },
      { id: 'carry-save', unit: 3, title: 'Carry-save addition', summary: 'Reducing three or more summands to sum and carry rows, then a final addition.', modes: ['simulate'], simulatorId: 'carry-save' },
      { id: 'division', unit: 3, title: 'Integer division', summary: 'Restoring and non-restoring division with quotient and remainder.', modes: ['simulate'], simulatorId: 'division', sourcePending: true },
      { id: 'ieee-754', unit: 3, title: 'IEEE 754 floating point', summary: 'Sign, exponent and fraction fields with biased exponents.', modes: ['reference', 'simulate'], simulatorId: 'ieee754', sourcePending: true },
    ],
  },
  {
    id: 4,
    title: 'Processor, Control & Pipeline',
    sourceFile: 'Unit 4 (2).pdf',
    pages: '99 pages',
    topics: [
      { id: 'processing-unit', unit: 4, title: 'Basic processing unit', summary: 'Fetching and executing one instruction in an instruction-set processor.', modes: ['reference', 'simulate'], simulatorId: 'datapath' },
      { id: 'single-bus', unit: 4, title: 'Single-bus datapath', summary: 'PC, registers, ALU, temporary registers, MAR and MDR on a bus.', modes: ['reference', 'simulate'], simulatorId: 'datapath', sourcePending: true },
      { id: 'register-transfer', unit: 4, title: 'Register transfers', summary: 'Input and output gates controlled by Riin and Riout.', modes: ['reference', 'simulate'], simulatorId: 'datapath', sourcePending: true },
      { id: 'control-units', unit: 4, title: 'Hardwired and microprogrammed control', summary: 'Control signals, control sequences and microinstruction organization.', modes: ['reference', 'simulate'], simulatorId: 'datapath', sourcePending: true },
      { id: 'pipelining', unit: 4, title: 'Instruction pipelining', summary: 'Sequential vs overlapped execution, 2-stage and 4-stage pipelines.', modes: ['reference', 'simulate'], simulatorId: 'pipeline' },
      { id: 'hazards', unit: 4, title: 'Pipeline hazards', summary: 'Structural, data and control hazards, forwarding, stalls and branches.', modes: ['reference', 'simulate'], simulatorId: 'pipeline' },
      { id: 'branch-prediction', unit: 4, title: 'Branch prediction', summary: 'Static prediction and the four-state predictor.', modes: ['reference', 'simulate'], simulatorId: 'predictor', sourcePending: true },
    ],
  },
  {
    id: 5,
    title: 'Parallelism, ARM & I/O',
    sourceFile: 'Unit 5 (5).pdf',
    pages: '96 pages',
    topics: [
      { id: 'parallelism', unit: 5, title: 'Parallelism', summary: 'Definition, goals, hardware and software parallelism.', modes: ['reference', 'simulate'], simulatorId: 'array-sum' },
      { id: 'flynn', unit: 5, title: 'Flynn classification', summary: 'Instruction streams and data streams: SISD, SIMD, MISD and MIMD.', modes: ['reference', 'visualize'], simulatorId: 'flynn' },
      { id: 'ilp-dlp', unit: 5, title: 'ILP and DLP', summary: 'Instruction-level and data-level parallelism with control and data dependence.', modes: ['reference', 'simulate'], simulatorId: 'array-sum' },
      { id: 'multicore', unit: 5, title: 'Single-core and multicore', summary: 'Replicated cores and per-core thread time-slicing.', modes: ['reference', 'simulate'], simulatorId: 'multicore' },
      { id: 'arm', unit: 5, title: 'ARM architecture', summary: 'ARM5 and ARM7, register set, processor modes and instruction families.', modes: ['reference'], sourcePending: true },
      { id: 'io', unit: 5, title: 'Memory-mapped and I/O-mapped I/O', summary: 'Program-controlled I/O and status-flag polling.', modes: ['reference', 'simulate'], simulatorId: 'io-polling' },
    ],
  },
];

export function findUnit(id: number): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function findTopic(id: string): Topic | undefined {
  return UNITS.flatMap((u) => u.topics).find((t) => t.id === id);
}
