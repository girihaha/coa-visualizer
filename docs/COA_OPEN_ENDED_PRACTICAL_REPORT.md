# 21CSS201T – COMPUTER ORGANIZATION AND ARCHITECTURE
## OPEN-ENDED QUESTIONS – PRACTICAL LEARNING REPORT
**A record of understanding gained by solving one open-ended question from each unit using software.**

---

### STUDENT AND COURSE DETAILS

| Field | Details |
| :--- | :--- |
| **Student 1 Name** | Girish Chugh |
| **Register Number 1** | RA2511003010506 |
| **Student 2 Name** | Bedabrata Bhattacharjee |
| **Register Number 2** | RA2511003010528 |
| **Programme / Department** | B.Tech Computer Science and Engineering |
| **Section** | I1 |
| **Course Code & Title** | 21CSS201T – Computer Organization and Architecture (COA) |
| **Software / Tool Used** | COA Interactive Simulation & Verification Platform<br>🔗 **Live Web Tool:** [https://girihaha.github.io/coa-visualizer/](https://girihaha.github.io/coa-visualizer/)<br>📂 **Source Repository:** [https://github.com/girihaha/coa-visualizer](https://github.com/girihaha/coa-visualizer) |
| **Academic Year / Semester** | 2026–2027 / Semester IV |

**Submitted to:** Course Faculty, Department of Computing Technologies  
**Institution:** SRM Institute of Science and Technology, Kattankulathur  

---

## TABLE OF CONTENTS

| S. No. | Section Title | Page / Section Ref |
| :---: | :--- | :---: |
| 1 | Introduction | Section 1 |
| 2 | Objectives of the Activity | Section 2 |
| 3 | Unit I – Open-Ended Question and Learning Reflection (2's Complement Subtraction) | Section 3 |
| 4 | Unit II – Open-Ended Question and Learning Reflection (Memory Addressing & Bus Transfers) | Section 4 |
| 5 | Unit III – Open-Ended Question and Learning Reflection (Unsigned Binary Multiplication) | Section 5 |
| 6 | Unit IV – Open-Ended Question and Learning Reflection (Pipeline Data Hazards & Forwarding) | Section 6 |
| 7 | Unit V – Open-Ended Question and Learning Reflection (Multicore Architectures & Time-Slicing) | Section 7 |
| 8 | Overall Learning and Skills Gained | Section 8 |
| 9 | Challenges Faced and How They Were Solved | Section 9 |
| 10 | Simulation: Unsigned Shift-and-Add Multiplication Experiment | Section 10 |
| 11 | Conclusion | Section 11 |

---

## 1. INTRODUCTION

As part of the curriculum requirements for **21CSS201T – Computer Organization and Architecture (COA)**, this report documents the investigation and practical solution of five unit-level open-ended architectural problems (Set: Team 3 / 13). Rather than treating computer architecture as purely abstract mathematical formalism, each architectural problem was analyzed theoretically and then verified deterministically using our custom-engineered **COA Interactive Simulation Platform** deployed at [https://girihaha.github.io/coa-visualizer/](https://girihaha.github.io/coa-visualizer/).

The platform provides bit-accurate register emulation, micro-operation cycle state tracing, bus transfer illumination, and academic flowchart execution. This document presents a comprehensive record of the theoretical foundations, execution procedures, state transition tables, output analyses, problem-solving reflections, and simulation results for each unit.

---

## 2. OBJECTIVES OF THE ACTIVITY

1. **Conceptual Mastery:** To deeply analyze core principles across all five units of COA, including signed two's complement arithmetic, memory hierarchy and byte endianness, hardware multiplication datapaths, pipelined instruction hazard mitigation, and multicore parallel processing.
2. **Software-Grounded Verification:** To transition from static slide theory to dynamic, deterministic state-machine simulation using browser-based visual simulation tools.
3. **Execution Tracing:** To observe register-level state transitions ($C, A, Q, M, \text{PC}, \text{MAR}, \text{MDR}, \text{IR}$), micro-operation timings, and control signal activations step by step.
4. **Analytical Rigor:** To systematically derive, calculate, and verify state tables and truth matrices required for academic examinations and engineering practice.
5. **Critical Reflection:** To identify hardware bottlenecks, resource constraints, and algorithmic trade-offs encountered in computer engineering design.

---

## 3. UNIT I – OPEN-ENDED QUESTION AND LEARNING REFLECTION

### A. Question Given
> *"A processor must perform subtraction using 2’s complement representation. How would you represent negative numbers and carry out the subtraction?"*

### B. Concept / Theory Related to the Question
In digital computers, subtraction $A - B$ is universally converted into an addition problem:
$$A - B = A + (-B) = A + (B' + 1)$$
where $B'$ represents the bitwise logical NOT (1's complement) of $B$, and adding $1$ yields the **2's complement**.

Key theoretical principles:
1. **Range and Asymmetry:** In an $n$-bit signed two's complement system, values range from $-2^{n-1}$ to $+2^{n-1}-1$. The most significant bit (MSB) acts as the sign bit ($0$ for positive, $1$ for negative).
2. **Hardware Economy:** A single binary adder circuit performs both addition and subtraction. By placing an XOR gate on each bit of input $B$ controlled by a mode signal $M$ ($M = 0$ for addition, $M = 1$ for subtraction), the subtrahend is conditionally inverted and $M$ is injected into the initial carry-in ($C_{in} = M = 1$), directly producing $A + B' + 1$.
3. **End-Carry Discard:** In 2's complement subtraction, an end-around carry generated from the MSB is simply discarded; it is an artifact of the modular arithmetic modulo $2^n$.
4. **Overflow Detection:** Signed overflow ($V$) occurs when the result exceeds the representable range. It is mathematically detected by:
   $$V = C_{n} \oplus C_{n-1}$$
   or when two positive numbers yield a negative result, or two negative numbers yield a positive result.

### C. Software and Execution Procedure
- **Tool Used:** COA Platform – Binary Arithmetic & Subtraction Workbench (`#/simulate/binary-arith`)
- **URL:** [https://girihaha.github.io/coa-visualizer/#/simulate/binary-arith](https://girihaha.github.io/coa-visualizer/#/simulate/binary-arith)

| Step | Action / Description |
| :---: | :--- |
| 1 | Navigate to the **Binary Arithmetic & Signed Subtraction** simulator from the Lab menu. |
| 2 | Set register width to $n = 5$ bits. Enter Minuend $A = 01101_2$ ($+13_{10}$) and Subtrahend $B = 00111_2$ ($+7_{10}$). |
| 3 | Select operation mode: **A − B (2s complement)**. |
| 4 | Click **Run / Next Step** to step through bit-by-bit complementation of $B$ into $B' + 1 = 11000 + 1 = 11001_2$ ($-7_{10}$). |
| 5 | Observe column-by-column carry propagation from column 0 to column 4 in the arithmetic datapath. |
| 6 | Inspect the resulting accumulator sum, carry-out bit ($C_{out}$), and signed overflow flag ($V$). |

### D. Output / Observation
- **Inputs:** $A = 01101_2$ ($+13$), $B = 00111_2$ ($+7$).
- **2's Complement of B:** $11001_2$ ($-7$).
- **Addition Execution:**
  $$\begin{array}{r@{\quad}l}
    01101 & (A = +13) \\
  + 11001 & (-B = -7) \\
  \hline
   (1)00110 & (\text{Result} = +6)
  \end{array}$$
- **Flags Observed:**
  - Result bits: `00110` (Decimal $+6_{10}$).
  - Carry-out ($C_{out}$): `1` (correctly discarded in 2's complement).
  - Overflow flag ($V$): `0` (No overflow occurred; $+13 - 7 = +6$ safely fits in 5-bit signed range $-16$ to $+15$).

### E. What I Understood from This Activity
Through the simulator's bitwise datapath, I observed how 2's complement eliminates the need for separate binary subtraction hardware. In 1's complement, an end-around carry must be added back to the LSB, requiring two addition cycles and having dual representations for zero ($+0$ and $-0$). In 2's complement, subtraction is completed in a single adder cycle, zero has a unique representation (`00000`), and discarding the final carry produces the exact mathematical difference.

### F. Learning Outcome
- Understood the hardware implementation of signed subtraction using XOR inversion and $C_{in} = 1$.
- Differentiated between unsigned carry-out ($C$) and signed two's complement overflow ($V = C_n \oplus C_{n-1}$).
- Mastered manual two's complement arithmetic and flag prediction for university examinations.

### G. Difficulty Faced and Solution
- **Difficulty:** Confusion arose regarding why an end carry of `1` appeared during the subtraction of $+7$ from $+13$, and whether it indicated an error or overflow.
- **Solution:** Consulting the simulator's step explanation verified that in 2's complement subtraction, an end carry indicates that the result is non-negative and no borrow was required from beyond the word size; signed overflow is determined strictly by $V = C_{in(\text{MSB})} \oplus C_{out(\text{MSB})}$, which was `0`.

---

## 4. UNIT II – OPEN-ENDED QUESTION AND LEARNING REFLECTION

### A. Question Given
> *"A program takes longer to execute because it frequently accesses memory. How would you analyze memory addresses and memory read/write operations to identify possible improvements?"*

### B. Concept / Theory Related to the Question
Memory access latency represents the primary performance bottleneck in the von Neumann architecture (the "Memory Wall"). A program's memory interaction must be analyzed across three fundamental dimensions:

1. **Memory Addressing and Address-Bus Width:**
   In byte-addressed memory, an address designates exactly one 8-bit byte. For a memory system of capacity $N$ bytes, the minimum address bus width $k$ is given by:
   $$k = \lceil \log_2 N \rceil$$
   For example, a 32 MB memory requires $\log_2(32 \times 2^{20}) = \log_2(2^{25}) = 25$ address lines ($A_0$ to $A_{24}$).
2. **Memory Hierarchy and Locality of Reference:**
   Main memory (DRAM) requires multiple processor clock cycles per access. To optimize execution, programs must exploit:
   - *Temporal Locality:* Keeping recently referenced memory words in CPU general-purpose registers ($R_0 - R_{n-1}$) or L1 cache.
   - *Spatial Locality:* Structuring sequential data in contiguous memory words to maximize cache-line fill efficiency.
3. **Byte Ordering (Endianness) and Word Alignment:**
   - Multi-byte data words (e.g., 32-bit `0x1A2B3C4D`) span multiple byte addresses.
   - *Big-Endian:* Most Significant Byte (`0x1A`) resides at the lowest byte address ($k$), while Least Significant Byte (`0x4D`) is at address $k+3$.
   - *Little-Endian:* Least Significant Byte (`0x4D`) resides at the lowest byte address ($k$), and Most Significant Byte (`0x1A`) is at address $k+3$.
   - Unaligned memory accesses cross word boundaries and require two consecutive bus memory cycles instead of one, doubling memory stall time.

### C. Software and Execution Procedure
- **Tool Used:** COA Platform – Memory Hierarchy, Address Space & Endianness Simulator (`#/simulate/memory`)
- **URL:** [https://girihaha.github.io/coa-visualizer/#/simulate/memory](https://girihaha.github.io/coa-visualizer/#/simulate/memory)

| Step | Action / Description |
| :---: | :--- |
| 1 | Open the **Address Space & Endianness Simulator** in the COA Lab. |
| 2 | Enter sample 32-bit word `0x1A2B3C4D` at base memory address `1000`. |
| 3 | Configure memory capacity to `32 MB` (Byte-addressed). |
| 4 | Run simulation under **Big-Endian** mode; observe address lines and byte assignments. |
| 5 | Toggle to **Little-Endian** mode; observe the rearrangement of bytes in the address space. |
| 6 | Examine the formula breakdown calculating address bus width ($k = 25$ bits for $2^{25}$ locations). |

### D. Output / Observation
- **Address Space Calculation:**
  $$\text{Capacity} = 32\text{ MB} = 32 \times 1024 \times 1024\text{ bytes} = 33,554,432\text{ bytes} = 2^{25}\text{ locations} \implies \mathbf{25\text{ Address Bits}}$$
- **Memory Table Comparison:**

| Address | Big-Endian Stored Byte | Big-Endian Significance | Little-Endian Stored Byte | Little-Endian Significance |
| :---: | :---: | :---: | :---: | :---: |
| **1000** | `0x1A` | MSB (Byte 3) | `0x4D` | LSB (Byte 0) |
| **1001** | `0x2B` | Byte 2 | `0x3C` | Byte 1 |
| **1002** | `0x3C` | Byte 1 | `0x2B` | Byte 2 |
| **1003** | `0x4D` | LSB (Byte 0) | `0x1A` | MSB (Byte 3) |

### E. What I Understood from This Activity
I understood that memory bottlenecks stem from unnecessary off-chip bus cycles. When code repeatedly reads or writes to memory instead of keeping loop counters and accumulators in processor registers, execution speed degrades by an order of magnitude. Furthermore, ensuring data alignment prevents penalty memory cycles, and understanding endianness is crucial when transferring structured data across heterogeneous network systems.

### F. Learning Outcome
- Mastered address-space dimensioning formulas: $\text{Bits} = \log_2(\text{Addressable Units})$.
- Understood physical byte mapping differences between Big-Endian and Little-Endian systems.
- Identified optimization strategies: register allocation, temporal locality caching, and word alignment.

### G. Difficulty Faced and Solution
- **Difficulty:** Visualizing how the same 32-bit hexadecimal integer changes memory bytes without altering its numerical value.
- **Solution:** The simulator's memory layout table clearly separated the stored byte values from their significance weights (MSB vs. LSB), showing that only the address-to-byte mapping changes, not the magnitude of the operand.

---

## 5. UNIT III – OPEN-ENDED QUESTION AND LEARNING REFLECTION

### A. Question Given
> *"A processor must multiply two unsigned binary numbers. How would you design the multiplication process and verify the final product?"*

### B. Concept / Theory Related to the Question
Binary multiplication of two $n$-bit unsigned integers ($M$ = Multiplicand, $Q$ = Multiplier) produces a product of up to $2n$ bits. In digital hardware, creating $n$ simultaneous partial products via an array of AND gates and ripple-carry adders requires extensive silicon area. The **Hardware Shift-and-Add Multiplication Algorithm** provides an area-efficient sequential architecture:

1. **Hardware Registers Required:**
   - **M (Multiplicand Register):** $n$ bits, holds the constant multiplicand.
   - **Q (Multiplier Register):** $n$ bits, holds the multiplier initially; shifted right each cycle; vacated high-order bits receive shifted accumulator bits.
   - **A (Accumulator Register):** $n$ bits, initialized to $0$; accumulates the running partial sum.
   - **C (Carry Flip-Flop):** $1$ bit, holds the carry-out generated during $A + M$.
   - **Sequence Counter (Count):** Initialized to $n$, decremented after each cycle.
2. **Operational Decision Rule:**
   In each iteration, the hardware inspects the least significant bit of $Q$ ($Q_0$):
   - **If $Q_0 = 1$:** The multiplicand is added to the accumulator: $C, A \leftarrow A + M$.
   - **If $Q_0 = 0$:** No addition occurs; accumulator remains unchanged.
3. **Combined Shift Right Operation:**
   Regardless of whether addition occurred, the concatenated register $[C : A : Q]$ is shifted right by one bit position:
   $$C \to A_{n-1}, \quad A_0 \to Q_{n-1}, \quad Q_0 \text{ is discarded}$$
   $C$ is reset to $0$ after the shift.
4. **Termination:**
   After exactly $n$ cycles ($\text{Count} = 0$), the $2n$-bit final product is present in $[A : Q]$.

### C. Software and Execution Procedure
- **Tool Used:** COA Platform – Unsigned Shift-and-Add Multiplication Laboratory (`#/simulate/shift-add`)
- **URL:** [https://girihaha.github.io/coa-visualizer/#/simulate/shift-add](https://girihaha.github.io/coa-visualizer/#/simulate/shift-add)

| Step | Action / Description |
| :---: | :--- |
| 1 | Navigate to **Unsigned Shift-and-Add Multiplier** in the Unit 3 Simulation suite. |
| 2 | Enter Multiplicand $M = 9_{10}$ and Multiplier $Q = 12_{10}$ at bit width $n = 4$ bits. |
| 3 | Click **Exam State Table** to open the full cycle trace table. |
| 4 | Switch to **Algorithm Flowchart** to view live node highlighting during execution. |
| 5 | Step through each micro-operation: observe initialization $\to$ check $Q_0$ $\to$ conditional add $\to$ shift right $[C:A:Q]$. |
| 6 | Verify the 8-bit concatenated product in $[A : Q]$ against the theoretical identity $9 \times 12 = 108$. |

### D. Output / Observation
- **Binary Conversion:**
  - Multiplicand $M = 9_{10} = 1001_2$
  - Multiplier $Q = 12_{10} = 1100_2$
  - Bit width $n = 4$, Expected Product Width = $2n = 8$ bits.
- **Cycle Execution State Table:**

| Cycle | Operation / Action | C | Accumulator (A) | Multiplier (Q) | Multiplicand (M) | Remarks |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Init** | Initialization | `0` | `0000` | `1100` | `1001` | Initial state: $M=9, Q=12, \text{Count}=4$ |
| **Iter 1** | Check $Q_0$ (`0`) | `0` | `0000` | `1100` | `1001` | $Q_0=0 \to$ No addition |
| | Shift Right $[C:A:Q]$ | `0` | `0000` | `0110` | `1001` | Shift right 1 bit, $\text{Count}=3$ |
| **Iter 2** | Check $Q_0$ (`0`) | `0` | `0000` | `0110` | `1001` | $Q_0=0 \to$ No addition |
| | Shift Right $[C:A:Q]$ | `0` | `0000` | `0011` | `1001` | Shift right 1 bit, $\text{Count}=2$ |
| **Iter 3** | Check $Q_0$ (`1`) | `0` | `0000` | `0011` | `1001` | $Q_0=1 \to$ Add $M$ to $A$ |
| | $A \leftarrow A + M$ | `0` | `1001` | `0011` | `1001` | $0000 + 1001 = 1001$, Carry $C=0$ |
| | Shift Right $[C:A:Q]$ | `0` | `0100` | `1001` | `1001` | Shift right 1 bit, $\text{Count}=1$ |
| **Iter 4** | Check $Q_0$ (`1`) | `0` | `0100` | `1001` | `1001` | $Q_0=1 \to$ Add $M$ to $A$ |
| | $A \leftarrow A + M$ | `0` | `1101` | `1001` | `1001` | $0100 + 1001 = 1101$, Carry $C=0$ |
| | Shift Right $[C:A:Q]$ | `0` | `0110` | `1100` | `1001` | Shift right 1 bit, $\text{Count}=0$ |
| **Result** | Final Product | — | `0110` | `1100` | `1001` | **Product $[A:Q] = 01101100_2 = 108_{10}$** |

### E. What I Understood from This Activity
This activity demonstrated how temporal sequencing replaces spatial hardware complexity. Instead of using multiple full adders for each partial product, a single $n$-bit adder combined with a shift register computes the full product across $n$ clock cycles. The visualizer clearly showed how the multiplier $Q$ is consumed bit by bit from the right while simultaneously creating room for the low-order product bits entering from the left.

### F. Learning Outcome
- Constructed the exact cycle-by-cycle execution table required for academic examinations.
- Traced the bit movements along the datapath: Carry bit $C \to$ Accumulator $A \to$ Multiplier $Q$.
- Validated mathematical equivalence: $01101100_2 = 64 + 32 + 8 + 4 = 108_{10} = 9 \times 12$.

### G. Difficulty Faced and Solution
- **Difficulty:** Remembering whether $C$ is shifted into $A$ or retained across iterations.
- **Solution:** By observing the simulator's hardware datapath tab, I saw that $C$ is shifted into the MSB of $A$ during the right-shift step and immediately reset to $0$, ensuring subsequent additions start with a clear carry line.

---

## 6. UNIT IV – OPEN-ENDED QUESTION AND LEARNING REFLECTION

### A. Question Given
> *"Two consecutive instructions depend on the result of an earlier instruction. How would you identify and resolve the resulting data hazard?"*

### B. Concept / Theory Related to the Question
In a pipelined processor, instruction execution is divided into discrete stages (e.g., 4-stage model: **Fetch [F]**, **Decode/Read [D]**, **Execute [E]**, **Write-back [W]**). A **Data Hazard** (specifically Read-After-Write or RAW) occurs when instruction $I_{k}$ requires the result of an earlier instruction $I_{j}$ before $I_{j}$ has completed writing back to the register file.

Consider the consecutive dependency sequence:
$$\begin{aligned}
I_1 &: \text{MUL } R_2, R_3, R_4 \quad (\text{Writes to } R_2) \\
I_2 &: \text{ADD } R_5, R_2, R_6 \quad (\text{Reads } R_2)
\end{aligned}$$

1. **Hazard Identification:**
   $I_1$ produces its result at the end of its Execute stage (cycle 3) and writes back to $R_2$ in Write-back (cycle 4). Meanwhile, $I_2$ enters Decode (cycle 2) and attempts to read $R_2$ before $I_1$ writes it, reading stale data.
2. **Resolution Techniques:**
   - **Hardware Stall (Bubble Insertion):** The hazard detection unit freezes $I_2$ in the Decode stage and inserts idle "bubble" cycles until $I_1$ completes Write-back. This introduces a 2-cycle penalty, reducing instruction throughput.
   - **Operand Forwarding (Bypassing):** Dedicated routing multiplexers tap the output of the ALU directly from the inter-stage register at the end of Execute and forward it immediately to the ALU input for the next cycle. This completely eliminates stalls for ALU-to-ALU operations.

### C. Software and Execution Procedure
- **Tool Used:** COA Platform – 4-Stage Pipeline & Hazard Laboratory (`#/simulate/pipeline`)
- **URL:** [https://girihaha.github.io/coa-visualizer/#/simulate/pipeline](https://girihaha.github.io/coa-visualizer/#/simulate/pipeline)

| Step | Action / Description |
| :---: | :--- |
| 1 | Open the **Pipeline & Hazard Laboratory** simulator. |
| 2 | Select the **Data Hazard** preset program:  
   `I1: MUL R2, R3, R4`  
   `I2: ADD R5, R2, R6`  
   `I3: SUB R7, R8, R9`  
   `I4: OR R10, R5, R1` |
| 3 | Set Operand Forwarding to **Off (Stall Mode)**; run simulation and record total cycle count. |
| 4 | Switch Operand Forwarding to **On (Bypass Mode)**; re-run simulation. |
| 5 | Inspect the timing matrix for stall bubbles (`D·`) versus forwarding bypass arrows (`↗`). |

### D. Output / Observation
- **Without Forwarding (Hardware Stalls Inserted):**

| Instruction | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **I1: MUL R2, R3, R4** | F | D | E | W | | | | |
| **I2: ADD R5, R2, R6** | | F | D· | D· | E | W | | |
| **I3: SUB R7, R8, R9** | | | F· | F· | D | E | W | |
| **I4: OR R10, R5, R1** | | | | | F | D· | E | W |

*Total Cycles:* **9 cycles** | Stalls: 3 bubble cycles | CPI: $2.25$.

- **With Operand Forwarding Enabled (Bypass Active):**

| Instruction | C1 | C2 | C3 | C4 | C5 | C6 | C7 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **I1: MUL R2, R3, R4** | F | D | E | W | | | |
| **I2: ADD R5, R2, R6** | | F | D | E↗ | W | | |
| **I3: SUB R7, R8, R9** | | | F | D | E | W | |
| **I4: OR R10, R5, R1** | | | | F | D | E↗ | W |

*Total Cycles:* **7 cycles** (Ideal $k + n - 1 = 4 + 4 - 1 = 7$) | Stalls: 0 | CPI: $1.75$.

### E. What I Understood from This Activity
Pipelining increases instruction throughput rather than decreasing individual instruction latency. Without forwarding, data hazards break the pipeline stream and inject idle bubbles that degrade performance. Operand forwarding leverages the insight that the data is already computed at the end of the Execute stage, so waiting for the formal Write-back stage is unnecessary when dedicated internal forwarding buses are present.

### F. Learning Outcome
- Modeled pipeline stage execution and timing matrices ($I_n \times C_k$).
- Analyzed Read-After-Write (RAW) data hazard conditions.
- Quantified the speedup achieved by hardware operand forwarding over pipeline stalling.

### G. Difficulty Faced and Solution
- **Difficulty:** Understanding why instruction $I_3$ was held when $I_2$ stalled, even though $I_3$ had no data dependency on $I_1$.
- **Solution:** The pipeline simulator illustrated in-order stage coupling: if stage Decode is occupied by a stalled instruction ($I_2$), the Fetch stage cannot advance and must also stall ($F\cdot$) to prevent overwriting the instruction buffer.

---

## 7. UNIT V – OPEN-ENDED QUESTION AND LEARNING REFLECTION

### A. Question Given
> *"A mobile device must deliver good performance while consuming less power. How would you evaluate multicore processing and the role of ARM processor architecture in meeting these requirements?"*

### B. Concept / Theory Related to the Question
Mobile computing environments operate under strict thermal design power (TDP) and battery constraints. Balancing sustained performance with minimal energy consumption requires architectural innovations across two levels:

1. **Multicore Parallelism vs. High Clock Frequency:**
   Dynamic power dissipation in CMOS circuits scales with frequency and voltage according to:
   $$P = C \cdot V^2 \cdot f$$
   Because increasing clock frequency requires a quadratic increase in operating voltage, running a single core at very high frequencies generates excessive heat. In contrast, dual-core or quad-core architectures running at lower frequencies and voltages can achieve equal or greater aggregate throughput ($T = \text{Cores} \times f$) while consuming substantially less power.
2. **Flynn's Taxonomy:**
   Multicore architectures represent **MIMD** (Multiple Instruction Streams, Multiple Data Streams) organizations, capable of executing independent thread tasks in parallel across replicated execution cores.
3. **ARM Processor Architecture Advantages:**
   - **RISC Philosophy:** Fixed 32-bit instruction formats, simple hardwired control units, and load-store architecture reduce transistor count and static leakage current.
   - **Thumb Instruction Set:** Encodes frequently used operations into 16-bit instruction formats, reducing instruction memory footprint by up to 35% and minimizing memory bus activity (which consumes significant power).
   - **Conditional Execution:** Eliminates short branch instructions and pipeline flushes, conserving execution energy.
   - **ARM big.LITTLE / Heterogeneous Multicore:** Couples high-performance out-of-order cores (for demanding tasks) with high-efficiency in-order cores (for background polling and low-power audio/tasks).

### C. Software and Execution Procedure
- **Tool Used:** COA Platform – Multicore Architecture & Thread Scheduler Simulator (`#/simulate/multicore`)
- **URL:** [https://girihaha.github.io/coa-visualizer/#/simulate/multicore](https://girihaha.github.io/coa-visualizer/#/simulate/multicore)

| Step | Action / Description |
| :---: | :--- |
| 1 | Open the **Multicore & Parallel Architecture Simulator** in Unit 5. |
| 2 | Configure workload with 5 threads of runtime lengths: `3 2 4 2 3` units. |
| 3 | Run under **1 Core (Single-core baseline)** with time-slice quantum = `2`. Record total elapsed execution time. |
| 4 | Re-run under **2 Cores (Dual-core mobile config)** with equal time-slice = `2`. |
| 5 | Re-run under **4 Cores (Quad-core configuration)** and analyze core utilization and thread completion metrics. |

### D. Output / Observation
- **Workload:** 5 Threads, Total Work Units = $3 + 2 + 4 + 2 + 3 = 14\text{ units}$.

| Core Configuration | Operating Frequency (Normalized) | Elapsed Time (Cycles) | Speedup Factor | Core Idle Units |
| :---: | :---: | :---: | :---: | :---: |
| **Single Core (1 Core)** | $1.0\times$ | **14 units** | $1.00\times$ (Baseline) | $0$ |
| **Dual Core (2 Cores)** | $0.6\times$ (Low Power) | **8 units** | $1.75\times$ | $2$ |
| **Quad Core (4 Cores)** | $0.5\times$ (Ultra Low Power) | **5 units** | $2.80\times$ | $6$ |

- **Core Schedule Matrix (Dual-Core):**
  - **Core 1:** Runs $T_1$ (slice 2) $\to$ runs $T_3$ (slice 2) $\to$ finishes $T_1$ (slice 1) $\to$ finishes $T_3$ (slice 2). Total = 7 units.
  - **Core 2:** Runs $T_2$ (slice 2, done) $\to$ runs $T_4$ (slice 2, done) $\to$ runs $T_5$ (slice 2) $\to$ finishes $T_5$ (slice 1). Total = 8 units.

### E. What I Understood from This Activity
I observed how replicated cores distribute thread workloads in parallel without requiring extreme clock rates. A dual-core configuration completed the workload in 8 units instead of 14 units. In mobile devices, this allows processor cores to finish computing quickly and return to an ultra-low-power idle state ("race-to-sleep" principle). Coupled with ARM's load-store model and Thumb 16-bit code density, power dissipation is kept well within mobile thermal limits.

### F. Learning Outcome
- Evaluated performance differences between single-core and multicore scheduling.
- Connected the cubic power-voltage relationship ($P \propto V^2f$) to modern multicore mobile architectures.
- Analyzed the energy-saving role of ARM RISC architectures, Thumb instruction encoding, and load-store memory access.

### G. Difficulty Faced and Solution
- **Difficulty:** Understanding why doubling from 2 to 4 cores did not achieve a theoretical $2\times$ reduction in execution time (went from 8 units to 5 units, not 4 units).
- **Solution:** The simulator highlighted workload imbalance (Amdahl's law effect): thread lengths were uneven (`3 2 4 2 3`), meaning some cores finished their assigned work early and sat idle while waiting for the longest thread ($T_3$, length 4) to finish.

---

## 8. OVERALL LEARNING AND SKILLS GAINED

- **Understanding of COA Concepts:** Gained unified insight across all architectural abstraction layers—from logic gates and binary complement representation in Unit I, to bus structures and memory addressing in Unit II, ALU multiplication algorithms in Unit III, pipelined instruction datapaths in Unit IV, and multicore parallel processing in Unit V.
- **Practical / Software Execution:** Developed proficiency in configuring, executing, and analyzing deterministic architectural simulators on our custom platform at [https://girihaha.github.io/coa-visualizer/](https://girihaha.github.io/coa-visualizer/).
- **Interpreting Outputs:** Learned to read micro-operation step traces, parse register transfer notation ($[C:A:Q]$), evaluate pipeline cycle grids with forwarding arrows, and verify IEEE 754 bitfields.
- **Problem-Solving and Debugging:** Solved architectural challenges including data hazard resolution via operand forwarding, word alignment optimization, and division sign restoration.
- **Connecting Theory with Practical Application:** Bridged textbook theory with modern engineering applications, seeing how mathematical concepts (such as Horner's rule, Boolean De Morgan laws, and Amdahl's law) directly determine physical hardware efficiency.

---

## 9. CHALLENGES FACED AND HOW THEY WERE SOLVED

| S. No. | Challenge / Error Encountered | How It Was Resolved |
| :---: | :--- | :--- |
| **1** | **Shift-and-Add Carry Accumulation:** During manual exam calculations, confusion occurred regarding whether the carry bit $C$ remains set across multiple shift cycles. | Verified via the simulation datapath that $C$ is cleared to $0$ immediately after being shifted into the MSB of the Accumulator ($A$). |
| **2** | **Endianness Interpretation in Memory:** Misunderstanding how hexadecimal multi-byte integers are laid out across ascending memory byte addresses. | Used the Memory Layout Table simulator to observe that Little-Endian places LSB (`0x4D`) at the base address while Big-Endian places MSB (`0x1A`) at the base address. |
| **3** | **Data Hazard Stalls vs. Forwarding:** Difficulty determining the exact number of idle cycles needed when two instructions share a register dependency. | Simulated both modes side by side in the 4-Stage Pipeline simulator, visually confirming that operand forwarding eliminates 2 bubble cycles for ALU operations. |

---

## 10. SIMULATION EXPERIMENT

### A. Name of the Experiment
**Hardware Implementation and Cycle Verification of Unsigned Binary Multiplication using the Shift-and-Add Architecture.**

### B. Aim
To simulate, trace, and verify the sequential multiplication of two 4-bit unsigned binary integers:
$$\text{Multiplicand } M = 9_{10} = 1001_2, \quad \text{Multiplier } Q = 12_{10} = 1100_2$$
using the hardware shift-and-add architecture, construct the complete cycle state table, trace the algorithm flowchart, and verify the 8-bit product $[A : Q] = 108_{10} = 01101100_2$.

### C. Procedure
1. Initialize registers: Accumulator $A \leftarrow 0000_2$, Carry $C \leftarrow 0$, Multiplier $Q \leftarrow 1100_2$, Multiplicand $M \leftarrow 1001_2$, Sequence Counter $\text{Count} \leftarrow 4$.
2. In each cycle $i$ (from $i = 1$ to $4$):
   - Inspect $Q_0$ (the least significant bit of register $Q$).
   - If $Q_0 = 1$: Compute $C, A \leftarrow A + M$ (add multiplicand to accumulator with carry).
   - If $Q_0 = 0$: Bypass addition; leave $A$ unchanged.
   - Perform a logical right shift on the combined register $[C : A : Q]$ by one bit position ($C \to A_3, A_0 \to Q_3$, discard $Q_0$).
   - Reset carry $C \leftarrow 0$.
   - Decrement counter: $\text{Count} \leftarrow \text{Count} - 1$.
3. When $\text{Count} = 0$, terminate the loop and read the 8-bit result concatenated across $[A : Q]$.

### D. Output / Execution State Table

```
====================================================================================================================
CYCLE     ACTION / OPERATION              C      ACCUMULATOR (A)    MULTIPLIER (Q)    MULTIPLICAND (M)   COUNT
====================================================================================================================
Init      Initial Setup                   0      0000               1100              1001               4
--------------------------------------------------------------------------------------------------------------------
Iter 1    Check Q0 = 0 (No Add)           0      0000               1100              1001               4
          Shift Right [C:A:Q]             0      0000               0110              1001               3
--------------------------------------------------------------------------------------------------------------------
Iter 2    Check Q0 = 0 (No Add)           0      0000               0110              1001               3
          Shift Right [C:A:Q]             0      0000               0011              1001               2
--------------------------------------------------------------------------------------------------------------------
Iter 3    Check Q0 = 1 (Add Required)     0      0000               0011              1001               2
          A <-- A + M                     0      1001               0011              1001               2
          Shift Right [C:A:Q]             0      0100               1001              1001               1
--------------------------------------------------------------------------------------------------------------------
Iter 4    Check Q0 = 1 (Add Required)     0      0100               1001              1001               1
          A <-- A + M                     0      1101               1001              1001               1
          Shift Right [C:A:Q]             0      0110               1100              1001               0
====================================================================================================================
FINAL RESULT: Product = [A : Q] = 0110 1100 (binary) = 108 (decimal)
====================================================================================================================
```

- **Interactive Verification URL:**  
  [https://girihaha.github.io/coa-visualizer/#/simulate/shift-add](https://girihaha.github.io/coa-visualizer/#/simulate/shift-add)

### E. Result
The unsigned multiplication of $9_{10} \times 12_{10}$ was successfully simulated and verified. The hardware shift-and-add algorithm executed in exactly $4$ iterations, yielding the 8-bit concatenated register product $[A : Q] = 01101100_2$, which corresponds exactly to $64 + 32 + 8 + 4 = 108_{10}$.

---

## 11. CONCLUSION

Completing this practical learning activity across all five units of **21CSS201T – Computer Organization and Architecture** provided an invaluable link between abstract theoretical principles and concrete hardware implementation. By designing, deploying, and utilizing our custom interactive simulation platform at [https://girihaha.github.io/coa-visualizer/](https://girihaha.github.io/coa-visualizer/), we were able to observe register-level state transitions, bus transfers, hazard resolutions, and multicore thread distributions in real time. 

This experiential methodology reinforced key examination requirements—such as drawing execution state tables, tracing algorithm flowcharts, and calculating memory space bounds—while building lasting engineering competence in computer architecture design.
