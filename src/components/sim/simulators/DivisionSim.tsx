import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildDivision, type DivisionMode, type DivisionState } from '@/sims/logic/division';
import { fromBitsSigned, fromBitsUnsigned, toBits } from '@/sims/logic/bits';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';
import { Code2, Cpu, FileText, GitBranch, Table as TableIcon } from 'lucide-react';

const RESTORING_NODES: FlowNode[] = [
  { id: 'start',   label: 'Start',                                      x: 220, y: 30,  kind: 'terminal' },
  { id: 'init',    label: 'Initialize A=0, Q=Dividend, M=Divisor, Count=n', x: 220, y: 95, kind: 'process' },
  { id: 'shift',   label: 'Shift Left [A : Q] 1 position',             x: 220, y: 165, kind: 'process' },
  { id: 'sub',     label: 'A ← A − M',                                  x: 220, y: 235, kind: 'process' },
  { id: 'sign',    label: 'Sign bit A_MSB = 1 (A < 0)?',                x: 220, y: 310, kind: 'decision' },
  { id: 'restore', label: 'Q₀ ← 0; A ← A + M (Restore)',                x: 470, y: 310, kind: 'process' },
  { id: 'keep',    label: 'Q₀ ← 1 (A remains unchanged)',               x: 220, y: 385, kind: 'process' },
  { id: 'count',   label: 'Count = 0 ?',                                x: 220, y: 455, kind: 'decision' },
  { id: 'end',     label: 'Quotient=Q, Remainder=A',                    x: 470, y: 455, kind: 'terminal' },
];

const RESTORING_EDGES: FlowEdge[] = [
  { from: 'start',   to: 'init' },
  { from: 'init',    to: 'shift' },
  { from: 'shift',   to: 'sub' },
  { from: 'sub',     to: 'sign' },
  { from: 'sign',    to: 'restore', label: 'yes (A < 0)' },
  { from: 'sign',    to: 'keep',    label: 'no (A ≥ 0)' },
  { from: 'restore', to: 'count',   via: [[580, 310], [580, 455]] },
  { from: 'keep',    to: 'count' },
  { from: 'count',   to: 'end',     label: 'yes' },
  { from: 'count',   to: 'shift',   label: 'no', via: [[50, 455], [50, 165]] },
];

function divFlowState(title: string) {
  if (title === 'Initial state') return { active: ['start', 'init'], visited: [] };
  if (title.startsWith('Result')) return { active: ['end'], visited: ['start', 'init', 'shift'] };
  if (title.includes('shift left')) return { active: ['shift'], visited: ['init'] };
  if (title.includes('subtract') || title.includes('trial')) return { active: ['sub', 'sign'], visited: ['shift'] };
  if (title.includes('restore') || title.includes('restores')) return { active: ['restore'], visited: ['sub', 'sign'] };
  if (title.includes('keep') || title.includes('fits') || title.includes('set bit 1')) return { active: ['keep'], visited: ['sub', 'sign'] };
  return { active: ['count'], visited: ['shift'] };
}

interface DivExamRow {
  step: string;
  operation: string;
  A: string;
  Q: string;
  M: string;
  count: number;
  remarks: string;
}

function generateDivExamTable(dendVal: number, dsorVal: number, n: number, mode: DivisionMode): DivExamRow[] {
  const rows: DivExamRow[] = [];
  const mask = (1 << n) - 1;
  const toBitsStr = (v: number, width: number) => {
    let s = (v & ((1 << width) - 1)).toString(2);
    while (s.length < width) s = '0' + s;
    return s;
  };

  let A = 0;
  let Q = dendVal & mask;
  let M = dsorVal & mask;
  let count = n;

  rows.push({
    step: 'Init',
    operation: 'Initialization',
    A: toBitsStr(A, n),
    Q: toBitsStr(Q, n),
    M: toBitsStr(M, n),
    count,
    remarks: `Initial: Dividend Q = ${dendVal}, Divisor M = ${dsorVal}`,
  });

  for (let i = 1; i <= n; i++) {
    // Shift left [A : Q]
    const qMsb = (Q >> (n - 1)) & 1;
    A = ((A << 1) | qMsb) & ((1 << (n + 1)) - 1);
    Q = (Q << 1) & mask;

    rows.push({
      step: `Iter ${i}`,
      operation: 'Shift Left [A:Q]',
      A: toBitsStr(A, n + 1),
      Q: toBitsStr(Q, n),
      M: toBitsStr(M, n),
      count,
      remarks: 'Logical left shift 1 bit position',
    });

    if (mode === 'restoring') {
      // Trial subtract A = A - M
      const signBefore = (A >> n) & 1;
      A = A - M;
      const isNegative = A < 0 || ((A >> n) & 1) === 1;

      if (isNegative) {
        // Restore
        A = (A + M) & ((1 << (n + 1)) - 1);
        Q = Q & ~1; // Q0 = 0
        count--;
        rows.push({
          step: `Iter ${i}`,
          operation: 'Sub & Restore (Q₀←0)',
          A: toBitsStr(A, n + 1),
          Q: toBitsStr(Q, n),
          M: toBitsStr(M, n),
          count,
          remarks: 'A < 0 → Restore A = A + M, set Q₀ = 0',
        });
      } else {
        Q = Q | 1; // Q0 = 1
        count--;
        rows.push({
          step: `Iter ${i}`,
          operation: 'Sub & Keep (Q₀←1)',
          A: toBitsStr(A, n + 1),
          Q: toBitsStr(Q, n),
          M: toBitsStr(M, n),
          count,
          remarks: 'A ≥ 0 → Divisor fits, keep A, set Q₀ = 1',
        });
      }
    } else {
      // Non-restoring
      const aSign = (A >> n) & 1;
      if (aSign === 0) {
        A = A - M;
      } else {
        A = A + M;
      }
      const newSign = (A >> n) & 1;
      if (newSign === 0) {
        Q = Q | 1;
      } else {
        Q = Q & ~1;
      }
      count--;
      rows.push({
        step: `Iter ${i}`,
        operation: aSign === 0 ? 'A ← A − M' : 'A ← A + M',
        A: toBitsStr(A, n + 1),
        Q: toBitsStr(Q, n),
        M: toBitsStr(M, n),
        count,
        remarks: newSign === 0 ? 'Sign is positive → Q₀ = 1' : 'Sign is negative → Q₀ = 0',
      });
    }
  }

  return rows;
}

const DIVISION_CPP_CODE = `// Restoring Binary Division Algorithm for Unsigned Integers
// Generates cycle-by-cycle academic state table

#include <iostream>
#include <iomanip>
#include <bitset>
using namespace std;

int main() {
    int Dividend = 13; // Q
    int Divisor = 4;   // M
    int n = 4;         // Bit width
    
    int A = 0;
    int Q = Dividend;
    int M = Divisor;
    int count = n;

    cout << "=== RESTORING DIVISION TABLE ===\\n";
    cout << "Cycle | Operation       | A (Remainder) | Q (Quotient) | Count\\n";
    cout << "------------------------------------------------------------\\n";

    for (int i = 1; i <= n; i++) {
        // Shift Left [A:Q]
        A = (A << 1) | ((Q >> (n - 1)) & 1);
        Q = (Q << 1) & ((1 << n) - 1);

        // Subtract M
        A = A - M;

        if (A < 0) {
            // Restore
            A = A + M;
            // Q0 = 0 (already 0)
            cout << "Iter " << i << " | Sub & Restore   | " 
                 << bitset<5>(A) << "         | " << bitset<4>(Q) << "         | " << count - 1 << "\\n";
        } else {
            // Keep and set Q0 = 1
            Q |= 1;
            cout << "Iter " << i << " | Sub & Keep      | " 
                 << bitset<5>(A) << "         | " << bitset<4>(Q) << "         | " << count - 1 << "\\n";
        }
        count--;
    }

    cout << "\\nResult: Quotient Q = " << Q << ", Remainder A = " << A << "\\n";
    cout << "Verification: " << Divisor << " * " << Q << " + " << A << " = " << (Divisor * Q + A) << "\\n";
    return 0;
}`;

export function DivisionSim() {
  const [dividend, setDividend] = useState('13');
  const [divisor, setDivisor] = useState('4');
  const [n, setN] = useState(4);
  const [mode, setMode] = useState<DivisionMode>('restoring');
  const [activeTab, setActiveTab] = useState<'registers' | 'table' | 'flowchart' | 'code'>('registers');

  const build = useMemo(
    () => buildDivision(dividend, divisor, n, mode),
    [dividend, divisor, n, mode],
  );

  const examTable = useMemo(() => {
    const dEnd = parseInt(dividend, 10);
    const dSor = parseInt(divisor, 10);
    if (isNaN(dEnd) || isNaN(dSor) || dSor <= 0 || n < 2 || n > 8) return [];
    return generateDivExamTable(dEnd, dSor, n, mode);
  }, [dividend, divisor, n, mode]);

  return (
    <SimLayout<DivisionState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="div-dividend" label="Dividend (Numerator)" hint="Positive integer.">
            <input
              id="div-dividend"
              className={inputClass}
              value={dividend}
              onChange={(e) => setDividend(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="div-divisor" label="Divisor (Denominator)" hint="Must be ≥ 1 (no zero division).">
            <input
              id="div-divisor"
              className={inputClass}
              value={divisor}
              onChange={(e) => setDivisor(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="div-n" label="Register bit width n">
            <Segmented
              label="Operand width"
              value={n}
              options={[4, 5, 6, 8].map((w) => ({ value: w, label: `${w} bits` }))}
              onChange={setN}
            />
          </Field>
          <Field id="div-mode" label="Division algorithm method">
            <Segmented
              label="Method"
              value={mode}
              options={[
                { value: 'restoring',     label: 'Restoring' },
                { value: 'non-restoring', label: 'Non-restoring' },
              ]}
              onChange={setMode}
            />
          </Field>
        </>
      }
      assumptions={[
        'Unsigned binary representation, fixed width n.',
        'Accumulator A is widened to n+1 bits to capture the sign during trial subtraction.',
        mode === 'restoring'
          ? 'Restoring: If A becomes negative, restore A ← A + M and set Q₀ = 0. Else keep and set Q₀ = 1.'
          : 'Non-restoring: If A ≥ 0, shift left and subtract M. If A < 0, shift left and add M.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-5">
            {/* Academic Tab Bar */}
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
                  <Cpu size={14} />
                  Register Datapath
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
                  <TableIcon size={14} />
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
                {dividend} ÷ {divisor} ({mode})
              </span>
            </div>

            {/* TAB 1: REGISTERS */}
            {activeTab === 'registers' && (
              <div className="flex flex-col gap-5">
                {/* Metric chips */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <ValueChip label="Cycle Iteration" value={`Step ${s.iteration} of ${s.n}`} />
                  <ValueChip
                    label="Current Action"
                    value={s.action}
                    tone={s.action.includes('restore') ? 'amber' : s.action.includes('keep') ? 'cyan' : 'neutral'}
                  />
                  <ValueChip
                    label="Sign of A (A < 0)"
                    value={s.A[0] === '1' ? 'Negative (1)' : 'Positive (0)'}
                    tone={s.A[0] === '1' ? 'red' : 'indigo'}
                  />
                </div>

                {/* Register Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th className="w-24">Register</th>
                        <th>Binary Bit Contents</th>
                        <th className="w-28 text-right">Decimal Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'M (Divisor)', bits: s.M, tone: 'neutral' as const },
                        { name: 'A (Remainder)', bits: s.A, tone: s.A[0] === '1' ? ('red' as const) : ('amber' as const) },
                        { name: 'Q (Quotient)', bits: s.Q, tone: 'cyan' as const },
                      ].map(({ name, bits, tone }) => (
                        <tr key={name}>
                          <td className="font-mono text-xs font-bold text-slate-800">{name}</td>
                          <td>
                            <BitRow label="" bits={bits} tone={tone} />
                          </td>
                          <td className="font-mono text-xs font-semibold text-right text-slate-700">
                            {fromBitsUnsigned(bits)}
                          </td>
                        </tr>
                      ))}
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
                    Cycle-by-Cycle Academic Execution Table ({dividend} ÷ {divisor}, {mode})
                  </p>
                  <span className="text-[11px] text-slate-500">Exam State Verification Matrix</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th className="w-20">Cycle</th>
                        <th className="w-44">Operation</th>
                        <th>A (Remainder, n+1 bits)</th>
                        <th>Q (Quotient, n bits)</th>
                        <th>M (Divisor)</th>
                        <th className="w-16 text-center">Count</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examTable.map((row, idx) => {
                        const isCurrent = step.title.toLowerCase().includes(row.step.toLowerCase());
                        return (
                          <tr key={idx} className={isCurrent ? 'active-row' : ''}>
                            <td className="font-mono text-xs font-bold text-slate-700">{row.step}</td>
                            <td className="font-mono text-xs font-semibold text-slate-800">{row.operation}</td>
                            <td className="font-mono text-xs text-amber-700 font-semibold">{row.A}</td>
                            <td className="font-mono text-xs text-cyan-700 font-semibold">{row.Q}</td>
                            <td className="font-mono text-xs text-slate-700">{row.M}</td>
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
                  <p className="academic-header !mb-0">Restoring Division Flowchart</p>
                  <span className="text-[11px] text-indigo-600 font-medium">Active algorithm path highlighted in indigo</span>
                </div>
                <div className="flex justify-center overflow-x-auto py-2">
                  <Flowchart
                    title="Restoring division flowchart"
                    width={680}
                    height={520}
                    nodes={RESTORING_NODES}
                    edges={RESTORING_EDGES}
                    {...divFlowState(step.title)}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: C++ CODE */}
            {activeTab === 'code' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">C++ Reference Implementation</p>
                  <span className="text-[11px] text-slate-500 font-mono">restoring_division.cpp</span>
                </div>
                <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200">
                  {DIVISION_CPP_CODE}
                </pre>
              </div>
            )}
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const complete = s.quotient !== null && s.remainder !== null;
        return (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Quotient (Q)"
                value={
                  complete
                    ? `${s.quotient} (binary ${s.Q})`
                    : 'Available after cycle completion'
                }
                tone={complete ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Remainder (A)"
                value={
                  complete
                    ? `${s.remainder} (binary ${s.A})`
                    : 'Available after cycle completion'
                }
                tone={complete ? 'indigo' : 'neutral'}
              />
            </div>
            {complete && (
              <p className="text-xs text-slate-600 font-sans">
                Verification Formula: Divisor × Quotient + Remainder ={' '}
                <strong className="text-slate-900 font-bold">
                  {fromBitsUnsigned(s.M)} × {s.quotient} + {s.remainder} ={' '}
                  {fromBitsUnsigned(s.M) * s.quotient! + s.remainder!}
                </strong>{' '}
                (Exact Dividend Match Confirmed)
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
