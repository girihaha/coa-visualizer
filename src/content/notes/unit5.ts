import type { TopicNote } from './types';

export const UNIT5_NOTES: Record<string, TopicNote> = {
  parallelism: {
    definition: 'Parallelism is performing several computations at the same time to finish a task faster or handle more work.',
    purpose: 'To increase throughput and reduce execution time beyond what a faster single processor can deliver.',
    working: 'Hardware parallelism comes from pipelines, multiple functional units and multiple processors. Software parallelism comes from the structure of the program: independent instructions, data and tasks.',
    keyPoints: ['Hardware and software parallelism must match to be useful.', 'Dependencies limit how much work can run at once.', 'Communication and synchronization add overhead.'],
    visualization: 'The data-parallel array sum splits additions across lanes.',
  },
  flynn: {
    definition: 'Flynn\u2019s classification groups computers by the number of instruction streams and data streams: SISD, SIMD, MISD and MIMD.',
    keyPoints: ['SISD: a conventional uniprocessor.', 'SIMD: one instruction applied to many data elements (array and vector processors).', 'MISD: rarely built.', 'MIMD: multiprocessors and multicore systems.'],
    visualization: 'The Flynn taxonomy explorer draws the streams for each class.',
  },
  'ilp-dlp': {
    definition: 'Instruction-level parallelism (ILP) executes independent instructions from one stream at the same time. Data-level parallelism (DLP) applies the same operation to many data items simultaneously.',
    working: 'Data dependence occurs when an instruction uses a result of an earlier one. Control dependence occurs when whether an instruction runs depends on a branch.',
    keyPoints: ['Pipelining and superscalar issue exploit ILP.', 'SIMD and vector units exploit DLP.', 'Dependences determine the order instructions must keep.'],
  },
  multicore: {
    definition: 'A multicore processor places several independent cores on one chip. Each core can run its own thread.',
    working: 'On a single core, threads share time by being switched in slices. With several cores, threads run truly in parallel, and each core still time-slices among the threads assigned to it.',
    keyPoints: ['More cores raise throughput without raising clock speed.', 'Threads assigned to the same core still share its time.', 'Software must be multithreaded to benefit.'],
    visualization: 'The multicore scheduling simulator builds a per-core timeline.',
  },
  arm: {
    definition: 'ARM is a 32-bit RISC architecture with a load/store design. The supplied material describes 37 registers, each 32 bits long.',
    keyPoints: ['16 registers (R0\u2013R15) are visible in a mode; R13 is SP, R14 is LR and R15 is PC.', 'CPSR holds condition flags and mode bits; SPSRs save it on exceptions.', 'Processor modes include User, FIQ, IRQ, Supervisor, Abort, Undefined and System.', 'Instruction families: data processing, data transfer, branch and others.'],
  },
  io: {
    definition: 'In memory-mapped I/O, device registers share the memory address space and are accessed with ordinary load and store instructions. In I/O-mapped (isolated) I/O, devices have a separate address space accessed by special IN and OUT instructions.',
    working: 'In program-controlled I/O, the processor repeatedly reads a device status flag (such as SIN) until the device is ready, then transfers the data.',
    algorithm: ['Read the status register.', 'If the ready flag is 0, go back to step 1.', 'Read the data register (this clears the flag).', 'Store the data and repeat for the next item.'],
    keyPoints: ['Memory-mapped I/O needs no special instructions but uses up address space.', 'I/O-mapped I/O keeps addresses separate but needs extra instructions and control lines.', 'Polling wastes processor time while waiting.', 'Interrupts and DMA avoid busy waiting.'],
    visualization: 'The I/O polling simulator counts every wasted status check.',
  },
};
