import type { TopicNote } from './types';

export const UNIT1_NOTES: Record<string, TopicNote> = {
  'coa-overview': {
    definition: 'Computer architecture refers to the attributes of a system visible to the programmer, such as the instruction set, data representation, I/O mechanisms and addressing. Computer organization refers to the operational units and their interconnections that realise the architecture, such as control signals, interfaces and memory technology.',
    purpose: 'Separating the two lets one architecture (and its software) survive many different hardware implementations.',
    working: 'The instruction set architecture (ISA) sits at the boundary: software is written against it, and the organization decides how the hardware carries it out.',
    keyPoints: ['Architecture answers "what does the machine do" from the programmer\u2019s view.', 'Organization answers "how is it implemented" in hardware.', 'The ISA is the interface between software and hardware.', 'A family of machines can share an architecture while differing in organization.'],
  },
  'computer-components': {
    definition: 'A computer is built from a processor (CPU), main memory and input/output modules, connected by a system interconnection (bus).',
    working: 'The CPU fetches instructions and data from memory, processes them, and exchanges data with the outside world through I/O modules.',
    keyPoints: ['The CPU contains the control unit, ALU and registers.', 'Main memory holds both programs and data.', 'I/O modules move data between the computer and its external environment.', 'Components communicate over shared buses.'],
  },
  'computer-evolution': {
    definition: 'Computers evolved through generations defined by their switching technology: vacuum tubes, transistors, integrated circuits, and then large-scale integration leading to microprocessors.',
    purpose: 'Each step reduced size, cost and power while increasing speed and reliability.',
    keyPoints: ['First generation: vacuum tubes.', 'Second generation: transistors.', 'Third generation: integrated circuits.', 'Later generations: LSI/VLSI and the microprocessor on a single chip.'],
  },
  'abstraction-levels': {
    definition: 'A computer can be viewed as a hierarchy of virtual machines, each level using the services of the level below. The slides number these from Level 0 (Digital Logic) up to Level 6 (User).',
    working: 'Programs at a higher level are translated or interpreted down to the level below until they are executed by digital circuits.',
    keyPoints: ['Level 0 is digital logic: gates and wires.', 'Higher levels include control, machine (ISA), system software, assembly language, high-level language and user.', 'Each level hides the detail of the levels beneath it.', 'Use the numbering exactly as printed in the slides when answering exam questions.'],
  },
  'von-neumann': {
    definition: 'In the von Neumann (stored-program) architecture, instructions and data are stored together in the same read-write memory and travel over a single shared pathway to the CPU.',
    purpose: 'Storing the program in memory means the machine can be reprogrammed by loading new instructions rather than rewiring.',
    working: 'The CPU repeatedly fetches the instruction addressed by the program counter, decodes it, fetches any operands, executes it, and moves on to the next instruction.',
    algorithm: ['Fetch the instruction at the address held in PC.', 'Increment PC.', 'Decode the instruction.', 'Fetch operands if needed.', 'Execute and store the result.', 'Repeat.'],
    keyPoints: ['Programs and data share one memory.', 'A single pathway carries both, so they cannot be fetched at the same time (the von Neumann bottleneck).', 'Execution is sequential under control of the PC.', 'The fetch-execute cycle is the basic operating loop.'],
    visualization: 'The addressing simulator shows an instruction being fetched and its operand being read over the same memory path in separate stages.',
  },
  'non-von-neumann': {
    definition: 'Non-von Neumann models depart from a single processor sequentially executing one stored instruction stream, for example multiprocessor and dual-processor systems.',
    keyPoints: ['They aim to overcome the sequential, single-pathway bottleneck.', 'Several processors can work at the same time.', 'Covered in the slides as a static comparison rather than a detailed design.'],
  },
  'digital-systems': {
    definition: 'A digital system represents information using discrete signal levels, usually two (0 and 1), rather than continuously varying values.',
    keyPoints: ['A digital signal changes between defined levels over time.', 'Binary representation makes circuits simpler and more noise tolerant.', 'Detailed waveform diagrams in the slides still need visual verification.'],
  },
  'number-systems': {
    definition: 'A positional number system gives each digit a weight equal to the base raised to the digit\u2019s position.',
    formula: [{ expression: 'N = \u03a3 d\u1d62 \u00d7 b\u2071', meaning: 'd\u1d62 is the digit at position i (0 for the units digit, negative for fractional digits) and b is the base.' }],
    example: { label: 'Illustration', body: '(1011.1)\u2082 = 8 + 0 + 2 + 1 + 0.5 = (11.5)\u2081\u2080.' },
    keyPoints: ['Common bases: 2, 8, 10 and 16.', 'Hexadecimal digits A\u2013F stand for 10\u201315.', 'One octal digit groups 3 bits; one hex digit groups 4 bits.'],
  },
  'base-conversion': {
    definition: 'Base conversion rewrites a number from one base into another while keeping its value.',
    algorithm: ['Integer part: divide repeatedly by the target base and read the remainders from last to first.', 'Fractional part: multiply repeatedly by the target base and read the integer parts from first to last.', 'Between binary, octal and hexadecimal: group bits in 3s or 4s from the radix point.', 'Check the answer by converting back using positional weights.'],
    example: { label: 'Illustration', body: '46.6875 (decimal) = 101110.1011 (binary): 46 gives remainders 0,1,1,1,0,1 read upward; 0.6875 \u00d7 2 gives 1, 0, 1, 1.' },
    keyPoints: ['Some decimal fractions do not terminate in binary.', 'Always state how many fractional digits were kept.', 'Grouping must start at the radix point.'],
    visualization: 'The base conversion workbench shows every division and multiplication step.',
  },
  'binary-codes': {
    definition: 'A binary code assigns a distinct bit pattern to each element of a set. With n bits, 2\u207f distinct elements can be represented.',
    formula: [{ expression: 'elements = 2\u207f', meaning: 'n is the number of bits.' }, { expression: 'n = \u2308log\u2082 m\u2309', meaning: 'Minimum bits for m elements.' }],
    keyPoints: ['Codes may be weighted (BCD 8421) or unweighted (Gray, excess-3).', 'Ten decimal digits need at least 4 bits.', 'Choice of code depends on arithmetic, error-detection or transition needs.'],
  },
  bcd: {
    definition: 'Binary Coded Decimal (8421 code) represents each decimal digit separately by its 4-bit binary value.',
    example: { label: 'Illustration', body: '395 = 0011 1001 0101 in BCD.' },
    keyPoints: ['Codes 1010 to 1111 are invalid in BCD.', 'BCD is easy to convert to and from decimal displays.', 'It uses more bits than pure binary for the same value.'],
    visualization: 'Code conversion and parity simulator, BCD mode.',
  },
  'gray-code': {
    definition: 'Gray code is an unweighted code in which successive values differ in exactly one bit.',
    algorithm: ['Binary to Gray: keep the most significant bit; each next Gray bit is the XOR of the current and previous binary bits.', 'Gray to binary: keep the MSB; each next binary bit is the XOR of the previous binary bit and the current Gray bit.'],
    example: { label: 'Illustration', body: 'Binary 1011 becomes Gray 1110.' },
    keyPoints: ['Only one bit changes between neighbours, reducing errors during transitions.', 'Used in shaft encoders and similar position sensors.', 'Not suitable for direct arithmetic.'],
  },
  'excess-3': {
    definition: 'Excess-3 is an unweighted BCD code formed by adding 3 (0011) to each decimal digit before encoding it in 4 bits.',
    example: { label: 'Illustration', body: 'Decimal 5 becomes 0101 + 0011 = 1000.' },
    keyPoints: ['It is self-complementing: the 9s complement is obtained by inverting the bits.', 'No valid code word is all zeros.'],
  },
  ascii: {
    definition: 'ASCII is a 7-bit character code representing letters, digits, punctuation and control characters (128 codes).',
    example: { label: 'Illustration', body: "'A' = 65 = 100 0001; 'a' = 97 = 110 0001." },
    keyPoints: ['Upper- and lower-case letters differ only in bit 5.', 'Digits 0\u20139 are codes 48\u201357.', 'An eighth bit is often used for parity.'],
  },
  parity: {
    definition: 'A parity bit is an extra bit added so that the total number of 1s is even (even parity) or odd (odd parity).',
    working: 'The sender computes the parity bit; the receiver recounts the 1s. A mismatch reveals an error.',
    keyPoints: ['Single-bit errors are detected.', 'An even number of flipped bits goes undetected.', 'Parity detects errors but cannot correct them.'],
    visualization: 'Code conversion and parity simulator: flip a bit to see the check fail.',
  },
  'binary-arithmetic': {
    definition: 'Binary addition and subtraction follow column rules with carries and borrows, exactly like decimal arithmetic but with base 2.',
    formula: [{ expression: '0+0=0, 0+1=1, 1+1=10, 1+1+1=11', meaning: 'Column addition rules (sum, carry).' }],
    keyPoints: ['Subtraction is usually done by adding the 2s complement.', 'The final carry out signals an unsigned overflow.', 'Overflow in signed addition is detected when the carry into and out of the sign bit differ.'],
  },
  'signed-numbers': {
    definition: 'Signed integers can be represented in sign-magnitude, 1s complement or 2s complement form.',
    formula: [{ expression: '\u2212x = (NOT x) + 1', meaning: '2s complement negation.' }, { expression: '\u22122\u207f\u207b\u00b9 \u2026 2\u207f\u207b\u00b9 \u2212 1', meaning: 'Range of n-bit 2s complement.' }],
    keyPoints: ['2s complement has a single zero.', 'Sign-magnitude and 1s complement have +0 and \u22120.', 'The MSB indicates the sign in all three forms.'],
  },
  'logic-gates': {
    definition: 'Logic gates are circuits that implement Boolean functions of one or more binary inputs.',
    formula: [{ expression: 'AND: A\u00b7B   OR: A+B   NOT: A\u2032', meaning: 'Basic gates.' }, { expression: 'NAND: (A\u00b7B)\u2032   NOR: (A+B)\u2032', meaning: 'Universal gates.' }, { expression: 'XOR: A\u2295B   XNOR: (A\u2295B)\u2032', meaning: 'Exclusive gates.' }],
    keyPoints: ['A truth table lists the output for every input combination.', 'NAND and NOR are universal: any function can be built from either alone.', 'XOR outputs 1 when the inputs differ.'],
    visualization: 'The gates explorer lets you toggle inputs and highlights the matching truth-table row.',
  },
};
