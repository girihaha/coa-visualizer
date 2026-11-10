import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  buildBinaryArith,
  type ArithMode,
  type BinaryArithState,
} from '@/sims/logic/binaryArith';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';
import { Code2, Cpu, FileText, GitBranch, Table as TableIcon } from 'lucide-react';

const MODES: { value: ArithMode; label: string }[] = [
  { value: 'sub-2s', label: "A − B (2's Complement Subtraction)" },
  { value: 'sub-1s', label: "A − B (1's Complement Subtraction)" },
  { value: 'add',    label: 'A + B (Standard Binary Addition)' },
];

const ARITH_NODES: FlowNode[] = [
  { id: 'start',      label: 'Start',                                    x: 220, y: 30,  kind: 'terminal' },
  { id: 'invert_b',   label: "Invert B: B' = NOT(B)",                    x: 220, y: 100, kind: 'process' },
  { id: 'add_one',    label: "2's Complement: B* = B' + 1",              x: 220, y: 175, kind: 'process' },
  { id: 'add_operands', label: 'Parallel Adder: S = A + B*',             x: 220, y: 250, kind: 'process' },
  { id: 'check_carry', label: 'End Carry C_out = 1 ?',                   x: 220, y: 325, kind: 'decision' },
  { id: 'discard',    label: "Discard C_out (Result is Positive)",       x: 470, y: 325, kind: 'process' },
  { id: 'negative',   label: "Re-complement (Result is Negative)",       x: 220, y: 400, kind: 'process' },
  { id: 'overflow',   label: 'Check Overflow: V = C_in ⊕ C_out',         x: 220, y: 475, kind: 'decision' },
  { id: 'end',        label: 'Output Result & Flags (Z,S,C,V)',          x: 470, y: 475, kind: 'terminal' },
];

const ARITH_EDGES: FlowEdge[] = [
  { from: 'start',        to: 'invert_b' },
  { from: 'invert_b',     to: 'add_one' },
  { from: 'add_one',      to: 'add_operands' },
  { from: 'add_operands', to: 'check_carry' },
  { from: 'check_carry',  to: 'discard',     label: 'yes (1)' },
  { from: 'check_carry',  to: 'negative',    label: 'no (0)' },
  { from: 'discard',      to: 'overflow',    via: [[580, 325], [580, 475], [300, 475]] },
  { from: 'negative',     to: 'overflow' },
  { from: 'overflow',     to: 'end' },
];

function arithFlowState(title: string) {
  if (title === 'Initial state') return { active: ['start'], visited: [] };
  if (title.startsWith('Result')) return { active: ['end'], visited: ['start', 'invert_b', 'add_one', 'add_operands', 'overflow'] };
  if (title.includes('complement')) return { active: ['invert_b', 'add_one'], visited: ['start'] };
  if (title.includes('add') || title.includes('sum')) return { active: ['add_operands'], visited: ['start', 'invert_b', 'add_one'] };
  if (title.includes('carry')) return { active: ['check_carry', 'discard'], visited: ['add_operands'] };
  return { active: ['overflow'], visited: ['add_operands'] };
}

const ARITH_CPP_CODE = `// Two's Complement Binary Subtraction & Flag Evaluation in C++
#include <iostream>
#include <bitset>
using namespace std;

int main() {
    int X = 45; // Minuend
    int Y = 27; // Subtrahend
    int n = 8;  // 8 bits

    // Convert to binary bitsets
    bitset<8> binX(X);
    bitset<8> binY(Y);

    // 1's complement of Y
    bitset<8> onesCompY = ~binY;

    // 2's complement of Y
    int twosCompY = onesCompY.to_ulong() + 1;
    bitset<8> binTwosY(twosCompY);

    // Hardware Addition: X + (-Y)
    int sum = X + (twosCompY & 0xFF);
    int carryOut = (sum >> 8) & 1;
    int result = sum & 0xFF;

    cout << "Minuend X:       " << binX << " (" << X << ")\\n";
    cout << "Subtrahend Y:    " << binY << " (" << Y << ")\\n";
    cout << "1's Comp of Y:   " << onesCompY << "\\n";
    cout << "2's Comp of Y:   " << binTwosY << " (-" << Y << ")\\n";
    cout << "Sum [X + (-Y)]:  " << bitset<8>(result) << " (" << result << ")\\n";
    cout << "End Carry:       " << carryOut << " (Discarded in 2's complement)\\n";
    cout << "Final Result:    " << result << " (Verification: " << X << " - " << Y << " = " << (X - Y) << ")\\n";

    // Flags
    bool Z = (result == 0);
    bool S = (result >> (n - 1)) & 1;
    bool V = ((X > 0 && -Y > 0 && result < 0) || (X < 0 && -Y < 0 && result > 0));
    cout << "Flags: Z=" << Z << " S=" << S << " C=" << carryOut << " V=" << V << "\\n";
    return 0;
}`;

export function BinaryArithSim() {
  const [a, setA] = useState('00101101'); // 45
  const [b, setB] = useState('00011011'); // 27
  const [mode, setMode] = useState<ArithMode>('sub-2s');
  const [activeTab, setActiveTab] = useState<'registers' | 'table' | 'flowchart' | 'code'>('registers');

  const width = Math.max(a.length, b.length, 5);
  const build = useMemo(() => buildBinaryArith(a, b, width, mode), [a, b, width, mode]);

  // Generate exam verification rows
  const examSteps = useMemo(() => {
    const aVal = parseInt(a, 2) || 0;
    const bVal = parseInt(b, 2) || 0;
    const bComp1 = b.split('').map((bit) => (bit === '1' ? '0' : '1')).join('');
    const bComp2Val = (parseInt(bComp1, 2) + 1) & ((1 << width) - 1);
    let bComp2 = bComp2Val.toString(2);
    while (bComp2.length < width) bComp2 = '0' + bComp2;

    const rawSum = aVal + (mode === 'add' ? bVal : bComp2Val);
    const endCarry = rawSum >> width;
    const finalVal = rawSum & ((1 << width) - 1);
    let finalBits = finalVal.toString(2);
    while (finalBits.length < width) finalBits = '0' + finalBits;

    return [
      { step: '1', item: 'Minuend Operand A', bits: a, dec: aVal, remarks: 'Base binary representation' },
      { step: '2', item: 'Subtrahend Operand B', bits: b, dec: bVal, remarks: 'Operand to be subtracted' },
      { step: '3', item: "1's Complement of B", bits: bComp1, dec: parseInt(bComp1, 2), remarks: 'Bitwise inversion of subtrahend' },
      { step: '4', item: "2's Complement of B (-B)", bits: bComp2, dec: -bVal, remarks: "Add 1 to 1's complement" },
      { step: '5', item: 'Parallel Addition [A + (-B)]', bits: finalBits, dec: rawSum, remarks: `Raw sum with Carry = ${endCarry}` },
      { step: '6', item: 'End-Around Carry Handling', bits: String(endCarry), dec: endCarry, remarks: "Carry = 1 indicates positive result, discarded in 2's complement" },
      { step: '7', item: 'Final Result Difference', bits: finalBits, dec: finalVal, remarks: `Verified: ${aVal} − ${bVal} = ${finalVal}` },
    ];
  }, [a, b, width, mode]);

  return (
    <SimLayout<BinaryArithState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="arith-a" label="Operand A (Minuend)" hint="Binary bits (e.g. 00101101 = 45).">
            <input
              id="arith-a"
              className={inputClass}
              value={a}
              onChange={(e) => setA(e.target.value.replace(/[^01]/g, ''))}
              maxLength={12}
            />
          </Field>
          <Field id="arith-b" label="Operand B (Subtrahend)" hint="Binary bits (e.g. 00011011 = 27).">
            <input
              id="arith-b"
              className={inputClass}
              value={b}
              onChange={(e) => setB(e.target.value.replace(/[^01]/g, ''))}
              maxLength={12}
            />
          </Field>
          <Field id="arith-mode" label="Arithmetic Operation Mode">
            <Segmented label="Operation" value={mode} options={MODES} onChange={setMode} />
          </Field>
        </>
      }
      assumptions={[
        "2's complement subtraction converts A − B into A + (-B) using an inverter and adding 1.",
        'End-around carry is discarded in 2s complement, but retained to detect positive result magnitude.',
        'Signed overflow (V flag) occurs when two operands of like signs produce a sum with opposite sign.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-5">
            {/* Academic Tabs */}
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
                  Column-Aligned ALU View
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
                  Exam Step Verification Table
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
                  Subtraction Flowchart
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
                A = {parseInt(a, 2) || 0} · B = {parseInt(b, 2) || 0}
              </span>
            </div>

            {/* TAB 1: REGISTERS */}
            {activeTab === 'registers' && (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5">
                  <p className="academic-header">ALU Bitwise Column Alignment</p>
                  <div className="flex flex-col gap-3.5">
                    <BitRow label="Minuend A" bits={s.A} />
                    <BitRow
                      label={mode === 'add' ? 'Addend B' : "Subtrahend B (Complemented)"}
                      bits={s.Bc}
                      tone="indigo"
                    />
                    <div className="border-t-2 border-slate-300 pt-3">
                      <BitRow label="Accumulator Sum Output" bits={s.sum} tone="amber" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXAM TABLE */}
            {activeTab === 'table' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="academic-header !mb-0">
                    2's Complement Subtraction Step-by-Step Table (Exam Solution Format)
                  </p>
                  <span className="text-[11px] text-slate-500">Academic Verification Sheet</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th className="w-16">Step</th>
                        <th className="w-56">Mathematical Operation</th>
                        <th>Binary Bit Representation</th>
                        <th className="w-24 text-right">Value</th>
                        <th>Academic Examination Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examSteps.map((row) => (
                        <tr key={row.step}>
                          <td className="font-mono text-xs font-bold text-slate-700">{row.step}</td>
                          <td className="font-sans text-xs font-semibold text-slate-800">{row.item}</td>
                          <td className="font-mono text-xs text-indigo-700 font-bold">{row.bits}</td>
                          <td className="font-mono text-xs text-right text-slate-700 font-semibold">{row.dec}</td>
                          <td className="text-xs text-slate-600 font-sans">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: FLOWCHART */}
            {activeTab === 'flowchart' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">2's Complement Subtraction Algorithm Flowchart</p>
                  <span className="text-[11px] text-indigo-600 font-medium">Standard university logic diagram</span>
                </div>
                <div className="flex justify-center overflow-x-auto py-2">
                  <Flowchart
                    title="2's Complement Subtraction Flowchart"
                    width={680}
                    height={550}
                    nodes={ARITH_NODES}
                    edges={ARITH_EDGES}
                    {...arithFlowState(step.title)}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: C++ CODE */}
            {activeTab === 'code' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">C++ Reference Implementation</p>
                  <span className="text-[11px] text-slate-500 font-mono">twos_complement_subtraction.cpp</span>
                </div>
                <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200">
                  {ARITH_CPP_CODE}
                </pre>
              </div>
            )}
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        return (
          <div className="grid gap-3 sm:grid-cols-4">
            <ValueChip
              label="Final Arithmetic Result"
              value={s.result ?? 'Pending completion'}
              tone={s.result ? 'indigo' : 'neutral'}
            />
            <ValueChip
              label="Carry-Out (C Flag)"
              value={s.carryOut === null ? '—' : String(s.carryOut)}
              tone={s.carryOut === 1 ? 'cyan' : 'neutral'}
            />
            <ValueChip
              label="Signed Overflow (V Flag)"
              value={s.overflow === null ? '—' : s.overflow ? 'YES (V=1)' : 'No (V=0)'}
              tone={s.overflow ? 'red' : 'neutral'}
            />
            <ValueChip
              label="Zero Flag (Z Flag)"
              value={s.result && parseInt(s.result, 2) === 0 ? '1 (Zero)' : '0 (Non-Zero)'}
            />
          </div>
        );
      }}
    />
  );
}
