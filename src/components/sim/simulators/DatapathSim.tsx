import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  PROGRAMS,
  buildDatapath,
  type DatapathProgram,
  type DatapathState,
} from '@/sims/logic/datapath';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';
import { Code2, Cpu, FileText, GitBranch, Table as TableIcon } from 'lucide-react';

const FETCH_NODES: FlowNode[] = [
  { id: 'start', label: 'Start Fetch Cycle',              x: 220, y: 30,  kind: 'terminal' },
  { id: 't1',    label: 'T1: MAR ← PC',                   x: 220, y: 105, kind: 'process' },
  { id: 't2_mem', label: 'T2: Assert Address Bus & READ', x: 220, y: 180, kind: 'process' },
  { id: 't2_pc',  label: 'T2: PC ← PC + 1',               x: 470, y: 180, kind: 'process' },
  { id: 't2_mdr', label: 'T2: MDR ← Memory[MAR]',         x: 220, y: 255, kind: 'process' },
  { id: 't3',    label: 'T3: IR ← MDR (Transfer Opcode)', x: 220, y: 330, kind: 'process' },
  { id: 'decode', label: 'Decode Opcode & Addressing Mode', x: 220, y: 405, kind: 'process' },
  { id: 'end',   label: 'Execute Micro-operation Phase',  x: 220, y: 475, kind: 'terminal' },
];

const FETCH_EDGES: FlowEdge[] = [
  { from: 'start',   to: 't1' },
  { from: 't1',      to: 't2_mem' },
  { from: 't2_mem',  to: 't2_pc' },
  { from: 't2_pc',   to: 't2_mdr' },
  { from: 't2_mdr',  to: 't3' },
  { from: 't3',      to: 'decode' },
  { from: 'decode',  to: 'end' },
];

function getFetchFlowState(title: string) {
  if (title.includes('T1') || title.includes('PC') && title.includes('MAR')) return { active: ['t1'], visited: ['start'] };
  if (title.includes('T2') || title.includes('Memory') || title.includes('MDR')) return { active: ['t2_mem', 't2_pc', 't2_mdr'], visited: ['start', 't1'] };
  if (title.includes('T3') || title.includes('IR')) return { active: ['t3'], visited: ['start', 't1', 't2_mem', 't2_mdr'] };
  if (title.includes('Decode') || title.includes('Execute')) return { active: ['decode', 'end'], visited: ['start', 't1', 't2_mdr', 't3'] };
  return { active: ['start'], visited: [] };
}

const DATAPATH_CPP_CODE = `// CPU Instruction Fetch & Bus Micro-operation Simulator in C++
#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

struct CPU {
    uint16_t PC = 0x1000;
    uint16_t MAR = 0;
    uint16_t MDR = 0;
    uint16_t IR = 0;
    uint16_t R1 = 25;
    uint16_t RAM[0x2000] = {0};
};

int main() {
    CPU cpu;
    cpu.RAM[0x1000] = 0x2A05; // Sample Opcode: LOAD R1, [0x05]

    cout << "=== INSTRUCTION FETCH CYCLE MICRO-OPERATIONS ===\\n";
    cout << "Initial: PC = 0x" << hex << cpu.PC << "\\n\\n";

    // Clock Cycle T1
    cpu.MAR = cpu.PC;
    cout << "T1: MAR <- PC (Internal Bus Transfer)\\n";
    cout << "    MAR = 0x" << hex << cpu.MAR << "\\n\\n";

    // Clock Cycle T2
    cout << "T2: External Bus Read & PC Increment\\n";
    cout << "    [Address Bus] = 0x" << hex << cpu.MAR << "\\n";
    cout << "    [Control Bus] = MEM_READ Active\\n";
    cpu.MDR = cpu.RAM[cpu.MAR];
    cpu.PC = cpu.PC + 1;
    cout << "    [Data Bus]    = 0x" << hex << cpu.MDR << "\\n";
    cout << "    MDR = 0x" << cpu.MDR << ", PC = 0x" << cpu.PC << "\\n\\n";

    // Clock Cycle T3
    cpu.IR = cpu.MDR;
    cout << "T3: IR <- MDR (Transfer to Instruction Register)\\n";
    cout << "    IR = 0x" << hex << cpu.IR << " (Decoded & Ready for Execution)\\n";

    return 0;
}`;

export function DatapathSim() {
  const [program, setProgram] = useState<DatapathProgram>('add-indirect');
  const [pc, setPc] = useState('100');
  const [r1, setR1] = useState('25');
  const [r3, setR3] = useState('200');
  const [operand, setOperand] = useState('17');
  const [offset, setOffset] = useState('40');
  const [r4, setR4] = useState('12');
  const [r5, setR5] = useState('30');
  const [activeTab, setActiveTab] = useState<'datapath' | 'table' | 'flowchart' | 'code'>('datapath');

  const build = useMemo(
    () => buildDatapath({ program, pc, r1, r3, operand, offset, r4, r5 }),
    [program, pc, r1, r3, operand, offset, r4, r5],
  );

  const selectedProg = PROGRAMS.find((p) => p.value === program)!;

  // Academic micro-operation sequence table
  const microOpTable = [
    { timing: 'T1', transfer: 'MAR ← PC', bus: 'Internal CPU Bus', control: 'PC_out, MAR_in', meaning: 'Assert Program Counter onto internal bus to latch address in MAR' },
    { timing: 'T2', transfer: 'MDR ← Memory[MAR]', bus: 'External Address & Data Bus', control: 'MEM_READ, MDR_in', meaning: 'Drive MAR on Address Bus, assert MEMR, latch data from Data Bus into MDR' },
    { timing: 'T2 (Concurrent)', transfer: 'PC ← PC + 1', bus: 'Dedicated ALU / Incrementer', control: 'PC_inc', meaning: 'Advance Program Counter to next instruction address' },
    { timing: 'T3', transfer: 'IR ← MDR', bus: 'Internal CPU Bus', control: 'MDR_out, IR_in', meaning: 'Transfer fetched opcode from MDR into IR for instruction decoding' },
    { timing: 'T4+', transfer: selectedProg.label, bus: 'Internal Datapath / ALU', control: 'ALU_OP, Reg_Write', meaning: 'Decode instruction and execute specific micro-operations' },
  ];

  return (
    <SimLayout<DatapathState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="dp-program" label="Instruction Sequence">
            <Segmented
              label="Instruction"
              value={program}
              options={PROGRAMS.map((p) => ({ value: p.value, label: p.label }))}
              onChange={setProgram}
            />
          </Field>
          <Field id="dp-pc" label="Program Counter (PC)">
            <input
              id="dp-pc"
              className={inputClass}
              value={pc}
              onChange={(e) => setPc(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="dp-r1" label="Register R1">
            <input
              id="dp-r1"
              className={inputClass}
              value={r1}
              onChange={(e) => setR1(e.target.value)}
              inputMode="numeric"
            />
          </Field>
        </>
      }
      assumptions={[
        'Single-bus CPU architecture with dedicated Memory Address (MAR) and Memory Data (MDR) isolation registers.',
        'Address Bus is unidirectional (CPU → Memory). Data Bus is bidirectional.',
        'Control Unit generates synchronized control signals on clock timing edges T1, T2, T3.',
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
                  onClick={() => setActiveTab('datapath')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'datapath'
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Cpu size={14} />
                  Connected Architecture Diagram
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
                  Micro-Operation Timing Table
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
                  Fetch Cycle Flowchart
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
                {selectedProg.label}
              </span>
            </div>

            {/* TAB 1: CONNECTED ARCHITECTURE DIAGRAM */}
            {activeTab === 'datapath' && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                    <p className="academic-header !mb-0">CPU Register Datapath &amp; System Bus Architecture</p>
                    <span className="text-[11px] text-indigo-600 font-medium">Active units and buses illuminated dynamically</span>
                  </div>

                  {/* Architecture Diagram Units */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className={`p-3.5 rounded-lg border transition-all ${s.activeUnits.includes('PC') ? 'border-indigo-400 bg-indigo-50/90 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-sans">PC (Program Counter)</p>
                      <p className="font-mono text-base font-bold text-slate-800 mt-1">{s.registers.PC ?? '—'}</p>
                    </div>
                    <div className={`p-3.5 rounded-lg border transition-all ${s.activeUnits.includes('MAR') ? 'border-indigo-400 bg-indigo-50/90 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-sans">MAR (Memory Address Reg)</p>
                      <p className="font-mono text-base font-bold text-slate-800 mt-1">{s.registers.MAR ?? '—'}</p>
                    </div>
                    <div className={`p-3.5 rounded-lg border transition-all ${s.activeUnits.includes('MDR') ? 'border-indigo-400 bg-indigo-50/90 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-sans">MDR (Memory Data Reg)</p>
                      <p className="font-mono text-base font-bold text-slate-800 mt-1">{s.registers.MDR ?? '—'}</p>
                    </div>
                    <div className={`p-3.5 rounded-lg border transition-all ${s.activeUnits.includes('IR') ? 'border-indigo-400 bg-indigo-50/90 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-sans">IR (Instruction Reg)</p>
                      <p className="font-mono text-base font-bold text-slate-800 mt-1">{s.registers.IR ?? '—'}</p>
                    </div>
                  </div>

                  {/* System Buses */}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-slate-100 pt-4">
                    <div className={`p-3 rounded-lg border ${s.bus.address ? 'border-indigo-300 bg-indigo-50/80' : 'border-slate-200 bg-white'}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-sans">Address Bus (Unidirectional)</p>
                      <p className="font-mono text-xs font-bold text-indigo-900 mt-0.5">{s.bus.address || 'Idle (High-Z)'}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${s.bus.data ? 'border-cyan-300 bg-cyan-50/80' : 'border-slate-200 bg-white'}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-sans">Data Bus (Bidirectional)</p>
                      <p className="font-mono text-xs font-bold text-cyan-900 mt-0.5">{s.bus.data || 'Idle (High-Z)'}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${s.bus.control ? 'border-amber-300 bg-amber-50/80' : 'border-slate-200 bg-white'}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-sans">Control Bus (Signaling)</p>
                      <p className="font-mono text-xs font-bold text-amber-900 mt-0.5">{s.bus.control || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MICRO-OPERATION TIMING TABLE */}
            {activeTab === 'table' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="academic-header !mb-0">Cycle-by-Cycle Bus Transfer &amp; Micro-Operation Table</p>
                  <span className="text-[11px] text-slate-500">Standard Exam Reference Table</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th className="w-20">Timing</th>
                        <th className="w-48">Micro-Operation Transfer</th>
                        <th className="w-48">Active Bus Pathway</th>
                        <th className="w-40">Control Signals Asserted</th>
                        <th>Engineering Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {microOpTable.map((row, idx) => {
                        const isCurrent = step.title.includes(row.timing);
                        return (
                          <tr key={idx} className={isCurrent ? 'active-row' : ''}>
                            <td className="font-mono text-xs font-bold text-slate-700">{row.timing}</td>
                            <td className="font-mono text-xs font-semibold text-indigo-700">{row.transfer}</td>
                            <td className="font-sans text-xs text-slate-700">{row.bus}</td>
                            <td className="font-mono text-xs text-amber-700">{row.control}</td>
                            <td className="text-xs text-slate-600 font-sans">{row.meaning}</td>
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
                  <p className="academic-header !mb-0">Instruction Fetch Cycle Flowchart</p>
                  <span className="text-[11px] text-indigo-600 font-medium">Standard university control flow</span>
                </div>
                <div className="flex justify-center overflow-x-auto py-2">
                  <Flowchart
                    title="Instruction Fetch Flowchart"
                    width={680}
                    height={540}
                    nodes={FETCH_NODES}
                    edges={FETCH_EDGES}
                    {...getFetchFlowState(step.title)}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: C++ CODE */}
            {activeTab === 'code' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">C++ Reference Implementation</p>
                  <span className="text-[11px] text-slate-500 font-mono">datapath_fetch_cycle.cpp</span>
                </div>
                <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200">
                  {DATAPATH_CPP_CODE}
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
            <ValueChip label="Program Counter (PC)" value={s.registers.PC ?? '—'} tone="indigo" />
            <ValueChip label="Instruction Register (IR)" value={s.registers.IR ?? '—'} tone="cyan" />
            <ValueChip label="Register R1" value={s.registers.R1 ?? '—'} />
            <ValueChip label="Memory Read Value" value={s.registers.MDR ?? '—'} />
          </div>
        );
      }}
    />
  );
}
