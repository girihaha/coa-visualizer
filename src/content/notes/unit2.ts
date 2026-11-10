import type { TopicNote } from './types';

export const UNIT2_NOTES: Record<string, TopicNote> = {
  'functional-units': {
    definition: 'A computer has five functional units: input, memory, arithmetic and logic (ALU), output, and control. They are connected by buses.',
    working: 'In a single-bus structure all units share one bus, so only one transfer happens at a time. A two-bus structure separates, for example, the processor\u2013memory path from the I/O path to allow more concurrency.',
    keyPoints: ['The control unit coordinates all the other units.', 'A bus is a shared set of lines for address, data and control.', 'Single-bus designs are simple and cheap but slower.', 'More buses allow more transfers in parallel.'],
  },
  'memory-addressing': {
    definition: 'Memory is a set of locations, each with a unique address. The address space is the number of locations the address lines can select.',
    formula: [{ expression: 'address bits = \u2308log\u2082 N\u2309', meaning: 'N is the number of addressable locations.' }, { expression: 'N = capacity \u00f7 addressable unit', meaning: 'For a byte-addressable memory, N equals the number of bytes.' }],
    example: { label: 'Illustration', body: 'A 32 MB byte-addressable memory has 2\u00b2\u2075 locations, so it needs 25 address bits.' },
    keyPoints: ['Big-endian stores the most significant byte at the lowest address.', 'Little-endian stores the least significant byte at the lowest address.', 'Word alignment places words at addresses that are multiples of the word size.'],
    visualization: 'The byte order and address space simulator shows the same value in both layouts.',
  },
  'instruction-formats': {
    definition: 'Instruction formats are classified by how many operand addresses an instruction names: three, two, one or zero.',
    working: 'Three-address: ADD A, B, C. Two-address: ADD A, B (one operand is also the destination). One-address: uses an implied accumulator. Zero-address: operands come from a stack.',
    formula: [{ expression: 'R0 \u2190 R0 + [X]', meaning: 'Register transfer notation (RTN): square brackets mean "contents of".' }],
    keyPoints: ['Fewer addresses mean shorter instructions but more instructions per task.', 'RTN describes the effect of an instruction precisely.', 'Zero-address machines use PUSH and POP.'],
    visualization: 'The addressing simulator traces a two-operand instruction ADD R0, src step by step.',
  },
  'instruction-cycle': {
    definition: 'The instruction cycle is the sequence of steps the processor follows for every instruction: fetch, decode, operand fetch, execute and write back.',
    algorithm: ['MAR \u2190 PC; read memory.', 'IR \u2190 MDR; PC \u2190 PC + instruction length.', 'Decode the opcode in IR.', 'Compute the effective address and fetch the operand.', 'Execute in the ALU and write the result.'],
    keyPoints: ['PC always holds the address of the next instruction.', 'IR holds the instruction being executed.', 'MAR and MDR connect the processor to memory.'],
    visualization: 'The addressing simulator shows each stage of the cycle with PC, IR, MAR and MDR.',
  },
  'addressing-modes': {
    definition: 'An addressing mode specifies how the location of an operand is found from the instruction.',
    working: 'Immediate: operand in the instruction. Direct (absolute): address in the instruction. Indirect: the instruction points to the address. Register: operand in a register. Register indirect: register holds the address. Indexed: EA = X + [Ri]. Relative: EA = X + [PC]. Auto-increment: use [Ri] then increment. Auto-decrement: decrement then use [Ri].',
    formula: [{ expression: 'EA = X + [Ri]', meaning: 'Indexed addressing; X is a constant offset.' }, { expression: 'EA = X + [PC]', meaning: 'Relative addressing.' }],
    keyPoints: ['Immediate needs no memory access for the operand.', 'Indirect needs one extra memory read.', 'Indexed suits arrays; relative suits branches.', 'Auto-increment and auto-decrement support stacks and list traversal.'],
    visualization: 'The addressing simulator computes the effective address for each mode and highlights the memory cells read.',
  },
  microprocessors: {
    definition: 'A microprocessor is a CPU on a single chip. A microcontroller adds memory and I/O peripherals on the same chip to form a complete small computer.',
    keyPoints: ['Microprocessors need external memory and I/O.', 'Microcontrollers are designed for embedded, dedicated tasks.', 'Microprocessors evolved from 4-bit and 8-bit to 16, 32 and 64-bit designs.'],
  },
  '8086': {
    definition: 'The Intel 8086 is a 16-bit microprocessor divided into a Bus Interface Unit (BIU) and an Execution Unit (EU).',
    working: 'The BIU prefetches instruction bytes into a 6-byte queue and forms 20-bit physical addresses from segment and offset registers. The EU decodes and executes instructions.',
    formula: [{ expression: 'physical address = segment \u00d7 16 + offset', meaning: 'Gives a 20-bit address (1 MB space).' }],
    keyPoints: ['Segment registers: CS, DS, SS, ES.', 'General registers: AX, BX, CX, DX.', 'Pointer and index registers: SP, BP, SI, DI; IP holds the next instruction offset.', 'The flag register records status and control flags.'],
  },
};
