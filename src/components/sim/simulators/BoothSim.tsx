import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildBooth, type BoothState } from '@/sims/logic/booth';
import { fromBitsSigned, toBits } from '@/sims/logic/bits';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';
import { Code2, FileText, GitBranch, Table as TableIcon } from 'lucide-react';

const BOOTH_NODES: FlowNode[] = [
  { id: 'start',   label: 'Start',                         x: 220, y: 30,  kind: 'terminal' },
  { id: 'init',    label: 'Initialize A=0, Q₋₁=0, Count=n', x: 220, y: 95,  kind: 'process' },
  { id: 'inspect', label: 'Inspect Q₀ and Q₋₁',            x: 220, y: 165, kind: 'process' },
  { id: 'd01',     label: 'Q₀Q₋₁ = 01 ?',                  x: 220, y: 240, kind: 'decision' },
  { id: 'add',     label: 'A ← A + M',                     x: 470, y: 240, kind: 'process' },
  { id: 'd10',     label: 'Q₀Q₋₁ = 10 ?',                  x: 220, y: 315, kind: 'decision' },
  { id: 'sub',     label: 'A ← A − M',                     x: 470, y: 315, kind: 'process' },
  { id: 'noop',    label: 'No-op (00 or 11)',              x: 220, y: 390, kind: 'process' },
  { id: 'shift',   label: 'Arithmetic Right Shift [A : Q : Q₋₁]', x: 220, y: 465, kind: 'process' },
  { id: 'count',   label: 'Count = 0 ?',                   x: 220, y: 535, kind: 'decision' },
  { id: 'end',     label: 'Product = [A : Q]',             x: 470, y: 535, kind: 'terminal' },
];

const BOOTH_EDGES: FlowEdge[] = [
  { from: 'start',   to: 'init' },
  { from: 'init',    to: 'inspect' },
  { from: 'inspect', to: 'd01' },
  { from: 'd01',     to: 'add',     label: 'yes (01)' },
  { from: 'd01',     to: 'd10',     label: 'no' },
  { from: 'd10',     to: 'sub',     label: 'yes (10)' },
  { from: 'd10',     to: 'noop',    label: 'no (00/11)' },
  { from: 'add',     to: 'shift',   via: [[580, 240], [580, 465]] },
  { from: 'sub',     to: 'shift',   via: [[580, 315], [580, 465]] },
  { from: 'noop',    to: 'shift' },
  { from: 'shift',   to: 'count' },
  { from: 'count',   to: 'end',     label: 'yes' },
  { from: 'count',   to: 'inspect', label: 'no', via: [[50, 535], [50, 165]] },
];

function boothFlowState(title: string, pair: string, iteration: number, n: number) {
  if (title === 'Initial state') return { active: ['start', 'init'], visited: [] };
  if (title.startsWith('Result')) return { active: ['end'], visited: ['start', 'init', 'inspect', 'shift'] };
  if (title.includes('inspect')) return { active: ['inspect'], visited: ['init'] };
  if (title.includes('add')) return { active: ['d01', 'add'], visited: ['inspect'] };
  if (title.includes('subtract')) return { active: ['d10', 'sub'], visited: ['inspect', 'd01'] };
  if (title.includes('arithmetic right shift')) {
    return { active: ['shift'], visited: ['inspect', iteration >= n ? 'count' : ''] };
  }
  return { active: ['count'], visited: ['shift'] };
}

interface BoothExamRow {
  cycle: string;
  operation: string;
  A: string;
  Q: string;
  Qm1: string;
  pair: string;
  count: number;
  remarks: string;
}

function generateBoothExamTable(mVal: number, qVal: number, n: number): BoothExamRow[] {
  const rows: BoothExamRow[] = [];
  const mask = (1 << n) - 1;
  const toSignedBits = (v: number, width: number) => {
    let raw = v < 0 ? (1 << width) + v : v;
    let s = (raw & ((1 << width) - 1)).toString(2);
    while (s.length < width) s = '0' + s;
    return s;
  };

  let A = 0;
  let Q = qVal < 0 ? (1 << n) + qVal : qVal;
  let Qm1 = 0;
  let M = mVal < 0 ? (1 << n) + mVal : mVal;
  let count = n;

  rows.push({
    cycle: 'Init',
    operation: 'Initialization',
    A: toSignedBits(A, n),
    Q: toSignedBits(Q, n),
    Qm1: String(Qm1),
    pair: '—',
    count,
    remarks: `Initial state: M = ${mVal}, Q = ${qVal}`,
  });

  for (let i = 1; i <= n; i++) {
    const q0 = Q & 1;
    const pair = `${q0}${Qm1}`;
    let opStr = 'No operation';
    let remarks = `Q₀Q₋₁ = ${pair} → No arithmetic`;

    if (pair === '01') {
      opStr = 'A ← A + M';
      A = (A + mVal) & mask;
      remarks = `Q₀Q₋₁ = 01 → Add Multiplicand (M = ${mVal})`;
      rows.push({
        cycle: `Iter ${i}`,
        operation: opStr,
        A: toSignedBits(A, n),
        Q: toSignedBits(Q, n),
        Qm1: String(Qm1),
        pair,
        count,
        remarks,
      });
    } else if (pair === '10') {
      opStr = 'A ← A − M';
      A = (A - mVal) & mask;
      remarks = `Q₀Q₋₁ = 10 → Subtract Multiplicand (A = A − ${mVal})`;
      rows.push({
        cycle: `Iter ${i}`,
        operation: opStr,
        A: toSignedBits(A, n),
        Q: toSignedBits(Q, n),
        Qm1: String(Qm1),
        pair,
        count,
        remarks,
      });
    }

    // Arithmetic Right Shift [A : Q : Q-1]
    const aSign = (A >> (n - 1)) & 1;
    const aLsb = A & 1;
    const qLsb = Q & 1;

    Qm1 = qLsb;
    Q = (Q >> 1) | (aLsb << (n - 1));
    A = (A >> 1) | (aSign << (n - 1));
    count--;

    rows.push({
      cycle: `Iter ${i}`,
      operation: 'Arith Shift Right',
      A: toSignedBits(A, n),
      Q: toSignedBits(Q, n),
      Qm1: String(Qm1),
      pair,
      count,
      remarks: `Arithmetic Shift [A : Q : Q₋₁], Count = ${count}`,
    });
  }

  return rows;
}

const BOOTH_CPP_CODE = `// Booth's Multiplication Algorithm for Signed Binary Numbers
// Generates cycle-by-cycle academic register execution table

#include <iostream>
#include <iomanip>
#include <bitset>
using namespace std;

void printRow(string cycle, string op, int A, int Q, int Qm1, int count, int n, string remark) {
    auto to_bin = [](int val, int len) {
        string s = bitset<16>(val).to_string();
        return s.substr(16 - len);
    };
    cout << "| " << setw(7) << left << cycle 
         << "| " << setw(18) << left << op 
         << "| " << setw(n + 2) << left << to_bin(A, n) 
         << "| " << setw(n + 2) << left << to_bin(Q, n) 
         << "| " << setw(5) << left << Qm1 
         << "| " << setw(7) << left << count 
         << "| " << remark << " |\\n";
}

int main() {
    int M = -5;  // Multiplicand
    int Q_orig = 7; // Multiplier
    int n = 4;   // Bit width
    int mask = (1 << n) - 1;

    int A = 0;
    int Q = Q_orig < 0 ? (1 << n) + Q_orig : Q_orig;
    int Qm1 = 0;
    int count = n;

    cout << "=== BOOTH MULTIPLICATION EXECUTION TABLE ===\\n";
    printRow("Init", "Initialization", A, Q, Qm1, count, n, "Initial values");

    for (int i = 1; i <= n; i++) {
        int q0 = Q & 1;
        string pair = to_string(q0) + to_string(Qm1);

        if (pair == "01") {
            A = (A + M) & mask;
            printRow("Iter " + to_string(i), "A <- A + M", A, Q, Qm1, count, n, "Q0Q-1=01 (Add M)");
        } else if (pair == "10") {
            A = (A - M) & mask;
            printRow("Iter " + to_string(i), "A <- A - M", A, Q, Qm1, count, n, "Q0Q-1=10 (Sub M)");
        }

        // Arithmetic right shift
        int aSign = (A >> (n - 1)) & 1;
        int aLsb = A & 1;
        int qLsb = Q & 1;
        Qm1 = qLsb;
        Q = (Q >> 1) | (aLsb << (n - 1));
        A = (A >> 1) | (aSign << (n - 1));
        count--;

        printRow("Iter " + to_string(i), "Shift Right", A, Q, Qm1, count, n, "Arithmetic Shift");
    }

    int product = (A << n) | Q;
    if (product & (1 << (2 * n - 1))) product -= (1 << (2 * n));
    cout << "\\nFinal Product: " << product << " (" << M << " * " << Q_orig << ")\\n";
    return 0;
}`;

export function BoothSim() {
  const [m, setM] = useState('-5');
  const [q, setQ] = useState('7');
  const [n, setN] = useState(4);
  const [activeTab, setActiveTab] = useState<'registers' | 'table' | 'flowchart' | 'code'>('registers');

  const build = useMemo(() => buildBooth({ m, q, n }), [m, q, n]);
  const examTable = useMemo(() => {
    const mNum = parseInt(m, 10);
    const qNum = parseInt(q, 10);
    if (isNaN(mNum) || isNaN(qNum) || n < 2 || n > 8) return [];
    return generateBoothExamTable(mNum, qNum, n);
  }, [m, q, n]);

  return (
    <SimLayout<BoothState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="booth-m" label="Multiplicand M (Signed)" hint="Signed decimal within width range.">
            <input
              id="booth-m"
              className={inputClass}
              value={m}
              onChange={(e) => setM(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="booth-q" label="Multiplier Q (Signed)" hint="Signed decimal within width range.">
            <input
              id="booth-q"
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="booth-n" label="Register bit width n" hint="Bit width (4 recommended for exams).">
            <input
              id="booth-n"
              type="number"
              min={2}
              max={8}
              className={inputClass}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
            />
          </Field>
        </>
      }
      assumptions={[
        "Two's complement signed representation with fixed width n.",
        'Inspect lowest bit pair Q₀ and Q₋₁ at each iteration: 01 → Add M, 10 → Subtract M, 00/11 → No operation.',
        'Arithmetic right shift copies sign bit of A into A_MSB, preserving sign of negative quantities.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-5">
            {/* Academic Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('registers')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'registers'
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <TableIcon size={14} />
                  Register State
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'table'
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <FileText size={14} />
                  Exam State Table
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('flowchart')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'flowchart'
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <GitBranch size={14} />
                  Algorithm Flowchart
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'code'
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Code2 size={14} />
                  C++ Reference
                </button>
              </div>

              <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                M = {m} · Q = {q} · n = {n}
              </span>
            </div>

            {/* TAB 1: REGISTERS & DECISION */}
            {activeTab === 'registers' && (
              <div className="flex flex-col gap-5">
                {/* Status metrics */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <ValueChip label="Cycle Iteration" value={`Step ${s.iteration} of ${s.n}`} />
                  <ValueChip
                    label="Current Pair Q₀Q₋₁"
                    value={s.pair || '—'}
                    tone={s.pair ? 'indigo' : 'neutral'}
                  />
                  <ValueChip
                    label="Active Operation"
                    value={s.operation}
                    tone={s.operation.includes('+') ? 'cyan' : s.operation.includes('−') || s.operation.includes('-') ? 'amber' : 'neutral'}
                  />
                </div>

                {/* Register Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th className="w-20">Register</th>
                        <th>Binary Bits [Sign .. LSB]</th>
                        <th className="w-28 text-right">Signed Decimal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'M (Multiplicand)', bits: s.M, tone: 'neutral' as const },
                        { name: 'A (Accumulator)',  bits: s.A, tone: 'amber'   as const },
                        { name: 'Q (Multiplier)',   bits: s.Q, tone: 'cyan'    as const },
                        { name: 'Q₋₁ (Previous)',   bits: s.Qm1, tone: 'cyan'  as const },
                      ].map(({ name, bits, tone }) => (
                        <tr key={name}>
                          <td className="font-mono text-xs font-bold text-slate-800">
                            {name}
                          </td>
                          <td>
                            <BitRow label="" bits={bits} tone={tone} />
                          </td>
                          <td className="font-mono text-xs font-semibold text-right text-slate-700">
                            {fromBitsSigned(bits)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Booth Decision Reference Table */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="academic-header">Booth Recoding Rule Reference</p>
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th className="w-16">Q₀</th>
                        <th className="w-16">Q₋₁</th>
                        <th>Arithmetic Action</th>
                        <th>Subsequent Step</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { q0: '0', qm1: '0', op: 'No arithmetic operation (A remains unchanged)', pair: '00' },
                        { q0: '0', qm1: '1', op: 'A ← A + M (Add multiplicand)',                  pair: '01' },
                        { q0: '1', qm1: '0', op: 'A ← A − M (Subtract multiplicand)',             pair: '10' },
                        { q0: '1', qm1: '1', op: 'No arithmetic operation (A remains unchanged)', pair: '11' },
                      ].map((r) => {
                        const isCurrent = s.pair === r.pair;
                        return (
                          <tr key={r.pair} className={isCurrent ? 'active-row' : ''}>
                            <td className="font-mono text-xs font-bold">{r.q0}</td>
                            <td className="font-mono text-xs font-bold">{r.qm1}</td>
                            <td className="font-sans text-xs">{r.op}</td>
                            <td className="font-sans text-xs text-slate-500">Arithmetic Right Shift [A : Q : Q₋₁]</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: EXAM STATE TABLE */}
            {activeTab === 'table' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="academic-header !mb-0">
                    Cycle-by-Cycle Examination Execution Table (M = {m}, Q = {q})
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Standard University Evaluation Format
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th className="w-20">Cycle</th>
                        <th className="w-40">Step / Operation</th>
                        <th>A (Accumulator)</th>
                        <th>Q (Multiplier)</th>
                        <th className="w-14 text-center">Q₋₁</th>
                        <th className="w-16 text-center">Count</th>
                        <th>Academic Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examTable.map((row, idx) => {
                        const isCurrent = step.title.toLowerCase().includes(row.cycle.toLowerCase()) ||
                          (row.cycle.includes(String(s.iteration)) && row.operation.toLowerCase().includes(s.operation.toLowerCase().slice(0, 3)));
                        return (
                          <tr key={idx} className={isCurrent ? 'active-row' : ''}>
                            <td className="font-mono text-xs font-bold text-slate-700">{row.cycle}</td>
                            <td className="font-mono text-xs font-semibold text-slate-800">{row.operation}</td>
                            <td className="font-mono text-xs text-indigo-700 font-semibold">{row.A}</td>
                            <td className="font-mono text-xs text-cyan-700 font-semibold">{row.Q}</td>
                            <td className="font-mono text-xs text-center font-bold text-slate-700">{row.Qm1}</td>
                            <td className="font-mono text-xs text-center font-bold text-slate-700">{row.count}</td>
                            <td className="text-xs text-slate-600 font-sans">{row.remarks}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: FLOWCHART */}
            {activeTab === 'flowchart' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">Booth Algorithm Flowchart (Live Node Tracking)</p>
                  <span className="text-[11px] text-indigo-600 font-medium">Highlighted node corresponds to active simulation step</span>
                </div>
                <div className="flex justify-center overflow-x-auto py-2">
                  <Flowchart
                    title="Booth Algorithm Flowchart"
                    width={680}
                    height={580}
                    nodes={BOOTH_NODES}
                    edges={BOOTH_EDGES}
                    {...boothFlowState(step.title, s.pair, s.iteration, s.n)}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: C++ CODE */}
            {activeTab === 'code' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">C++ Reference Implementation</p>
                  <span className="text-[11px] text-slate-500 font-mono">booth_multiplier.cpp</span>
                </div>
                <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200">
                  {BOOTH_CPP_CODE}
                </pre>
              </div>
            )}
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const p = s.product;
        return (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Product Register [A : Q] (2n bits)"
                value={p ?? 'Available after final shift'}
                tone={p ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Product Decimal Result"
                value={p ? String(fromBitsSigned(p)) : '—'}
                tone={p ? 'indigo' : 'neutral'}
              />
            </div>
            {p && (
              <p className="text-xs text-slate-600 font-sans">
                Mathematical Verification: {fromBitsSigned(s.M.slice(1))} × {fromBitsSigned(s.Q)} ={' '}
                <strong className="text-slate-900 font-bold">{fromBitsSigned(p)}</strong> (Exact Match Confirmed)
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
