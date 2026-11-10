# COA Visualizer & Simulation Platform

**Academic research, product architecture, and Bolt handoff specification**  
**Course source label:** 21CSS201T – Computer Organization and Architecture  
**Prepared from:** five supplied teaching files in this workspace  
**Audience:** students, faculty demonstrators, and the AI implementation team building the later website

## 1. Project Overview

### Product purpose

Create a browser-based learning platform that makes the supplied Computer Organization and Architecture (COA) material inspectable and demonstrable. Learners should move between a short source-grounded explanation, a visual model, and a deterministic worked execution. Simulations must expose state (bits, registers, memory words, pipeline stages, control signals) and let a learner advance through meaningful steps.

### Problem statement

The source material explains many processes through slide text, tables, and diagrams. In a static presentation, it is difficult for a learner to inspect how values change over time, compare alternative execution paths, or explain why a particular result follows from an algorithm. This platform turns selected procedures into replayable, inspectable learning experiences while retaining concise reference material for concepts that do not need simulation.

### Objectives

- Organize the material by the five supplied units and expose a searchable topic index.
- Preserve the distinction between architecture (programmer-visible structure/behavior) and organization (physical implementation aspects) from Unit 1.
- Offer genuine stepwise execution for supported conversions, arithmetic algorithms, datapath transfers, memory access, and pipeline examples.
- Use diagrams and motion only where they communicate a relationship, sequence, or changing state.
- Include worked examples, formulas/notation where present in source, revision notes, and source-grounded viva prompts.
- Make the platform usable on desktop, tablet, and mobile without sacrificing simulation readability.

### Scope and source policy

The included curriculum is exactly the content visible in the supplied files listed in Section 2. Some slides are primarily images or have empty text extraction. The topic is included when supported by a title, surrounding slides, or readable visible text; details that cannot be verified are explicitly tagged **Source detail to verify**. Do not silently fill such gaps with a generic textbook treatment. Where a formula or algorithm is a standard operational rule required to make a source-named simulator function, label it **operational rule for the simulator** and have academic reviewers verify it against the course slides before release.

This is a design specification, not website implementation code. No framework, API, or code structure is prescribed.

## 2. Source Material Analysis

| Source file | Source identity / extent | Topics identified |
|---|---|---|
| `unit 1 (3).pdf` | 21CSS201T COA, Unit 1, 161 pages | Architecture and organization, computer components, generations, abstraction levels, von Neumann and fetch-execute, number systems/conversion, binary codes, arithmetic, signed numbers, BCD, logic gates, Boolean algebra |
| `unit 2 (5).pdf` | 21CSS201T COA, 129 pages | Basic structure and functional units, buses, memory and addressing, endian formats, instruction sequencing and formats, instruction cycle, addressing modes, microprocessors and 8086 |
| `Unit III (1).pptx` | 21CSS201T COA, 116 slides | ALU, adders, Boolean laws, multiplication and division algorithms, IEEE 754 floating-point |
| `Unit 4 (2).pdf` | 21CSS201T COA, Unit 4, 99 pages | Processor datapath, register transfers, memory transfers, control unit designs, instruction pipelining, hazards, branch prediction |
| `Unit 5 (5).pdf` | 21CSS201T COA, 96 pages | Parallelism, Flynn taxonomy, ARM5/ARM7 architecture and instructions, multi-core, I/O concepts |

### Source limitations and ambiguities

1. Text extraction confirmed all page/slide counts and the topic headings above. Several PDF pages and PowerPoint slides are diagram-led or contain little extractable text; this is especially noticeable in Unit 2 pages 20–31, Unit 5 pages 32–64, and Unit III several circuit/algorithm figures. Bolt should use only the named concept plus verified labels and values; a faculty reviewer should validate any detailed reconstructed circuit or example against the original visual slide.
2. Unit 2 has a title “Case Study: 8086” and later pages on its architecture, registers, flags, segments, assembly language and an assembly example. The extracted text does not reliably expose every example line. Show the source’s actual assembly listing only when transcribed and checked against the slide; otherwise show the concept and mark its example “slide example to transcribe.”
3. Unit 5 includes a large run of image-heavy slides between ARM/multicore and memory-mapped vs I/O-mapped I/O. Some associated specific subtopics are not recoverable from slide text. Do not infer additional ARM topics from those blank pages.
4. The Unit III slides name IEEE 754, single and double precision, biased exponent examples, special values and range, but some details are embedded in diagrams. Any bit-level encoder must provide an explicit format configuration and be reviewed against the teaching deck. The source mentions special values but extracted content is incomplete; explain only categories confirmed by visual review.
5. In Unit 1, the hierarchy is labeled Level 0 Digital Logic through Level 6 User, with intervening Machine, System Software, Assembly Language, and High-Level Language. Retain the source numbering and descriptions, not a differently numbered textbook model.
6. The source labels some features/evolution histories with dates and vendors. These are reference facts, not interactive claims; reproduce only with source attribution and avoid expanding history beyond the supplied material.

### Evidence and content handling

Treat the provided five files as the academic source of truth. Preserve their unit mapping: Unit III means Unit 3; Unit 4 and Unit 5 retain their supplied labels. Where source examples are called out below, use the same operands where legible. If an example’s operands cannot be verified, accept learner-entered operands and use the labeled operational rule rather than inventing a “source example.”

## 3. Complete Topic Inventory

This inventory consolidates repeated slides into concepts while retaining the named subtopics. It is the canonical curriculum map. Every row must appear in the platform either as a learning page, a subtopic/reference entry, or a stated source limitation.

### Unit 1 – Architecture foundations, number systems, codes, and logic

1. COA overview: definition of a computer; reasons to study architecture and organization; computer architecture vs computer organization; ISA as software/hardware interface; design tradeoffs.
2. Computer components: processor, main memory, input/output; basic function of each; CPU relationship to memory/I/O.
3. Computer evolution: first generation/vacuum tubes, second/transistors, third/integrated circuits, fourth/microprocessors (1971–present, as stated in slide).
4. Layered/abstract machine: levels 0–6 – Digital Logic, Machine, System Software, Assembly Language, High-Level Language, User (level 6); include level-specific descriptions from slides.
5. von Neumann architecture: stored program, shared pathway/bus for data and instructions, CPU/memory/I/O, fetch-execute cycle; fetch, decode, operand fetch, execute/write result as described.
6. Non-von Neumann models: title and examples include multiprocessor evolution/dual processors; use a static comparison; avoid unsupported taxonomy.
7. Digital systems: digital system/computer examples, signals and signal examples over time, digital representation.
8. Number systems: positional representation; decimal, binary, octal, hexadecimal; powers of two; common bases.
9. Base conversion: integer and fractional conversion; binary/octal/hex group conversion; decimal conversion; octal↔binary/decimal/hex; hexadecimal↔binary/decimal/octal; verification by converting back; visible worked examples including 46.6875₁₀ to base 2 and the source’s octal/hex examples.
10. Binary numbers and binary coding: n-bit representation, number of representable elements, minimum bit count, binary codes for decimal digits.
11. BCD: decimal-to-BCD and binary-to-BCD conversion as shown; benefits and bit-cost disadvantage; BCD addition and subtraction examples.
12. Gray code: property that adjacent values differ by one bit (as source describes); binary↔Gray conversion steps/table, decimal-to-Gray table where supplied; merits/demerits.
13. Excess-3 (XS-3): definition, decimal conversion, binary-to-Excess-3 and reverse examples, self-complementary advantage.
14. ASCII: American Standard Code for Information Interchange, character codes, 7-bit grouping, control-character range 0–31 and 127, source encoding example.
15. Parity code: even/odd parity bit construction; receiver-side parity check and error-detection limitations/advantages as stated.
16. Binary arithmetic: addition, subtraction, multiplication, division; single-bit truth tables/carry/borrow and multi-bit examples from slides.
17. Signed binary representations: sign-magnitude and complements as listed; 1’s complement, 2’s complement; subtraction using 1’s/2’s complement and worked examples.
18. Logic gates: Boolean algebra, binary inputs/outputs, truth tables, gate classification; AND, OR, NOT, NAND, NOR, XOR and XNOR; symbols, truth tables, universal-gate role, examples.

### Unit 2 – Basic structure, memory, instructions, and 8086

1. Basic structure of computers; computer architecture design aspects; computer types/categories (including microcomputer and supercomputer).
2. Functional units and functions: input, memory, ALU, output, control; computer operation and information flow.
3. ALU and control unit; control/timing reference signal (clock); registers as temporary fast storage; source slide example `Add R1, R2`.
4. Bus structures: bus definition, address/data/control buses, single-bus structure and drawbacks, two-bus structure, memory/device connection; address-line selection and relationship 2^x = n as shown.
5. Memory hierarchy; memory locations and addresses; main memory; address space; addressability and address-bit example (32 MB question); memory read/write operations.
6. Byte addressing and endianness: big-endian vs little-endian assignments; aligned words; byte-address examples from slides.
7. Instruction and sequencing: instruction and instruction set, register transfer notation (RTN), transfer examples, data-transfer, data-manipulation, arithmetic, logical/bit-manipulation and shift/rotate instructions.
8. Instruction formats by address count: zero-, one-, two-, and three-address instruction; evaluate `(A+B) * (C+D)` in formats as shown; source notes about accumulator/implied operands and stack-based zero-address form.
9. Instruction cycle and execution: fetch, decode/operand handling, execute, result; straight-line sequencing and program-counter advancement; source examples including repeated addition/loop and condition codes.
10. Condition codes: status from operation results used by conditional branch instructions.
11. Addressing modes: immediate, direct, indirect, register direct, register indirect, indexed, relative/displacement, auto-increment, auto-decrement. For each show instruction operand, effective-address path, register/memory effects; verify exact notation with source slide.
12. Microprocessor and microcontroller distinction; internal structure/basic operation; data transfer with memory/I/O; microprocessor types and evolution (as named in slides).
13. 8086 case study: history/features, instruction queue (six instruction bytes per slide), architecture, segments, general-purpose registers (AX/BX/CX/DX roles where legible), pointers/index registers (SP/BP/SI/DI), IP, segment registers, flag/status register, assembly language and source code example.

### Unit 3 – ALU, arithmetic circuits and numeric arithmetic

1. ALU role/configurations and ALU block symbol.
2. Adders: half adder and full adder definitions, circuit, truth table, Boolean expressions.
3. ALU design: 1-bit ALU control inputs S1/S0 and supported operation table; combine four 1-bit blocks into 4-bit ALU; 16-bit ALU design. Exact function mapping must match source diagram.
4. De Morgan’s theorems: both laws, logic diagrams, truth-table verification and engineering use; retain slide’s equation forms after visual verification.
5. Ripple-carry adder: serial carry propagation, 4-bit circuit/example, carry propagation behavior.
6. Carry-lookahead adder: generate and propagate signals, sum/carry expressions, 4-bit CLA structure, propagation-delay comparison stated in source.
7. Binary parallel adder/subtractor: mode M, XOR-conditioned B input, carry-in and add/subtract behavior.
8. Unsigned binary multiplication: partial products, AND bit products, array/long multiplication and worked examples.
9. Shift-and-add multiplier: register/process view, repeated conditional addition and shifting; source examples include 9×12 and 11×13.
10. Signed multiplication – Booth algorithm: A, Q, Q−1, M, iteration; pair rules, add/subtract/no operation, arithmetic right shift; source includes standard and alternate/recoded method material. Implement the explicitly presented basic Booth procedure first; expose recoding as a distinct explained topic only after slide verification.
11. Fast multiplication: bit-pair recoding of multipliers (derived from Booth, halves maximum summands per slides); show recoding table/example verified from source.
12. Carry-save addition of summands: reduce three or more operands to sum/carry rows; compare ripple carry-array and carry-save array figures; final carry-propagate addition as displayed.
13. Integer division: longhand division, restoring and non-restoring methods; source diagrams/flowcharts/examples. Include quotient/remainder and working registers with width/rounding rules verified against source.
14. IEEE 754 floating point: floating-point representation, sign/exponent/fraction components, single/double precision, biased exponent examples (127+6=133; 1023+6=1029), special values, ranges, overflow/underflow, special operations. Confirm bit conventions and special-value details against the slides.

### Unit 4 – Processor datapath, control, and pipelining

1. Basic processing unit and instruction-set processor (ISP); fetch one instruction and perform operation.
2. Executing an instruction; processor organization; single-bus datapath with PC, registers, ALU, temporary registers, MAR, MDR and control signals as identified in diagrams.
3. Register transfers: input/output gates controlled by `Riin`/`Riout`; transfer between registers and one-bit gating illustration.
4. ALU operation in datapath: combinational ALU, staged operation for `[R3] ← [R1]+[R2]`.
5. Memory read/fetch and store: MAR address, Read/Write control, MDR data path, variable memory response/timing; timing chart.
6. Complete instruction control sequences: `Add (R3), R1` and unconditional branch, including PC target update.
7. Single-bus and multibus organization; three-bus organization; ALU inputs/outputs and pass-through control; source `Add R4 R5 R6` example.
8. Control signals and control unit: hardwired control, timing steps, control-sequence tables and Boolean signal equations (including ZIN, END/RUN as shown); do not fabricate omitted equation terms.
9. Microprogrammed control: control word, microinstructions/microroutines/control store, control-unit organization, status/external inputs, branching and starting/branch-address generation, microinstruction encoding/size reduction.
10. Pipelining: need, sequential vs overlapped execution, 2-stage fetch/execute and 4-stage pipeline, buffers, cycle tables, cache role, throughput/performance, variable stage duration, cache-miss stall.
11. Pipeline hazards: structural, data, and instruction/control hazards; source sequences; forwarding/bypassing, required stalls, branch timing/penalty, instruction queue/prefetch, conditional and unconditional branches, delayed branch/delay slot, branch prediction, incorrect prediction and recovery.
12. Branch prediction: static prediction and source’s 4-state algorithm (strongly taken, weakly taken, weakly not taken, strongly not taken); prediction/update table and path behavior to be verified from slide.
13. Instruction-set effects on pipelining: simple/complex addressing mode examples and conditional codes/compiler reordering discussion.

### Unit 5 – Parallelism, ARM, and I/O

1. Parallelism: definition, goals, applications, challenges; hardware and software parallelism.
2. Hardware parallelism characterized by instruction issues per machine cycle (source wording).
3. Software parallelism: control/data dependence; types including instruction-level parallelism (ILP) and data-level parallelism (DLP); source examples, array sum and matrix multiplication. Preserve source assumptions and complexity claims with caveats.
4. Locality of data references and performance as stated in slides.
5. Flynn classification: instruction stream × data stream dimensions; SISD, SIMD, MISD, MIMD definitions/examples from source.
6. ARM architecture case study: ARM5/ARM7; ARM features, Thumb instruction-set material, ARM core dataflow model. Image-only details require reviewer transcription.
7. Single-core and multicore architectures: replicated cores, cores run in parallel, per-core thread time-slicing as slide states.
8. Memory-mapped I/O vs I/O-mapped I/O; program-controlled I/O, repeated status-flag polling; typical program-controlled instructions table.
9. ARM data sizes/instruction sets; ARM 32-bit architecture; seven processor modes; ARM register set, register organization, 37 registers of 32 bits, CPSR/SPSR and condition flags, PC/r15.
10. ARM conditional execution and condition codes; branch `B{cond}` and branch-with-link `BL{cond}`.
11. ARM data-processing groups (arithmetic, logical, comparisons, data movement) and barrel shifter; immediate rotation example and `LDR rd, =const` pseudo-instruction.
12. ARM multiply, single-register data transfer LDR/STR, base-plus-offset address, LDM/STM, SWI, PSR transfer MRS/MSR, branches/subroutines, Thumb (16-bit instruction set), ARM-based system, AMBA/bridge.

## 4. Topic Classification

“Full simulation” means learner inputs affect a real, deterministic step sequence. “Visualization” means a model animates a fixed or selectable relationship but does not claim to execute a complete algorithm. “Interactive diagram” means components can be selected/inspected, with limited value propagation. “Static theory” is the default when interaction would add little or source specifics are not sufficient.

| Topic group | Class | Why / required scope |
|---|---|---|
| Architecture vs organization, motivation, computer types | Static theory | Definitions and comparison table are clearer than an artificial simulation. |
| Generations and layered levels | Animated visualization | A timeline and stacked level diagram show progression/abstraction; no invented machine behavior. |
| Components and von Neumann model | Interactive diagram + fetch-execute walkthrough | Click CPU, memory, I/O, bus; animate instruction/data movement in a verified example. |
| Digital signals | Animated visualization | Plot/sample binary signal over time with source-led examples; no need for an algorithm runner. |
| Base conversion (integer/fractional, bases 2/8/10/16) | Full interactive simulation | User values determine conversion steps and result. |
| Binary arithmetic and signed subtraction | Full interactive simulation | Carry/borrow/complement actions are the learning objective. |
| BCD, Gray, Excess-3, ASCII, parity conversions | Full interactive simulation | Input digits/characters affect encodings, parity, and visible conversion trace. |
| Logic gates/Boolean truth tables | Interactive diagram | Learner toggles input bits; outputs and rows update immediately. |
| Unit 2 functional units/buses/memory hierarchy | Interactive diagram + visualization | Selection reveals role; bus transfer and hierarchy relationship are visible without implying a complete benchmark model. |
| Address-space calculation, endian assignment | Full interactive simulation | Numeric input yields address-bit calculation/byte layout. |
| RTN, instruction categories/formats, instruction cycle | Full interactive simulation for small supported instruction set; static reference for taxonomy | A chosen instruction can be traced; format comparisons are best shown in a table. No broad ISA emulator. |
| Addressing modes | Interactive diagram | User selects a mode and operand/register/memory values; diagram resolves effective address. Treat as a bounded example calculator, not an ISA simulator. |
| Microprocessor evolution, 8086 structure/registers | Interactive diagram + static theory | Select register/segment to inspect; static history and definitions are enough. No unsupported 8086 emulator. |
| Half/full adder, Boolean laws, ALU | Interactive diagram | Toggle input/control bits and inspect truth table/circuit outputs; mappings must match slides. |
| Ripple/CLA adders, adder-subtractor | Full interactive simulation | Enter fixed-width operands, then show per-bit carry/generate/propagate and result. |
| Unsigned/shift-and-add multiplication | Full interactive simulation | Real partial products or add/shift register steps with learner operands. |
| Booth, bit-pair recoding | Full interactive simulation | Register-by-register algorithm execution and recoding decisions are essential. |
| Carry-save addition | Full interactive simulation | Learner enters summands; show reduction columns and final addition. |
| Restoring/non-restoring division | Full interactive simulation | Show signed partial remainder, quotient and restore/non-restore decisions each iteration. |
| IEEE 754 | Full interactive simulation for normal finite values; interactive visual reference for special cases | Encode/decode configurable values and display fields; guard source ambiguity and representability. |
| Single-bus/multibus datapath and control sequences | Full interactive simulation for source examples; interactive diagram for topology | Advance through actual micro-operations and control signals. |
| Hardwired/microprogrammed control | Animated visualization + interactive diagram | Show signal timing/word fields from verified slide listing; do not synthesize missing equations. |
| Pipeline execution/performance | Full interactive simulation | Learner supplies a short instruction sequence; show stage/cycle occupancy and measured cycle count based on explicit model. |
| Pipeline hazards, forwarding, stalls, branches, prediction | Full interactive simulation for supplied sequences | State and timing changes demonstrate cause and mitigation. Keep pipeline model explicit and bounded. |
| Parallelism/ILP/DLP and Flynn taxonomy | Interactive visualization | Compare streams/lanes and schedule source examples; no fabricated speedup claims. |
| Multicore | Animated visualization | Animate work across cores and time-slicing within core; avoid performance guarantees. |
| ARM register set/instruction families/I/O | Interactive diagram + bounded trace | Inspect source-listed registers/instruction effects; code snippets only if verified. Do not implement a general ARM emulator. |
| Memory-mapped vs I/O-mapped and polling | Interactive diagram + bounded simulation | Show address-space path and polling status sequence using source-supported illustrative values. |

## 5. Simulation Specifications

All simulations share a deterministic step model. Inputs and constraints are visible before Run. A step record contains: step number, operation, pre-state, state changes, visual event, concise explanation, and post-state. Previous/next must replay stored states exactly. Reset restores the initial state without changing inputs. If an input is invalid or an operation exceeds the supported width, explain the constraint inline; do not silently truncate or wrap unless the selected mode explicitly says fixed-width arithmetic.

### 5.1 Base conversion workbench

- **Purpose:** Teach positional representation and integer/fractional conversion across bases 2, 8, 10, 16.
- **Inputs:** source base, target base, signed/unsigned selection only if source material supports it, integer and optional fractional digits, precision/maximum fractional steps.
- **Initial state:** Source digits are grouped by positional weights; fractional place values are shown to the right of the radix point.
- **Steps:** (1) validate digits for source radix; (2) expand to decimal using digit × radix^position, or for target 2/8/16 apply repeated division for integer part and repeated multiplication for fractional part; (3) expose remainder/fraction digit at every iteration; (4) group binary digits by 3 or 4 for octal/hex; (5) show reverse-conversion check.
- **State:** current quotient/remainder or fractional residual, accumulated output digits, place weights, precision and exact/approximate status.
- **Visual behavior:** Selected digit and its weight highlight; each division creates a remainder token; fractional multiplication shifts the integer digit into output; grouping brackets show binary-to-octal/hex mapping.
- **Controls:** Run, pause/resume, next/previous, reset, speed; step mode defaults on.
- **Output/explanation:** target representation, source-base validity, reconstruction check, precision warning for repeating fractions. Example 46.6875₁₀ → 101110.1011₂ is supported by exact arithmetic and corresponds to the source example; label it as a worked reference only after confirming slide notation.
- **Data:** sourceBase, targetBase, sourceDigits, fractionalDigits, precisionLimit, currentAlgorithm, iteration, quotient/remainder or residual, outputDigits, verificationValue.

### 5.2 Code conversion and parity workbench

- **Purpose:** Compare binary-coded decimal, Gray, Excess-3, ASCII and parity without confusing numeric base conversion with encoding.
- **Inputs:** mode; decimal digit/string or binary word; ASCII text/character when in ASCII mode; parity even/odd; bit width where applicable.
- **Initial state:** Show input as labeled symbols/bits; identify whether the task is numeric conversion or code mapping.
- **Steps:** BCD: split decimal digits and map each digit to its 4-bit group; Gray: show MSB copy and successive XOR transitions (Gray→binary uses cumulative XOR); Excess-3: map each decimal digit to digit+3 code using the source’s tables/rule; ASCII: map characters to verified 7-bit codes; parity: count ones, append parity bit, then optionally flip a chosen received bit and recompute check.
- **State:** source symbols, intermediate groups, bit count, selected mapping, parity count, received bits/error indication.
- **Visual behavior:** Animate mapping per digit/character, connectors from source to code, highlight changed bit; parity panel lights on even/odd mismatch.
- **Controls:** Select mode, step, previous, reset, speed; parity optional inject-error toggle.
- **Output/explanation:** encoded string, decoded value where supported, group boundaries and parity result. Explicitly say single parity detects odd-count bit errors but cannot identify/correct a bit; phrase only if verified with source, otherwise state detection scope for the demonstrated example.
- **Data:** mode, input, codeTable, groupWidth, stepIndex, intermediateGroups, output, parityChoice, receivedWord, parityStatus.

### 5.3 Binary arithmetic and signed subtraction

- **Purpose:** Make carry, borrow, complement and BCD correction visible.
- **Inputs:** operands, operation (+/−), representation (unsigned, 1’s complement, 2’s complement), bit width, optional BCD mode.
- **Initial state:** Fixed-width bit rows aligned by least-significant bit; signed sign position or BCD digit groups identified.
- **Steps:** For binary addition, process least-to-most significant columns with carry-in, sum, carry-out. For 1’s complement subtraction, complement subtrahend, add, show end-around carry as deck example specifies. For 2’s complement subtraction, complement and add 1, show carry/discard convention and overflow status. For BCD, add each digit group and apply correction rule only as source supports.
- **State:** column index, input bits, carry/borrow, intermediate sum, complement, overflow/sign, BCD correction state.
- **Visual behavior:** Active column glow (subtle), carry arrows, complement inversion, end-around carry path, BCD digit-group correction.
- **Controls:** step/previous/run/pause/reset/speed; change width only after reset.
- **Output/explanation:** bit result, interpreted value, carry/overflow indication, intermediate table. Keep unsigned carry separate from signed overflow.
- **Data:** width, A, B, operation, representation, column, carry, intermediate, result, overflow, explanation.

### 5.4 Address-space, endianness, memory read/write

- **Purpose:** Connect address bits to locations and show byte order/memory transfer.
- **Inputs:** capacity with unit, addressable unit (byte/word), word size, sample word and starting address, endian mode, read/write.
- **Initial state:** Byte-addressed memory grid with labeled addresses and empty sample bytes.
- **Steps:** calculate number of addressable locations using consistent units; derive required address bits; for endian mode split word into bytes and assign increasing addresses in selected order; for read/write show address on address bus, control signal, data bus and memory/MDR/register transfer.
- **State:** capacity, locations, addressWidth, byte list, address pointer, control lines, MAR/MDR, target register.
- **Visual behavior:** Address line selects exactly one location; data tokens move CPU↔memory; endian bytes occupy successive addresses. Clearly distinguish byte order from bit order.
- **Controls:** read/write selector, run/step/previous/reset, endian toggle.
- **Output/explanation:** address width and a labeled memory map; 32 MB example should show assumptions (1 MB = 2^20 bytes, byte-addressed) and resulting address width only after verifying expected course convention.
- **Data:** capacity, unit, addressableUnit, wordBits, endian, startAddress, memory[], MAR, MDR, operation, step.

### 5.5 Instruction format, cycle and addressing-mode tracer

- **Purpose:** Show how operand location and instruction sequencing cause register/memory reads.
- **Inputs:** choose source-listed mnemonic/example, register values, memory map, starting PC, mode; bounded supported instruction set (MOVE/ADD/branch and source examples only).
- **Initial state:** instruction text broken into opcode/address fields; PC, registers and memory shown.
- **Steps:** decode field; for addressing mode resolve operand: immediate value, direct address, indirect pointer, register, register-indirect, indexed/relative effective address, auto-increment/decrement update; fetch operand; execute supported operation; write back; update PC/condition code if applicable.
- **State:** PC, IR, effective address, register file, memory, flags, current cycle stage, instruction format fields.
- **Visual behavior:** trace arrow follows address path; distinguish operand value from its address; selected register/memory cell updates; PC arrow advances or branches.
- **Controls:** step/back/run/pause/reset, mode selection, input presets only if source examples verified.
- **Output/explanation:** result and RTN-style state change, effective address calculation, count of address fields for format comparison. Do not claim compatibility with a real ISA.
- **Data:** instruction, addressingMode, operandFields, registers, memory, PC, IR, effectiveAddress, flags, stage, trace.

### 5.6 Adders and ALU

- **Purpose:** Explain combinational bit logic, carry propagation and ALU control.
- **Inputs:** 1–16-bit operands (width constrained by selected diagram), operation, S1/S0 control and mode M for adder/subtractor.
- **Initial state:** bit-lane diagram, selected circuit topology (half/full, ripple, CLA, ALU, add/subtract), inputs stable.
- **Steps:** half/full adder: evaluate Boolean outputs per input row; ripple: propagate carry from bit 0 upward; CLA: compute P/G then carries using verified expressions in parallel; adder/subtractor: show XOR-controlled B and carry-in; ALU: map S1/S0 to operation using checked source table.
- **State:** input bits, per-bit Pi/Gi, carries, sums, control signals, result, circuit topology.
- **Visual behavior:** Gates/wires highlight in evaluation order; ripple path cascades; lookahead carry paths illuminate after P/G; control selection routes input/output. No gratuitous electron or glowing effects.
- **Controls:** edit operands, select circuit/mode, step/previous/run/reset, speed, truth-table toggle.
- **Output/explanation:** result, carry, intermediate signals, optional delay-unit comparison only if source’s stated assumptions are displayed.
- **Data:** width, A, B, circuit, operation, S1/S0, M, P[], G[], C[], S[], result, currentStep.

### 5.7 Multiplication suite

#### Unsigned long / shift-and-add

- **Purpose:** Explain partial products and accumulator/register behavior.
- **Inputs:** multiplicand, multiplier, width; select partial-product or shift-and-add view.
- **Initial state:** A, Q, accumulator/product rows initialized to zero as algorithm requires; binary operands shown at selected width.
- **Steps (shift-and-add operational rule):** inspect multiplier least-significant bit; if 1 add multiplicand to accumulator; shift multiplicand left and multiplier right (or the equivalent combined-register process explicitly selected); repeat for width iterations. For long multiplication, generate each shifted partial product and sum columnwise.
- **State:** M, Q, accumulator, iteration, partial products, carry, result.
- **Visual behavior:** decision bit highlighted, add enabled only for 1, carry updated, shift arrows, partial-product rows retained.
- **Controls:** run/step/back/pause/reset/speed, fixed-width selector.
- **Output/explanation:** 2n-bit product, per-iteration table and multiplication check.
- **Data:** width, M, Q, accumulator, iteration, partialProducts, carry, result.

#### Booth signed multiplication

- **Purpose:** Demonstrate signed multiplication via adjacent multiplier-bit decisions and arithmetic shifts.
- **Inputs:** signed multiplicand M, multiplier Q in selected two’s-complement width n; optional verified source example.
- **Initial state:** A=0, Q=input multiplier, Q−1=0, M=multiplicand; show all n-bit registers and sign interpretation.
- **Steps:** (1) inspect pair (Q0,Q−1); (2) 01 → A=A+M; 10 → A=A−M; 00/11 → no operation; (3) record operation and arithmetic right shift concatenated A,Q,Q−1, preserving A sign; (4) increment iteration; repeat n times; (5) join A,Q as 2n-bit product.
- **State:** A, Q, Q−1, M, n, iteration, pair, operation, pre/post-shift values, product.
- **Visual behavior:** pair bits highlight; decision row points to add/subtract/no-op; show arithmetic sign extension during shift; only then update register cells; timeline marks completed iterations.
- **Controls:** run, pause/resume, next, previous, reset, speed, signed width.
- **Output/explanation:** signed decimal and 2n-bit result; show why the pair selected each action and distinguish arithmetic from logical shift.
- **Data:** `n`, `A`, `Q`, `QMinus1`, `M`, `iteration`, `pair`, `operation`, `shiftedState`, `product`.
- **Guard:** fixed-width subtraction/addition semantics and valid operand range must be displayed and validated. The exact recoded Booth variant is a separate page, not silently substituted.

#### Bit-pair recoding and carry-save summation

- **Purpose:** Reduce partial-product rows and add many summands efficiently.
- **Inputs:** multiplier and multiplicand (recoding), or 3+ binary summands (carry-save).
- **Initial state:** input bits grouped by pairs per verified recoding table; carry-save columns stack operands.
- **Steps:** recoding: append required boundary bit, group overlapping bit pairs, map groups to signed digit/partial product via verified table, shift partial products, sum. Carry-save: for each column reduce triples with full-adder sum/carry; carry is routed to next column without ripple propagation in that stage; repeat rows until two remain; final carry-propagate addition.
- **State:** recoding groups, signed digit, partial products, row operands, sum/carry rows, final sum.
- **Visual behavior:** group brackets and mapped coefficient; column triples connect to sum and next-column carry; reduction rounds retain history.
- **Controls:** step/back/run/reset; edit input rows.
- **Output/explanation:** reduced rows and final verified product/sum. No performance speed claim beyond deck wording unless exact assumptions are presented.
- **Data:** multiplier, recodingGroups, coefficients, partialProducts, summands, round, sumRows, carryRows, result.

### 5.8 Restoring and non-restoring division

- **Purpose:** Explain quotient-bit decisions and partial remainder evolution.
- **Inputs:** dividend, nonzero divisor, width, restoring/non-restoring mode, signedness only if confirmed by source (default unsigned).
- **Initial state:** named A/partial remainder and Q/dividend registers in source’s arrangement; divisor M; width and sign convention visible.
- **Steps:** restoring: shift partial remainder/quotient as prescribed by verified slide flowchart; subtract divisor; if negative restore by adding divisor and set quotient bit 0; otherwise retain and set quotient bit 1; repeat n times. Non-restoring: use sign of current partial remainder to select add/subtract on next iteration; shift/update quotient bit per verified slide flowchart; perform final correction if required by source algorithm.
- **State:** A, Q, M, iteration, operation, pre/post-shift values, sign, restore flag, quotient bits.
- **Visual behavior:** show shifted combined register, subtract/add action, negative sign, restore path or next non-restoring operation, quotient bit insertion.
- **Controls:** choose mode and inputs, run/pause/step/back/reset/speed.
- **Output/explanation:** quotient, remainder, identity check dividend = divisor×quotient + remainder; signed/range assumptions displayed.
- **Data:** mode, width, dividend, divisor, A, Q, M, iteration, operation, sign, restoreFlag, quotient, remainder.
- **Source gate:** transcribe the exact flowcharts and verify register width/ordering before release; examples should mirror the slide only after manual confirmation.

### 5.9 IEEE 754 inspector

- **Purpose:** Relate a decimal value to sign, exponent and fraction fields and back.
- **Inputs:** single/double precision, finite decimal input, encode/decode mode; optionally raw bit string for decode.
- **Initial state:** field-width diagram from verified standard slide, blank sign/exponent/fraction.
- **Steps:** sign; convert magnitude to binary; normalize; derive stored exponent using format bias; form fraction field; round according to explicitly chosen supported policy; reassemble. Decode reverses fields and handles only source-verified special patterns.
- **State:** input value, sign, normalized significand, unbiased/stored exponent, fraction, bias, rounded result, exceptional status.
- **Visual behavior:** bit field fills left-to-right; exponent bias arithmetic shown (source examples include 127+6 and 1023+6); rounding changes highlighted; decoded value reconstruction.
- **Controls:** precision, encode/decode, run/step/back/reset; raw bits entry.
- **Output/explanation:** fields, represented value, rounding/overflow/underflow flags. Special-value catalog must match the deck after reviewer transcription.
- **Data:** format, mode, input, rawBits, sign, exponent, fraction, bias, normalizedValue, roundingMode, status.

### 5.10 Datapath and control sequence simulator

- **Purpose:** Expose the hidden register transfers and control signal sequence of an instruction.
- **Inputs:** verified source example (`Add (R3), R1`, unconditional branch, or `Add R4 R5 R6` in multibus view), register/memory values, datapath topology.
- **Initial state:** CPU diagram with PC, IR, general registers, ALU, MAR/MDR, buses, control-step counter; memory contains instruction/data.
- **Steps:** follow only verified source control sequence. Generic memory read event: address→MAR, assert Read, wait for ready/response, memory word→MDR, then destination. ALU event: route operands, select function, capture result in destination. Branch: fetch/decode, compute or load target as slide specifies, update PC. For each micro-step show active control signals and clock boundary.
- **State:** PC, IR, registers, MAR, MDR, bus values, ALU inputs/result, control word/signals, timing step, memory response.
- **Visual behavior:** tokens travel along selected bus; active source/destination gate and control signal highlight; memory wait cycles remain visible; PC target arrow moves only on branch step.
- **Controls:** run/step/back/pause/reset/speed; choose one-bus/three-bus topology only where the source diagram supports it.
- **Output/explanation:** final register/memory state and ordered micro-operation log; explain why a transfer requires a bus/control signal.
- **Data:** instruction, topology, PC, IR, registerFile, memory, MAR, MDR, busA/B/C, ALU, controlSignals, timingStep, trace.
- **Guard:** no fabricated full control sequence; a source transcription must be attached to each sequence.

### 5.11 Pipeline and hazard laboratory

- **Purpose:** Show overlap, throughput and hazard resolution across clock cycles.
- **Inputs:** short instruction sequence (or verified presets), stage model (deck’s 2-stage or 4-stage), dependency/resource settings explicitly named, cache-miss delay, forwarding/stall option, branch path/predictor selection.
- **Initial state:** empty cycle × stage grid; instructions in order; model assumptions displayed (stage names/latency, register read/write timing).
- **Steps:** advance a cycle; move each eligible instruction one stage; identify structural/data/control hazard; if unresolved, insert visible stall/bubble; with forwarding, draw bypass edge and suppress only the supported stall; on branch, show prediction, fetch path, resolution and flush/wrong-path instructions; predictor state updates according to verified 4-state transition diagram.
- **State:** cycle, instruction stage, operands/results, dependency tags, resource use, stalls, forwarding edges, branch prediction/state, flushed instructions, cache miss counter.
- **Visual behavior:** instruction cards move by cycle; bubbles occupy cells; forwarding path is a labeled arrow; branch misprediction marks fetched instructions as flushed; cache miss freezes named stage(s) per selected model.
- **Controls:** run/step/back/pause/reset/speed; toggle forwarding/stall/prediction only where model supports it.
- **Output/explanation:** cycle table, completion order, total cycles and CPI/throughput only with formula and stated assumptions; compare baseline and selected mitigation using identical workload.
- **Data:** instructionList, stageModel, stageLatency, cycle, stageOccupancy, dependencies, resources, forwarding, stallReason, predictorState, actualOutcome, predictedOutcome, flushSet, completionCycle.
- **Guard:** do not imply a universal cycle count. The source’s example and timing must be transcribed and validated; custom sequences operate under an explicitly simplified teaching model.

### 5.12 Parallelism and I/O visual labs

- **Parallelism inputs:** select SISD/SIMD/MISD/MIMD, lane/core count, source example (ILP instruction dependency or DLP array/matrix operation); display the instruction/data stream count. Show dependency-limited operations as sequential and independent operations as concurrent only when the source example confirms independence. Avoid unsupported speedup/complexity claims.
- **Parallelism state:** instruction streams, data streams, lanes/cores, operation queue, dependency edges, cycle/time-slice, completion markers.
- **I/O inputs:** memory-mapped vs I/O-mapped selection; polling status sequence; simple device-ready timing values explicitly labeled illustrative.
- **I/O steps:** CPU checks status flag; if not ready, repeat; when ready, perform the source-supported transfer instruction/action; show address-space path for each I/O mapping. No DMA/interrupt implementation should be invented from absent material.

## 6. Animation Specifications

Animations must be synchronized with the state/event log. A learner can pause on any event and read the state before/after it. Avoid motion that implies a transfer, computation, or timing fact that is not part of the selected model.

| Concept | Ordered visual sequence |
|---|---|
| von Neumann fetch-execute | PC highlights instruction address → address travels to memory → instruction returns to IR → CU decode highlight → operands move from memory/registers → ALU operation → result enters register/memory → PC advances or branch target selected. Label shared bus carrying instructions and data. |
| Base conversion | Current digit/place weight highlight → multiply/add or divide step → quotient/remainder appears → remainder stack reverses into integer output; fractional residual × radix emits next digit → output digits accumulate → reverse check. |
| BCD/Gray/XS-3/ASCII | Input digit/character highlights → verified table/rule row highlights → corresponding bit group appears → group boundaries remain visible → optional decode path reverses mapping. |
| Adders | Bits enter gates → half/full-adder outputs appear → ripple carry moves one column at a time; CLA computes P/G then independent carry paths → final sum and carry labels appear. |
| Shift-and-add multiply | Multiplier bit inspected → add or skip decision → accumulator changes if selected → multiplicand shifts left and multiplier shifts right / source-selected combined register shifts → next iteration. |
| Booth | A, Q, Q−1 row shown → Q0/Q−1 pair read → decision selected (01 add M, 10 subtract M, 00/11 none) → A updates → arithmetic shift of concatenated A:Q:Q−1, sign bit retained → iteration counter advances. |
| Restoring division | Partial registers shift → subtract divisor → sign test → negative path restores and appends quotient 0 OR nonnegative path keeps value and appends 1 → next iteration. |
| Non-restoring division | Sign of partial remainder highlighted → select add/subtract divisor → shift/update combined registers per verified flowchart → append quotient bit → final remainder correction only if flowchart requires it. |
| Memory read/write/endian | CPU places address on address bus → selected memory cell outlined → Read/Write control highlighted → data travels on data bus via MDR → byte tokens placed in increasing addresses according to endian selection. |
| Datapath control steps | Control step highlights → register output gate enabled → bus token moves → ALU or MAR/MDR action occurs → destination input gate captures → control word/timing step advances. |
| Pipeline | Cycle cursor advances → eligible instruction cards move one stage → independent instructions overlap → hazard reason appears at blocked stage → bubble/forwarding path appears → branch resolution keeps correct path or flushes wrong path. |
| Four-state prediction | Current state box highlighted → prediction direction shown → actual outcome revealed → transition arrow updates state → next fetch path uses updated prediction. Use the source’s exact transition graph. |
| Flynn/multicore | Instruction/data stream icons feed the selected processors/lanes → independent tasks execute concurrently → within a core, time slices are shown sequentially. Labels distinguish simultaneous core activity from time-slicing. |

Animation timing should be slow enough to observe and always controllable. Respect reduced-motion system preference; replace movement with instantaneous state changes plus a written event log.

## 7. Website Architecture

### Primary navigation

```text
Home / Course Map
├── Unit 1: Foundations, Number Systems & Logic
│   ├── Learn / Topic Reference
│   ├── Visualize
│   └── Simulate: Conversions, Codes, Arithmetic
├── Unit 2: Basic Structure, Memory & Instructions
│   ├── Learn / Topic Reference
│   ├── Interactive Diagrams
│   └── Simulate: Addressing, Memory, Instruction Trace
├── Unit 3: ALU & Arithmetic Algorithms
│   ├── Learn / Topic Reference
│   ├── Circuit Explorer
│   └── Simulate: Adders, Multiply, Divide, IEEE 754
├── Unit 4: Processor, Control & Pipeline
│   ├── Learn / Topic Reference
│   ├── Datapath Explorer
│   └── Simulate: Control Sequences, Pipeline & Hazards
├── Unit 5: Parallelism, ARM & I/O
│   ├── Learn / Topic Reference
│   ├── Architecture Explorer
│   └── Visualize: Parallelism and I/O
├── Algorithms & Formula Reference
├── Viva Mode
└── About / Sources and Limitations
```

### Page/section requirements

| Page | Purpose and content | Layout/interactions/navigation |
|---|---|---|
| Home / Course Map | Orient user and expose the actual five units and their major learning modes. | Compact title and “Continue learning” only if genuine local progress exists; unit cards list topic names and Learn/Visualize/Simulate availability. No fabricated counts or usage metrics. Search topics. |
| Unit overview | Show unit scope and ordered topic inventory. | Left topic navigation, center concise unit summary, right “Try a simulation” links. Unit order follows source labels. Search/filter by topic and mode. |
| Topic Learn page | Definition, purpose, working, algorithm/formula where supported, worked example, key points and viva prompts. | Short sections, expandable details, diagrams with captions, source limitation callouts. “Open visualizer” CTA appears only when a real visualizer exists. |
| Simulation page | Make a real process the centerpiece. | Three-zone layout: inputs/control rail; central diagram/state; step timeline plus explanation/output. On mobile, stack controls, state, then timeline; keep active step visible. Breadcrumb back to topic/unit. |
| Circuit/architecture explorer | Inspect static or interactive blocks and signal relationships. | SVG/canvas-like diagram is conceptually required, not mandated technically; select component to show role, inputs/outputs and source-grounded description. Keyboard-operable component list mirrors diagram. |
| Algorithms & Formula Reference | Cross-unit lookup for algorithms, notation, and formulas explicitly shown or needed by a named procedure. | Search/filter by unit and topic; each item links to Learn and applicable simulator. Mark equations awaiting source visual verification. |
| Viva Mode | Practice source-grounded demonstration questions. | One question per card; reveal answer, why, and corresponding visual element; topic/unit filters; shuffle only within available authored questions. No AI-generated answers at runtime unless later explicitly approved and sourced. |
| Sources and Limitations | State what files support the curriculum and where manual review is outstanding. | File list, extraction limitations, correction log, and per-topic “verified” state managed by content author. |

### Core navigation behavior

- Persistent unit navigation on desktop; collapsible accessible navigation on small screens.
- Breadcrumbs identify Home → Unit → Topic → Mode.
- Deep links preserve selected simulation and mode where feasible.
- Search returns source topic names, synonyms only when directly supported, and matching page type.
- Every simulation links back to its supporting concept and worked example.

## 8. UI/UX Design

### Visual direction

- Dark technical learning environment: near-black/charcoal surfaces, one cool accent (cyan or blue) for selected/focus state, restrained amber for warnings/active data, and red only for error/negative states. Maintain WCAG contrast; colors never carry meaning alone.
- Neutral sans-serif interface type; monospaced face for bit strings, addresses, instruction mnemonics and register values. Use clear numeric alignment and tabular digits.
- CPU-inspired visuals come from labeled buses, register banks, memory cells, pipeline lanes and timing grids—not decorative circuit traces or glowing backgrounds.
- Strong hierarchy: unit/topic title → objective → input panel → central visual → step state/explanation → result. Keep prose chunks short and put exact state near the visual it explains.
- Motion is purposeful, short, pausable, and reduced-motion aware. Provide instant-step mode.
- Responsive design: desktop supports simultaneous diagram and timeline; tablet stacks or tabs panels; phone prioritizes one active register/step and allows horizontal scroll only within wide bit/cycle grids.

### Interaction principles

- Every input has a label, unit/width, valid range and helpful example only when source verified.
- Distinguish source data, learner input, intermediate state, and final output visually and in text.
- Persistent step number and status (“Ready”, “Running”, “Paused”, “Complete”, “Invalid input”).
- Controls remain in consistent order: Run/Pause, Previous, Next, Reset, Speed. Keyboard shortcuts are optional and must be discoverable.
- Never autoplay an algorithm on page entry. Default to an inspectable initial state.
- Keep explanation synchronized to the selected step; allow a learner to inspect a register/cell without advancing execution.

### Avoid

Generic AI landing page tropes, fake statistics, giant gradients, random glow, decorative motion, long uninterrupted text blocks, unlabeled binary values, hidden simulator assumptions, and buttons that do not perform their named action.

## 9. Component Specifications

| Component | Purpose and behavior |
|---|---|
| Unit/topic navigation | Show verified curriculum hierarchy, current location and topic mode; keyboard accessible and responsive. |
| Topic card | Name, unit, concise objective, genuine supported modes; no invented progress percentage. |
| Learning section block | Definition/purpose/working/algorithm/formula/example/key points; compact and linkable by heading. |
| Simulation panel | Own input, initial state, execution status and output; deterministic reset and replay. |
| Input panel | Validated fields with radix/width/unit, helper text, inline error and optional verified preset. |
| Register display | Name, width, binary/hex/decimal interpretation as appropriate; bit-level change highlight and accessible textual state. |
| Binary bit display | Fixed-width aligned bits, sign/weight labels, selectable bit inspection; does not imply signedness without a label. |
| Memory block | Addressed cells with byte/word boundaries, read/write state, selection, endian layout. |
| CPU/datapath diagram | Labeled component nodes and signal paths; selection reveals component role; active transfer matches simulator state. |
| ALU/circuit diagram | Gate and wire inputs/outputs; updates from truth-table inputs and source-verified control mapping. |
| Pipeline diagram/grid | Stage lanes × cycles, instruction cards, stalls/bubbles/forwarding/flush annotations; same state as timeline. |
| Step timeline | Ordered steps, current/complete/future status, direct navigation; previous/next consistent with it. |
| Algorithm step viewer | Operation, condition, pre-state/post-state and explanation, with equations in readable notation. |
| Control panel | Run/pause/resume/next/previous/reset/speed; disabled states communicate why unavailable. |
| Output panel | Result, interpretation, validation identity, assumptions and warnings. |
| Formula card | Formula, symbol definitions, valid scenario, source-verification status and linked example. |
| Truth table | Complete input combinations for selected gate/circuit; current row follows toggles. |
| Viva question card | Prompt, answer reveal, rationale, supporting visual link; keyboard operable. |
| Source note | Source file/unit/page or slide and verification status; use where content can be traced. |

## 10. Academic Content Requirements

Every topic page follows a consistent template, but omit empty headings when the source does not support content. A short, correct reference page is preferable to invented detail.

| Field | Requirement |
|---|---|
| Definition | Exam-appropriate paraphrase faithful to the supplied slide. Preserve important terminology and distinctions. |
| Purpose | Explain why the concept/process exists using source framing. |
| Working | Describe inputs, components, sequence and resulting state. |
| Algorithm | Numbered steps only for a source-named procedure or a clearly labeled operational rule needed by its simulator. |
| Formula | Include formulas visible in source, with symbol definitions and assumptions. Do not fabricate missing logic equations. |
| Example | Prefer the deck’s own worked example; transcribe and check operands/results. Otherwise label a learner-input demonstration as an illustration, not a source example. |
| Visualization | Identify static diagram or linked simulator and what feature it demonstrates. |
| Key points | Three to six concise revision statements, all source-grounded. |
| Viva questions | Questions, correct answer, rationale and simulator element, as Section 11. |
| Provenance | File and page/slide locator; mark source detail pending manual visual verification where extraction is incomplete. |

### Reference formulas and notation expected

The platform should have a searchable formula/notation reference for verified material, including: positional value `Σ digit × base^position`; minimum address bits for N locations `ceil(log2 N)` with the addressability assumption shown; binary gate truth tables; half/full-adder truth tables and verified Boolean expressions; ripple carry and CLA generate/propagate expressions as printed in Unit III; 2’s-complement operation; Booth decision table; IEEE bias examples; source-provided pipeline timing/performance relations; and Unit 4 control-signal equations only where complete and legible. Every equation must be reviewed against its cited source page before publication.

## 11. Viva Mode

Each authored card must contain **Question**, **Correct answer**, **Why correct**, and **What the visual demonstrates**. The following initial set stays within source scope; final answers should be checked against the slides.

| Topic | Question | Correct answer (concise) | Why correct / visual evidence |
|---|---|---|---|
| Architecture vs organization | How do architecture and organization differ? | Architecture concerns programmer-visible structure/behavior, including ISA; organization concerns physical implementation aspects such as circuits, control signals and memory types. | Unit 1’s comparison. Point to architecture/software interface and organization hardware diagram. |
| Von Neumann | What travels on the shared pathway? | Both instructions and data use the single pathway between memory, I/O and CPU. | Source description; animate instruction and operand over the same bus at different steps. |
| Fetch-execute | What role does PC play in fetching? | It identifies the memory location of the next instruction to fetch. | Unit 1/2 flow; highlight PC address, memory read and instruction return. |
| Gray code | What property makes Gray code useful in transitions? | Neighboring code values differ in one bit, reducing simultaneous bit changes in transitions. | Source Gray-code description/table; compare adjacent rows. |
| BCD | How is a multi-digit decimal value represented in BCD? | Each decimal digit is encoded separately as a 4-bit group. | BCD grouping panel. |
| Parity | What does the parity bit do in the shown scheme? | It makes the number of 1s even or odd according to selected parity, enabling an error check. | Toggle/inject one bit and observe parity check. |
| Full adder | What extra input does a full adder handle compared with a half adder? | Carry-in, in addition to the two operand bits. | Input switches/truth table show carry-in affects sum/carry-out. |
| Ripple vs lookahead | Why can carry-lookahead reduce waiting compared with ripple carry? | It computes carries using generate/propagate logic rather than waiting for each carry to ripple through each stage. | Compare illuminated carry paths using source’s delay assumptions. |
| Booth | What do pairs 01 and 10 cause in the basic Booth procedure? | 01 adds M to A; 10 subtracts M from A; then arithmetic right shift follows. | Pair decision and A/Q/Q−1 timeline. |
| Restoring division | What happens after a negative trial remainder? | The divisor is restored and the quotient bit is set according to the source flowchart (typically 0). | Negative path and restore action in simulator; confirm exact flowchart convention. |
| IEEE 754 | Which fields make up a floating-point representation in the slides? | Sign, exponent and fraction/significand fields. | Bit-field panel labels each field. |
| Addressing | What is immediate addressing? | The operand value is present explicitly in the instruction. | Show literal operand without a memory dereference. |
| Endianness | What does endian choice change in the memory map? | The order in which a multi-byte value’s bytes are assigned to increasing addresses. | Same value shown in big- and little-endian layouts. |
| Pipeline | What is a data hazard? | A dependency occurs when an instruction needs a result that a preceding instruction has not yet made available. | Dependent instruction cards and forwarding/stall view. |
| Branch prediction | What does the four-state predictor change after resolution? | It moves to a state determined by its current state and actual branch outcome, changing the next prediction. | State transition and next predicted path. Confirm state names/transitions against slide. |
| Flynn | Which two dimensions categorize Flynn’s classes? | Instruction streams and data streams. | 2×2 taxonomy with SISD/SIMD/MISD/MIMD. |
| ARM | What does the supplied material state about ARM registers and width? | ARM is described as 32-bit and has 37 registers, each 32 bits long. | Register bank labels and width indicator. |
| Program-controlled I/O | What does the processor do while waiting in program-controlled I/O? | It repeatedly checks a status flag until the device condition allows the transfer. | Polling timeline repeats status read, then transfer. |

Viva filters: unit, topic, “theory”/“explain this visual”. Randomization should shuffle only the reviewed authored cards. Do not generate dynamic answers without an approved source-grounded content pipeline.

## 12. Demonstration Flow

Recommended 7–10 minute faculty demonstration:

1. **Open Home/Course Map (30 sec):** identify five supplied units and explain the site offers reference, diagrams and selected true simulations.
2. **Establish learning objective (30 sec):** open Unit 3 Booth topic; state that the demonstration will expose signed multiplication state and each decision.
3. **Explain algorithm (60 sec):** define M, A, Q, Q−1 and the four pair cases using the source-supported steps.
4. **Enter a checked example (30 sec):** choose a small signed example from the slides after visual verification; otherwise enter explicit sample operands and label them as demonstration input. Set bit width.
5. **Run stepwise (2–3 min):** pause after pair inspection, operation and arithmetic shift; ask a student to predict the next action; show register state and explanation in sync.
6. **Verify result (30 sec):** display 2n-bit result and decimal interpretation; use product identity/check.
7. **Compare another visualization (1 min):** show pipeline hazard laboratory, or add/subtract circuit if the faculty focus is datapath/digital logic. Trace one hazard to stall/forwarding.
8. **Answer viva (1 min):** open a topic-linked viva card, reveal answer and point to its corresponding visual state.
9. **Close (30 sec):** return to unit map and summarize academic coverage and source verification policy.

Alternate compact flow: Unit 1 base conversion → Unit 2 endian/address calculation → Unit 4 datapath sequence → Unit 5 Flynn taxonomy. The presenter should select based on faculty interest; do not attempt to run every simulator in one session.

## 13. Testing Requirements

Testing is a Bolt delivery requirement. The future implementation team should check the following before handoff; this document itself does not implement or execute these tests.

### Academic correctness

- For each simulator, compare every step/state and final result against hand-worked cases and the cited slide example.
- Include edge cases: zero, all-zero/all-one bits, sign boundary, carry/overflow, repeating fractional conversion, invalid digit for base, divide by zero, Booth minimum/maximum representable operands, division remainder, IEEE rounding/overflow/underflow, branch taken/not-taken, dependency and no-dependency pipeline sequences.
- For image-led topics, require faculty review of circuit equations, flowcharts, bit tables, control sequence and sample operands before marking content verified.
- Ensure each topic in Section 3 has a destination page and classification in Section 4; no source topic silently disappears.

### Functional behavior

- Run, pause, resume, next, previous, reset and speed work; state history is deterministic and reversible.
- Inputs validate and state assumptions; reset preserves or clears inputs consistently and visibly.
- Visual register/cycle/memory state always matches the textual state and explanation.
- Links, search, breadcrumbs and keyboard navigation reach the intended content.
- No fake metrics, dead-end cards or nonfunctional controls.

### Accessibility and responsive behavior

- Keyboard operate all inputs, diagrams, timeline and viva reveal; visible focus states.
- Screen reader labels expose register names, bit widths, values, stage, current step and state changes.
- Color is not the sole indicator; check contrast and reduced-motion preference.
- Verify 320px phone width through desktop; wide grids remain legible and scroll within their own region rather than breaking the page.

## 14. Project Report Structure

Use this structure for the academic presentation/report, filling sections with actual implemented and verified outcomes rather than generic claims:

1. **Problem Statement:** static COA materials make internal state transitions difficult to inspect and rehearse.
2. **Motivation:** support conceptual understanding and project demonstration through inspectable executions grounded in the course material.
3. **Objectives:** list platform objectives from Section 1 and map each to a delivered page/simulator.
4. **Existing Problem:** describe limits of slide-only study for procedures such as Booth steps, bus transfers and pipeline hazards; avoid unsupported broad claims about other tools.
5. **Proposed Solution:** course map + learning reference + bounded visualizers/simulators + viva practice.
6. **Features:** enumerate only implemented, tested features; distinguish simulations from diagrams/static pages.
7. **COA Topics Covered:** report the verified topic inventory by unit, disclose any source material still pending transcription.
8. **Simulation Methodology:** deterministic inputs/state transitions, step history, algorithm explanations, fixed-width behavior, source-example validation.
9. **System Architecture:** present actual built page/component/data organization; do not claim a backend or AI service unless implemented.
10. **UI/UX:** explain dark technical visual direction, responsive simulation layout, keyboard/reduced-motion support.
11. **Major Simulations:** document inputs, algorithm states, outputs, test cases and representative screenshots for the actual delivered simulations.
12. **Educational Benefits:** evaluate with learner/faculty feedback or task-based results if collected; otherwise state as intended benefits, not proven outcomes.
13. **Testing:** list method, cases, results, known defects and academic reviewers.
14. **Limitations:** source slides may be image-led; bounded rather than general-purpose CPU/ISA emulation; only verified algorithms/examples; no unsupported performance claims.
15. **Future Scope:** only propose clearly separated extensions (more source-reviewed examples, additional user-authored practice, instructor-approved content management). Do not imply these exist.
16. **Conclusion:** summarize what was built and verified against the supplied 21CSS201T material.

## 15. BOLT BUILD SPECIFICATION

### Product to build

Build a responsive educational website titled **COA Visualizer & Simulation Platform** for the exact five-unit curriculum catalogued in Section 3. It is a learning and demonstration tool, not a general CPU emulator. The center of the experience is a set of deterministic, genuinely stateful COA simulations described below. The site must work with source-grounded content, not invented curriculum.

### Required pages

1. Home/Course Map with five unit cards, topic search, genuine supported mode labels, and no fake dashboard statistics.
2. Unit overview pages for Units 1–5 using the inventory in Section 3.
3. Topic pages using the academic content template in Section 10, provenance/source note, limitations, and links to available modes.
4. Dedicated simulation pages for base conversion; codes/parity; binary/signed/BCD arithmetic; address/endian/memory; instruction/addressing trace; adders/ALU; multiplication; division; IEEE 754; datapath/control; pipeline/hazards; parallelism/I/O teaching labs.
5. Architecture/circuit explorers for the CPU/von Neumann, bus/memory, 8086/ARM register views, adder/ALU and pipeline topology.
6. Algorithms & Formula Reference with unit/topic filters and verification labels.
7. Viva Mode with authored question, answer, rationale and visual evidence cards.
8. Sources and Limitations page listing all five supplied file names and details pending visual verification.

### Functional simulations and behavior

- Implement the step rules and state fields specified in Section 5. Each simulation’s displayed result must derive from actual operations on its state, not a prerecorded decorative animation.
- Support Run, Pause, Resume, Next Step, Previous Step, Reset and Speed. Previous must reproduce prior state. The learner begins at an inspectable initial state, not autoplay.
- Keep operation, condition, pre-state, changed values, visual action, explanation and post-state synchronized.
- Validate radix digits, width/range, instruction inputs, divisor and value format. Explain rejected inputs and overflow/truncation policies.
- Show exact assumptions: signedness, bit width, endian/addressability, pipeline stages/latencies, branch transition table, IEEE format/rounding and source-verification state.
- Build Booth with A/Q/Q−1/M and pair decision; add/ subtract/no-op; arithmetic right shift; n iterations; 2n-bit product.
- Build restoring and non-restoring division only after transcribing and confirming the source flowcharts/register ordering.
- Build multiplication/adder algorithms with learner-selected inputs and observable partial products, carry/borrow, P/G, carry-save rows or recoding groups as described.
- Build datapath examples from checked micro-operation listings; do not invent bus control sequences/equation terms.
- Build pipeline execution as an explicit teaching model; show cycles, stage occupancy, stalls, forwarding, branch flush and predictor transitions, with assumptions disclosed.
- Provide endianness, address-bit and memory transfer examples with byte layout, buses, MAR/MDR and control state.
- Provide conversions/codes and IEEE 754 fields with intermediate work and validation/reconstruction.
- Bounded ARM/8086 traces are inspection/teaching diagrams, not complete emulators.

### Academic content and source fidelity

- Include all topic names from Section 3 even when an entry is static theory or image-led/pending verification.
- Use source terminology and unit mapping. Do not add unsupported topics, example data, equations, predictor transitions, ARM/8086 behavior, control signal logic or algorithm variants.
- Cite source file plus page/slide in topic metadata or source note; manually verify image-based material before marking it reviewed.
- Where source detail is ambiguous, present the ambiguity plainly and avoid presenting an assumption as course fact.
- Provide definitions, purpose, working, algorithm/formula, worked example, visualization, key points and viva prompts where supported; do not pad unsupported fields.
- Keep static concepts static when that is the educationally appropriate classification in Section 4.

### Reusable components

Implement the behavior described in Section 9: topic navigation/card, learning content block, validated input panel, simulation panel, register and bit displays, memory block, CPU/datapath and circuit diagrams, pipeline grid, step timeline, algorithm viewer, controls, output, formula/truth table, viva card and source note. Diagram interactions must have a text/keyboard equivalent.

### UI and interaction requirements

- Follow Section 8: professional dark academic engineering interface, restrained accent palette, aligned monospace state values, strong hierarchy, central simulation visual, concise synchronized explanation.
- Responsive desktop/tablet/mobile layouts. Preserve readable register/cycle tables on narrow screens through local scrolling/reflow.
- Support keyboard access, clear focus, descriptive accessible names, non-color state indicators, reduced-motion preference and readable contrast.
- Keep controls consistent, labelled and functional. Search and breadcrumbs must work. No dead buttons, autoplay, random glow, generic landing-page filler or fake statistics.

### Required verification before delivery

- Use the Section 13 academic and functional checklist; verify source examples against original slide visuals.
- Validate every final output with independent hand-calculated test vectors and edge cases.
- Confirm forward/back/reset state history, wrong-input feedback, responsive layout, keyboard/screen-reader labels and reduced-motion behavior.
- Provide a report of implemented pages and simulations, test cases/results, content reviewed vs pending, and known limitations. Do not claim unimplemented modes are complete.

## 16. Final Implementation Checklist

- [ ] Five supplied units appear with exact source topic coverage and traceable file/page/slide provenance.
- [ ] All topics have one explicit learning mode and rationale; no topic is animated by default.
- [ ] Source ambiguity and image-led details remain marked until a human verifies the original visual.
- [ ] Every advertised simulation computes actual state transitions from learner inputs.
- [ ] All algorithms expose intermediate registers/values and synchronized step explanations.
- [ ] Run, pause/resume, next, previous, reset and speed behave consistently.
- [ ] Fixed width, signedness, endian order, addressability and rounding assumptions are visible.
- [ ] Output validation and edge cases are handled with explanatory feedback.
- [ ] Diagrams are labeled, interactive where specified, and keyboard/text accessible.
- [ ] Search, unit navigation, breadcrumbs, topic links, formula lookup and Viva Mode work.
- [ ] Visual system is restrained, legible, responsive, reduced-motion aware and focused on the simulations.
- [ ] Academic reviewer confirms equations, examples, flowcharts, control sequences and prediction tables against supplied materials.
- [ ] Testing outcomes and remaining limitations are reported honestly.
- [ ] No unsupported topic, algorithm behavior, example, performance claim or implementation claim has been added.

