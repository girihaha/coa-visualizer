import type { TopicNote } from './types';

export const UNIT4_NOTES: Record<string, TopicNote> = {
  'processing-unit': {
    definition: 'The basic processing unit fetches and executes instructions one at a time, using registers, an ALU and an internal bus under the direction of the control unit.',
    algorithm: ['Fetch: IR \u2190 [[PC]].', 'Increment: PC \u2190 [PC] + 4.', 'Carry out the actions specified by the instruction in IR.'],
    keyPoints: ['Execution is a sequence of register transfers, ALU operations and memory accesses.', 'Each step is enabled by control signals.', 'WMFC makes the processor wait for memory to finish.'],
    visualization: 'The datapath simulator steps through the control sequence for Add (R3), R1.',
  },
  'single-bus': {
    definition: 'In a single-bus datapath, PC, general registers, temporary registers Y and Z, MAR, MDR and the ALU all connect to one internal processor bus.',
    working: 'Because only one value can be on the bus at a time, the ALU\u2019s first operand is held in Y while the second comes from the bus, and the result is caught in Z.',
    keyPoints: ['Only one transfer per clock step.', 'Y and Z are needed because of the shared bus.', 'MAR drives the memory address lines; MDR exchanges data with memory.'],
    visualization: 'Datapath simulator, single-bus programs.',
  },
  'register-transfer': {
    definition: 'Each register has an input gate Riin and an output gate Riout. A transfer from Ri to Rj is done by enabling Riout and Rjin in the same clock step.',
    example: { label: 'Illustration', body: 'R1out, Yin copies R1 into Y.' },
    keyPoints: ['Only one register may drive the bus in a step.', 'Several registers may load from the bus at once.', 'These gate signals form the control word for each step.'],
  },
  'control-units': {
    definition: 'The control unit generates the control signals for each step. Hardwired control uses fixed logic driven by a step counter, the opcode and status flags. Microprogrammed control stores the control words as microinstructions in a control memory.',
    keyPoints: ['Hardwired control is faster but hard to modify.', 'Microprogrammed control is flexible and easier to design.', 'A microprogram counter (\u00b5PC) sequences the microinstructions.', 'Each microinstruction specifies which control signals are active.'],
    visualization: 'The datapath simulator lists the active control signals at every step.',
  },
  pipelining: {
    definition: 'Pipelining overlaps the execution of several instructions by dividing processing into stages, each working on a different instruction in the same clock cycle.',
    working: 'In a 4-stage pipeline the stages are Fetch (F), Decode (D), Execute (E) and Write (W). Interstage buffers hold results between stages.',
    formula: [{ expression: 'cycles = k + n \u2212 1', meaning: 'Ideal time for n instructions on a k-stage pipeline.' }, { expression: 'speedup \u2192 k', meaning: 'Approaches the number of stages for large n with no stalls.' }],
    keyPoints: ['Pipelining improves throughput, not the latency of one instruction.', 'Ideal throughput is one instruction per cycle.', 'Stalls caused by hazards reduce the speedup.'],
    visualization: 'The pipeline simulator draws the cycle-by-cycle space-time diagram.',
  },
  hazards: {
    definition: 'A hazard is any condition that causes the pipeline to stall. Data hazards arise when an instruction needs a result not yet produced; control hazards arise from branches; structural hazards arise when two instructions need the same hardware.',
    working: 'Data hazards are reduced by forwarding the ALU result directly to the next instruction. Control hazards cause wrongly fetched instructions to be discarded. A cache miss in fetch stalls following stages.',
    keyPoints: ['Data hazard: dependency on an unfinished result.', 'Forwarding (bypassing) removes many data stalls.', 'Branch penalty: instructions fetched after a branch may be flushed.', 'Structural hazard: resource conflict, e.g. one memory for instructions and data.'],
    visualization: 'Pipeline simulator: compare runs with and without forwarding.',
  },
  'branch-prediction': {
    definition: 'Branch prediction guesses the outcome of a branch before it is resolved so that fetching can continue. Static prediction always guesses the same way; dynamic prediction uses past behaviour.',
    working: 'The four-state (2-bit) predictor has states Strongly Taken, Weakly Taken, Weakly Not Taken and Strongly Not Taken. The prediction changes only after two consecutive mispredictions from a strong state.',
    keyPoints: ['A misprediction costs a pipeline flush.', 'The 2-bit scheme tolerates one unusual outcome, such as a loop exit.', 'The state moves one step toward the actual outcome after each branch.', 'Confirm the state names and transitions against the slide diagram.'],
    visualization: 'The branch predictor simulator animates the state diagram for your outcome sequence.',
  },
};
