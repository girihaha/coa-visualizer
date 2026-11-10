import type { UnitId } from '@/content/curriculum';

export interface VivaCard {
  id: string;
  unit: UnitId;
  topic: string;
  question: string;
  answer: string;
  why: string;
  visual: string;
}

export const VIVA_CARDS: VivaCard[] = [
  {
    id: 'arch-vs-org',
    unit: 1,
    topic: 'Architecture vs organization',
    question: 'How do architecture and organization differ?',
    answer:
      'Architecture concerns programmer-visible structure and behavior, including the instruction set. Organization concerns physical implementation aspects such as circuits, control signals and memory types.',
    why: "This is the comparison made in Unit 1's opening material.",
    visual: 'Reference page for the topic: architecture as the software/hardware interface, organization as the hardware detail.',
  },
  {
    id: 'von-neumann-bus',
    unit: 1,
    topic: 'von Neumann architecture',
    question: 'What travels on the shared pathway?',
    answer: 'Both instructions and data use the single pathway between memory, I/O and the CPU.',
    why: 'This is the stored-program model described in the source.',
    visual: 'Reference page for the topic; the shared pathway is named in the working section.',
  },
  {
    id: 'gray-adjacent',
    unit: 1,
    topic: 'Gray code',
    question: 'What property makes Gray code useful in transitions?',
    answer: 'Neighboring code values differ in one bit, which reduces simultaneous bit changes during a transition.',
    why: 'This is the adjacency property stated for Gray code in Unit 1.',
    visual: 'Reference page for the topic; the source table lists the adjacent codes.',
  },
  {
    id: 'bcd-group',
    unit: 1,
    topic: 'Binary-coded decimal (BCD)',
    question: 'How is a multi-digit decimal value represented in BCD?',
    answer: 'Each decimal digit is encoded separately as a 4-bit group.',
    why: 'BCD encodes digit by digit rather than converting the whole number to binary.',
    visual: 'Reference page for the topic.',
  },
  {
    id: 'full-adder-cin',
    unit: 3,
    topic: 'Half and full adders',
    question: 'What extra input does a full adder handle compared with a half adder?',
    answer: 'A carry-in, in addition to the two operand bits.',
    why: 'The half adder has two inputs; the full adder adds the incoming carry.',
    visual: 'Ripple-carry adder simulator shows the carry entering each column.',
  },
  {
    id: 'cla-why',
    unit: 3,
    topic: 'Carry-lookahead adder',
    question: 'Why can carry-lookahead reduce waiting compared with ripple carry?',
    answer:
      'It computes carries from generate and propagate signals instead of waiting for each carry to ripple through every earlier stage.',
    why: 'Generate and propagate let each carry be written directly from the inputs.',
    visual: 'Carry-lookahead simulator shows the P and G rows before the carries C1 to C4.',
  },
  {
    id: 'booth-pairs',
    unit: 3,
    topic: 'Booth signed multiplication',
    question: 'What do pairs 01 and 10 cause in the basic Booth procedure?',
    answer: '01 adds M to A; 10 subtracts M from A. An arithmetic right shift follows in both cases.',
    why: 'These are the two decision cases of the basic Booth procedure.',
    visual: 'Booth simulator highlights the Q0 and Q-1 pair and the chosen operation before each shift.',
  },
  {
    id: 'io-polling',
    unit: 5,
    topic: 'Memory-mapped and I/O-mapped I/O',
    question: 'What does the processor do while waiting in program-controlled I/O?',
    answer: 'It repeatedly checks a status flag until the device condition allows the transfer.',
    why: 'Program-controlled I/O is driven by the processor, which polls the device status.',
    visual: 'Reference page for the topic; the polling sequence is described in the source.',
  },
];
