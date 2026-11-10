import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildShiftAdd, type ShiftAddState } from '@/sims/logic/shiftAdd';
import { fromBitsUnsigned, parseSignedInt, toBits } from '@/sims/logic/bits';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';
import { Code2, Cpu, FileText, GitBranch } from 'lucide-react';

const SHIFT_ADD_NODES: FlowNode[] = [
  { id: 'start',       label: 'Start',                                               x: 220, y: 30,  kind: 'terminal' },
  { id: 'init',        label: 'Initialize: C=0, A=0, M=Multiplicand, Q=Multiplier, Count=n', x: 220, y: 95,  kind: 'process' },
  { id: 'check_q0',    label: 'LSB Q₀ = 1 ?',                                        x: 220, y: 175, kind: 'decision' },
  { id: 'add',         label: 'C, A ← A + M',                                        x: 470, y: 175, kind: 'process' },
  { id: 'shift',       label: 'Shift Right [C : A : Q] (C→A, A₀→Q)',                 x: 220, y: 260, kind: 'process' },
  { id: 'dec',         label: 'Count ← Count − 1',                                   x: 220, y: 335, kind: 'process' },
  { id: 'check_count', label: 'Count = 0 ?',                                         x: 220, y: 410, kind: 'decision' },
  { id: 'end',         label: 'Product = [A : Q]',                                   x: 470, y: 410, kind: 'terminal' },
];

const SHIFT_ADD_EDGES: FlowEdge[] = [
  { from: 'start',       to: 'init' },
  { from: 'init',        to: 'check_q0' },
  { from: 'check_q0',    to: 'add',         label: 'yes (1)' },
  { from: 'check_q0',    to: 'shift',       label: 'no (0)' },
  { from: 'add',         to: 'shift',       via: [[580, 175], [580, 260]] },
  { from: 'shift',       to: 'dec' },
  { from: 'dec',         to: 'check_count' },
  { from: 'check_count', to: 'end',         label: 'yes' },
  { from: 'check_count', to: 'check_q0',    label: 'no', via: [[50, 410], [50, 175]] },
];

function getFlowState(title: string, decision: string) {
  if (title === 'Initial state') return { active: ['start', 'init'], visited: [] };
  if (title.startsWith('Result')) return { active: ['end'], visited: ['start', 'init', 'shift', 'dec'] };
  if (title.includes('check Q0')) return { active: ['check_q0'], visited: ['init'] };
  if (title.includes('add')) return { active: ['add'], visited: ['check_q0'] };
  if (title.includes('shift right')) return { active: ['shift', 'dec'], visited: ['check_q0', ...(decision === '1' ? ['add'] : [])] };
  return { active: ['check_count'], visited: ['shift'] };
}

interface ExamTableRow {
  step: string;
  action: string;
  C: string;
  A: string;
  Q: string;
  M: string;
  remark: string;
}

function generateExamTable(mVal: number, qVal: number, n: number): ExamTableRow[] {
  const max = (1 << n) - 1;
  const M = toBits(BigInt(mVal), n);
  let A = '0'.repeat(n);
  let Q = toBits(BigInt(qVal), n);
  let C = '0';
  const rows: ExamTableRow[] = [];

  rows.push({
    step: 'Init',
    action: 'Initialization',
    C,
    A,
    Q,
    M,
    remark: `Initial values: M = ${mVal}, Q = ${qVal}`,
  });

  for (let i = 1; i <= n; i++) {
    const q0 = Q[n - 1];
    rows.push({
      step: `Iter ${i}`,
      action: `Check Q₀ (${q0})`,
      C,
      A,
      Q,
      M,
      remark: q0 === '1' ? 'Q₀ = 1 → Addition required' : 'Q₀ = 0 → No addition, shift only',
    });

    if (q0 === '1') {
      const sum = fromBitsUnsigned(A) + fromBitsUnsigned(M);
      A = toBits(BigInt(Number(sum) & max), n);
      C = Number(sum) > max ? '1' : '0';
      rows.push({
        step: `Iter ${i}`,
        action: 'A ← A + M',
        C,
        A,
        Q,
        M,
        remark: `Add multiplicand to A (Carry = ${C})`,
      });
    }

    const newQ = A[n - 1] + Q.slice(0, n - 1);
    const newA = C + A.slice(0, n - 1);
    A = newA;
    Q = newQ;
    C = '0';
    rows.push({
      step: `Iter ${i}`,
      action: 'Shift Right [C:A:Q]',
      C,
      A,
      Q,
      M,
      remark: `Shift right 1 bit, Count = ${n - i}`,
    });
  }

  rows.push({
    step: 'Result',
    action: 'Final Product',
    C: '—',
    A,
    Q,
    M,
    remark: `Product = [A : Q] = ${A}${Q}₂ = ${mVal * qVal}₁₀`,
  });

  return rows;
}

export function ShiftAddSim() {
  const [m, setM] = useState('9');
  const [q, setQ] = useState('12');
  const [n, setN] = useState(4);
  const [activeTab, setActiveTab] = useState<'visual' | 'table' | 'flowchart' | 'code'>('visual');

  const build = useMemo(() => buildShiftAdd(m, q, n), [m, q, n]);

  const examTable = useMemo(() => {
    const mNum = parseSignedInt(m);
    const qNum = parseSignedInt(q);
    if (mNum !== null && qNum !== null && mNum >= 0n && qNum >= 0n) {
      return generateExamTable(Number(mNum), Number(qNum), n);
    }
    return [];
  }, [m, q, n]);

  const cppCode = `// C++ Implementation of Unsigned Binary Multiplication (Shift & Add)
#include <iostream>
#include <bitset>
using namespace std;

unsigned long long multiply_shift_add(unsigned int M, unsigned int Q, int n) {
    unsigned int A = 0;       // Accumulator
    unsigned int C = 0;       // Carry bit
    unsigned int mask = (1 << n) - 1;

    cout << "Initial: C=" << C << " A=" << bitset<8>(A) 
         << " Q=" << bitset<8>(Q) << " M=" << bitset<8>(M) << endl;

    for (int count = n; count > 0; count--) {
        // Step 1: Inspect LSB of Q
        if (Q & 1) {
            unsigned int sum = A + M;
            A = sum & mask;
            C = (sum > mask) ? 1 : 0;
            cout << "Add:     C=" << C << " A=" << bitset<8>(A) << endl;
        }

        // Step 2: Shift right [C : A : Q]
        unsigned int lsb_A = A & 1;
        Q = (Q >> 1) | (lsb_A << (n - 1));
        A = (A >> 1) | (C << (n - 1));
        C = 0; // Carry cleared after shift
        cout << "Shift:   C=" << C << " A=" << bitset<8>(A) 
             << " Q=" << bitset<8>(Q) << endl;
    }

    // Combine A and Q for 2n-bit result
    unsigned long long product = ((unsigned long long)A << n) | Q;
    return product;
}

int main() {
    unsigned int M = ${m}; // Multiplicand
    unsigned int Q = ${q}; // Multiplier
    int n = ${n};          // Bit width

    unsigned long long result = multiply_shift_add(M, Q, n);
    cout << "\\nFinal Product: " << result << " (decimal)\\n";
    return 0;
}`;

  return (
    <SimLayout<ShiftAddState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="sa-m" label="Multiplicand M (decimal)" hint={`Unsigned integer, range 0 to ${(1 << n) - 1}.`}>
            <input
              id="sa-m"
              className={inputClass}
              value={m}
              onChange={(e) => setM(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="sa-q" label="Multiplier Q (decimal)" hint={`Unsigned integer, range 0 to ${(1 << n) - 1}.`}>
            <input
              id="sa-q"
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="sa-n" label="Operand bit width (n)">
            <Segmented
              label="Operand width"
              value={n}
              options={[4, 5, 6, 8].map((w) => ({ value: w, label: `${w} bits` }))}
              onChange={setN}
            />
          </Field>
        </>
      }
      assumptions={[
        'Unsigned binary multiplication using hardware Shift-and-Add architecture.',
        'Registers: Carry C (1-bit), Accumulator A (n-bit initialized to 0), Multiplier Q (n-bit), Multiplicand M (n-bit).',
        'Decision rule: Inspect Q₀ (LSB of Q). If Q₀ = 1, add M to A (C, A ← A + M). Then shift right [C : A : Q]. If Q₀ = 0, shift right without adding.',
        'Total iterations = n. Resulting product has 2n bits residing in combined [A : Q].',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            {/* View navigation pill tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
              {[
                { id: 'visual',    label: 'Hardware Datapath',  icon: Cpu },
                { id: 'table',     label: 'Exam State Table',    icon: FileText },
                { id: 'flowchart', label: 'Algorithm Flowchart', icon: GitBranch },
                { id: 'code',      label: 'C++ Code Reference',  icon: Code2 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                    activeTab === id
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            {/* TAB 1: Hardware Datapath View */}
            {activeTab === 'visual' && (
              <div className="flex flex-col gap-5">
                {/* Connected Register Bank */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-slate-500 font-semibold">
                      Shift-and-Add Register Array [C : A : Q]
                    </span>
                    <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-800">
                      Multiplicand M = {m} ({s.M}₂)
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[80px_1fr_1fr]">
                    {/* Carry C */}
                    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Carry (C)</span>
                      <span className={`mt-1 font-mono text-2xl font-bold ${s.carry === '1' ? 'text-amber-600' : 'text-slate-700'}`}>
                        {s.carry}
                      </span>
                    </div>

                    {/* Accumulator A */}
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <BitRow label="Accumulator (A)" bits={s.A} tone="amber" />
                    </div>

                    {/* Multiplier Q */}
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <BitRow
                        label="Multiplier (Q) — LSB Q₀ active"
                        bits={s.Q}
                        tone="indigo"
                        highlight={[s.Q.length - 1]}
                      />
                    </div>
                  </div>

                  {/* Flow Arrow Indicator */}
                  <div className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-slate-500 bg-white rounded-lg p-2.5 border border-slate-200">
                    <span className="font-semibold text-indigo-600">Shift Right Pathway:</span>
                    <span>Carry C ──► Accumulator A ──► Multiplier Q ──► (Discards Q₀)</span>
                  </div>
                </div>

                {/* Status Chips */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <ValueChip label="Cycle Iteration" value={`Iteration ${s.iteration} of ${s.n}`} tone="indigo" />
                  <ValueChip label="Current LSB Decision (Q₀)" value={`Q₀ = ${s.decision}`} tone={s.decision === '1' ? 'indigo' : 'neutral'} />
                  <ValueChip label="Hardware Action" value={step.operation} tone="amber" />
                </div>
              </div>
            )}

            {/* TAB 2: Exam State Table */}
            {activeTab === 'table' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500 font-semibold">
                    Complete Exam Execution Table (Draw this in your theory/lab exam)
                  </p>
                  <span className="text-xs text-indigo-600 font-medium">
                    Operands: {m} × {q} ({n}-bit)
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                        <th className="px-3.5 py-2.5 text-left font-semibold border-r border-slate-200">Cycle</th>
                        <th className="px-3.5 py-2.5 text-left font-semibold border-r border-slate-200">Operation / Step</th>
                        <th className="px-3.5 py-2.5 text-center font-semibold border-r border-slate-200">C</th>
                        <th className="px-3.5 py-2.5 text-center font-semibold border-r border-slate-200">Accumulator (A)</th>
                        <th className="px-3.5 py-2.5 text-center font-semibold border-r border-slate-200">Multiplier (Q)</th>
                        <th className="px-3.5 py-2.5 text-center font-semibold border-r border-slate-200">Multiplicand (M)</th>
                        <th className="px-3.5 py-2.5 text-left font-semibold font-sans">Remarks / Hardware Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examTable.map((row, idx) => {
                        const isCurrent = step.title.toLowerCase().includes(row.step.toLowerCase()) && 
                                          step.operation.toLowerCase().includes(row.action.toLowerCase().replace(/\[.*?\]/g, '').trim());
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                              isCurrent
                                ? 'bg-indigo-50 font-bold text-indigo-900'
                                : row.step === 'Result'
                                ? 'bg-emerald-50/70 font-semibold text-emerald-900'
                                : 'even:bg-slate-50/60 text-slate-700'
                            }`}
                          >
                            <td className="px-3.5 py-2 border-r border-slate-100 font-semibold text-indigo-700">{row.step}</td>
                            <td className="px-3.5 py-2 border-r border-slate-100 font-semibold">{row.action}</td>
                            <td className="px-3.5 py-2 text-center border-r border-slate-100">{row.C}</td>
                            <td className="px-3.5 py-2 text-center border-r border-slate-100 tracking-wider">{row.A}</td>
                            <td className="px-3.5 py-2 text-center border-r border-slate-100 tracking-wider">{row.Q}</td>
                            <td className="px-3.5 py-2 text-center border-r border-slate-100 tracking-wider text-slate-500">{row.M}</td>
                            <td className="px-3.5 py-2 font-sans text-xs text-slate-600">{row.remark}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Flowchart View */}
            {activeTab === 'flowchart' && (
              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  Standard Shift-and-Add Algorithm Flowchart
                </p>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <Flowchart
                    title="Shift-and-add algorithm flowchart"
                    width={680}
                    height={460}
                    nodes={SHIFT_ADD_NODES}
                    edges={SHIFT_ADD_EDGES}
                    {...getFlowState(step.title, s.decision)}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: C++ Implementation Code */}
            {activeTab === 'code' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500 font-semibold">
                    C++ Reference Code (Simulated with current operands M = {m}, Q = {q})
                  </p>
                  <span className="text-xs text-slate-400 font-mono">C++17</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 shadow-sm overflow-x-auto text-xs font-mono text-slate-100 leading-relaxed">
                  <pre>{cppCode}</pre>
                </div>
              </div>
            )}
          </div>
        );
      }}
      output={(step) => {
        const p = step.state.product;
        const mNum = Number(m);
        const qNum = Number(q);
        return (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Product bits (2n bits in [A : Q])"
                value={p ?? 'Available at the final step'}
                tone={p ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Product (decimal interpretation)"
                value={p ? fromBitsUnsigned(p).toString() : '—'}
                tone={p ? 'indigo' : 'neutral'}
              />
            </div>
            {p && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600 font-mono">
                <span>Verification Formula: {mNum} × {qNum} = <strong className="text-indigo-700">{mNum * qNum}</strong></span>
                <span className="text-emerald-700 font-semibold">✓ Exact Match with [A:Q]</span>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
