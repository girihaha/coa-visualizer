import type { TopicNote } from './types';

export const UNIT3_NOTES: Record<string, TopicNote> = {
  alu: {
    definition: 'The arithmetic logic unit (ALU) performs arithmetic operations such as addition and subtraction and logic operations such as AND, OR and NOT on its operands.',
    working: 'Operands come from registers; a function select input from the control unit chooses the operation; the result and status flags (carry, zero, sign, overflow) are produced.',
    keyPoints: ['The ALU is the part of the CPU that computes.', 'Flags record properties of the last result.', 'The slide block symbol shows two operand inputs, a function select and an output.'],
  },
  adders: {
    definition: 'A half adder adds two bits and produces a sum and a carry. A full adder adds two bits plus a carry-in.',
    formula: [{ expression: 'Half adder: S = A\u2295B, C = A\u00b7B', meaning: 'Two inputs.' }, { expression: 'Full adder: S = A\u2295B\u2295Cin, Cout = AB + Cin(A\u2295B)', meaning: 'Three inputs.' }],
    keyPoints: ['A full adder can be built from two half adders and an OR gate.', 'Full adders are chained to add multi-bit numbers.', 'The carry-in is what distinguishes a full adder.'],
    visualization: 'The gates explorer has an adders view with live truth tables.',
  },
  'de-morgan': {
    definition: 'De Morgan\u2019s theorems relate the complement of a product or sum to the sum or product of complements.',
    formula: [{ expression: '(A\u00b7B)\u2032 = A\u2032 + B\u2032', meaning: 'First law: NAND equals OR of inverted inputs.' }, { expression: '(A+B)\u2032 = A\u2032\u00b7B\u2032', meaning: 'Second law: NOR equals AND of inverted inputs.' }],
    keyPoints: ['Both laws are proved by comparing every row of a truth table.', 'They explain why NAND and NOR are universal.', 'They are used to simplify and transform logic circuits.'],
    visualization: 'The gates explorer De Morgan view evaluates both sides for your inputs.',
  },
  'ripple-carry': {
    definition: 'A ripple-carry adder chains n full adders; the carry out of each stage is the carry in of the next.',
    keyPoints: ['Simple and regular.', 'The sum is valid only after the carry has rippled through every stage, so delay grows with n.', 'Bit 0 settles first.'],
  },
  cla: {
    definition: 'A carry-lookahead adder computes all carries directly from generate and propagate signals instead of waiting for them to ripple.',
    formula: [{ expression: 'G\u1d62 = A\u1d62B\u1d62,  P\u1d62 = A\u1d62\u2295B\u1d62', meaning: 'Generate and propagate.' }, { expression: 'C\u1d62\u208a\u2081 = G\u1d62 + P\u1d62C\u1d62', meaning: 'Expanded so every carry depends only on G, P and C\u2080.' }],
    keyPoints: ['Carries are produced in a fixed number of gate levels.', 'Faster than ripple carry at the cost of more gates.', 'Usually built in 4-bit blocks.'],
  },
  'adder-subtractor': {
    definition: 'A binary adder-subtractor uses one adder plus XOR gates: when the control M = 1, B is inverted and the carry-in is set to 1, giving A + B\u2032 + 1 = A \u2212 B.',
    keyPoints: ['Subtraction is addition of the 2s complement.', 'Signed overflow occurs when the carries into and out of the MSB differ.', 'The same hardware does both operations.'],
  },
  'unsigned-multiplication': {
    definition: 'Unsigned binary multiplication forms a partial product for each multiplier bit (the multiplicand or zero) and adds them with appropriate shifts.',
    algorithm: ['Clear the accumulator A.', 'If the low multiplier bit Q\u2080 is 1, add M to A.', 'Shift C, A, Q right one place.', 'Repeat n times; the product is in A:Q.'],
    keyPoints: ['An n \u00d7 n multiply gives a 2n-bit product.', 'Each step needs at most one addition.'],
  },
  booth: {
    definition: 'Booth\u2019s algorithm multiplies signed 2s complement numbers by examining pairs of multiplier bits (Q\u2080, Q\u208b\u2081).',
    algorithm: ['Set A = 0, Q\u208b\u2081 = 0.', 'If (Q\u2080,Q\u208b\u2081) = 10, A \u2190 A \u2212 M.', 'If (Q\u2080,Q\u208b\u2081) = 01, A \u2190 A + M.', 'If 00 or 11, do nothing.', 'Arithmetic shift right A, Q, Q\u208b\u2081.', 'Repeat n times; the product is A:Q.'],
    keyPoints: ['Handles negative multipliers directly.', 'Runs of 1s cost only one subtraction and one addition.', 'The shift must preserve the sign bit.'],
  },
  'carry-save': {
    definition: 'Carry-save addition adds three numbers at once by producing separate sum and carry vectors without propagating carries.',
    working: 'Each bit position uses a full adder on the three input bits. The carry vector is shifted left one place. A final ordinary adder combines the sum and carry vectors.',
    keyPoints: ['Reduces three operands to two in one full-adder delay.', 'Used to speed up adding many partial products in multipliers.', 'Only the final step needs carry propagation.'],
  },
  division: {
    definition: 'Restoring and non-restoring division compute quotient and remainder by repeated shift and trial subtraction.',
    algorithm: ['Shift A:Q left one place.', 'Restoring: A \u2190 A \u2212 M; if A < 0 set Q\u2080 = 0 and restore A \u2190 A + M, otherwise set Q\u2080 = 1.', 'Non-restoring: if A \u2265 0 subtract M, else add M; then set Q\u2080 = 1 if the new A \u2265 0, else 0.', 'After n steps, non-restoring adds M once more if A < 0.'],
    keyPoints: ['The quotient ends in Q and the remainder in A.', 'Non-restoring avoids the separate restore addition in each step.'],
  },
  'ieee-754': {
    definition: 'IEEE 754 single precision represents a real number in 32 bits: 1 sign bit, 8 exponent bits with a bias of 127, and 23 fraction bits.',
    formula: [{ expression: 'value = (\u22121)\u02e2 \u00d7 1.F \u00d7 2^(E \u2212 127)', meaning: 'Normalised numbers; S is the sign, E the stored exponent, F the fraction.' }],
    example: { label: 'Illustration', body: '85.125 = 1.010101001 \u00d7 2\u2076, so the stored exponent is 127 + 6 = 133 (10000101).' },
    keyPoints: ['The leading 1 is implicit and not stored.', 'E = 0 and E = 255 are reserved for zero, denormals, infinity and NaN.', 'Double precision uses 11 exponent bits (bias 1023) and 52 fraction bits.'],
  },
};
