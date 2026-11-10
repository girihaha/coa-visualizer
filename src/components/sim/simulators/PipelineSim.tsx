import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import { STAGE_NAMES, buildPipeline, stageAt, type PipelineState } from '@/sims/logic/pipeline';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';
import { Code2, Cpu, FileText, GitBranch, Table as TableIcon } from 'lucide-react';

const PRESETS: { label: string; program: string }[] = [
  {
    label: 'RAW Data Hazard',
    program: 'ADD R1, R2, R3\nSUB R4, R1, R5\nAND R6, R1, R7\nOR R8, R4, R9',
  },
  {
    label: 'Independent Instructions',
    program: 'ADD R1, R2, R3\nSUB R4, R5, R6\nAND R7, R8, R9\nOR R10, R11, R12',
  },
  {
    label: 'Control Hazard (Branch)',
    program: 'ADD R1, R2, R3\nBR 5\nSUB R4, R5, R6\nAND R7, R8, R9\nOR R10, R1, R2',
  },
];

const PIPELINE_NODES: FlowNode[] = [
  { id: 'if', label: 'IF: Instruction Fetch',       x: 220, y: 30,  kind: 'process' },
  { id: 'id', label: 'ID: Decode & Reg Fetch',      x: 220, y: 105, kind: 'process' },
  { id: 'hazard', label: 'RAW Hazard Detected?',    x: 220, y: 180, kind: 'decision' },
  { id: 'fwd',  label: 'Bypass / Forward Available?', x: 470, y: 180, kind: 'decision' },
  { id: 'stall', label: 'Insert Pipeline Bubble Stall', x: 220, y: 260, kind: 'process' },
  { id: 'ex',   label: 'EX: ALU Execute / Compute',  x: 470, y: 260, kind: 'process' },
  { id: 'mem',  label: 'MEM: Memory Access (L/S)',  x: 470, y: 335, kind: 'process' },
  { id: 'wb',   label: 'WB: Write-Back to Register', x: 470, y: 410, kind: 'process' },
  { id: 'end',  label: 'Instruction Retired (CPI=1)', x: 470, y: 480, kind: 'terminal' },
];

const PIPELINE_EDGES: FlowEdge[] = [
  { from: 'if',     to: 'id' },
  { from: 'id',     to: 'hazard' },
  { from: 'hazard', to: 'fwd',     label: 'yes (RAW)' },
  { from: 'hazard', to: 'ex',      label: 'no hazard', via: [[100, 180], [100, 260], [350, 260]] },
  { from: 'fwd',    to: 'ex',      label: 'yes (Forward)' },
  { from: 'fwd',    to: 'stall',   label: 'no (Stall)' },
  { from: 'stall',  to: 'id',      via: [[80, 260], [80, 105]] },
  { from: 'ex',     to: 'mem' },
  { from: 'mem',    to: 'wb' },
  { from: 'wb',     to: 'end' },
];

function getPipelineFlowState(forwarding: boolean, hasStall: boolean) {
  if (hasStall) return { active: ['stall'], visited: ['if', 'id', 'hazard'] };
  if (forwarding) return { active: ['fwd', 'ex'], visited: ['if', 'id', 'hazard'] };
  return { active: ['ex', 'mem', 'wb'], visited: ['if', 'id'] };
}

const STAGE_CLS: Record<string, string> = {
  F: 'border-blue-300 bg-blue-50 text-blue-800 font-bold',
  D: 'border-indigo-300 bg-indigo-50 text-indigo-800 font-bold',
  E: 'border-violet-300 bg-violet-50 text-violet-800 font-bold',
  W: 'border-teal-300 bg-teal-50 text-teal-800 font-bold',
};

const PIPELINE_CPP_CODE = `// Pipeline Hazard Detection & Forwarding Simulator in C++
#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Instruction {
    string name;
    int dest;
    int src1;
    int src2;
};

int main() {
    // Instruction Stream with RAW dependency on R1
    vector<Instruction> prog = {
        {"ADD", 1, 2, 3},  // R1 = R2 + R3
        {"SUB", 4, 1, 5},  // R4 = R1 - R5 (RAW Hazard on R1)
        {"AND", 6, 1, 7}   // R6 = R1 & R7 (RAW Hazard on R1)
    };

    bool forwardingEnabled = true;
    cout << "=== PIPELINE SIMULATION (Forwarding: " << (forwardingEnabled ? "ON" : "OFF") << ") ===\\n";

    if (!forwardingEnabled) {
        cout << "Cycle 1: I1 Fetch\\nCycle 2: I1 Decode, I2 Fetch\\n";
        cout << "Cycle 3: I1 Execute, I2 STALL (RAW hazard on R1)\\n";
        cout << "Cycle 4: I1 Memory,  I2 STALL (Waiting for WB)\\n";
        cout << "Cycle 5: I1 WB,      I2 Decode\\nCycle 6: I2 Execute\\n";
        cout << "Total Cycles without Forwarding: 7 (CPI = 2.33)\\n";
    } else {
        cout << "Cycle 1: I1 Fetch\\nCycle 2: I1 Decode, I2 Fetch\\n";
        cout << "Cycle 3: I1 Execute, I2 Decode\\n";
        cout << "Cycle 4: I2 Execute (Bypass forwarded from I1 ALU output)\\n";
        cout << "Cycle 5: I2 Memory\\nCycle 6: I2 WB\\n";
        cout << "Total Cycles with Forwarding: 5 (CPI = 1.67, Speedup = 1.40x)\\n";
    }
    return 0;
}`;

export function PipelineSim() {
  const [program, setProgram] = useState(PRESETS[0].program);
  const [forwarding, setForwarding] = useState(false);
  const [missLine, setMissLine] = useState(0);
  const [missPenalty, setMissPenalty] = useState('2');
  const [activeTab, setActiveTab] = useState<'matrix' | 'flowchart' | 'code'>('matrix');

  const build = useMemo(
    () =>
      buildPipeline({
        program,
        forwarding,
        missLine,
        missPenalty: Number(missPenalty),
      }),
    [program, forwarding, missLine, missPenalty],
  );

  const lines = program.split('\n').filter((l) => l.trim());

  return (
    <SimLayout<PipelineState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="pl-preset" label="Workload Presets">
            <Segmented
              label="Preset"
              value={PRESETS.find((p) => p.program === program)?.label ?? ''}
              options={PRESETS.map((p) => ({ value: p.label, label: p.label }))}
              onChange={(v) => setProgram(PRESETS.find((p) => p.label === v)!.program)}
            />
          </Field>
          <Field
            id="pl-program"
            label="Assembly Instructions"
            hint="One per line: ADD R1, R2, R3 · SUB R4, R1, R5"
          >
            <textarea
              id="pl-program"
              rows={4}
              className={`${inputClass} resize-y leading-relaxed`}
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field id="pl-fwd" label="Hardware Operand Forwarding">
            <Segmented
              label="Operand forwarding"
              value={forwarding ? 'on' : 'off'}
              options={[
                { value: 'off', label: 'Off (Insert Stall Bubbles)' },
                { value: 'on',  label: 'On (Bypass Forwarding)' },
              ]}
              onChange={(v) => setForwarding(v === 'on')}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="pl-miss" label="Cache Miss Simulation">
              <select
                id="pl-miss"
                className={inputClass}
                value={missLine}
                onChange={(e) => setMissLine(Number(e.target.value))}
              >
                <option value={0}>None</option>
                {lines.map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Instruction {i + 1}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="pl-pen" label="Miss Stall Cycles">
              <input
                id="pl-pen"
                type="number"
                min={1}
                max={5}
                className={inputClass}
                value={missPenalty}
                onChange={(e) => setMissPenalty(e.target.value)}
              />
            </Field>
          </div>
        </>
      }
      assumptions={[
        'Classical 4-stage pipeline: Fetch (F), Decode (D), Execute (E), Write-back (W).',
        'RAW Data Hazard occurs when an instruction reads a register before a previous instruction writes to it.',
        'With forwarding, ALU output from EX stage is bypassed directly to EX inputs of the dependent instruction.',
      ]}
      visual={(step) => {
        const s = step.state;
        const totalCycles = Math.max(s.cycle + 3, 7);
        const hasStall = s.events.some((e) => e.kind === 'stall');

        return (
          <div className="flex flex-col gap-5">
            {/* Academic Tab Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('matrix')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'matrix'
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <TableIcon size={14} />
                  Space-Time Timing Matrix
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
                  Hazard Resolution Flowchart
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
                Cycle {s.cycle} · {forwarding ? 'Forwarding ON' : 'Forwarding OFF'}
              </span>
            </div>

            {/* TAB 1: TIMING MATRIX */}
            {activeTab === 'matrix' && (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <p className="academic-header !mb-0">Pipeline Reservation Table (Cycles C1..Cn)</p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 font-sans">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Fetch
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 font-sans">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Decode
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 font-sans">
                        <span className="h-2.5 w-2.5 rounded-full bg-violet-500"></span> Execute
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 font-sans">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span> Write
                      </span>
                    </div>
                  </div>

                  <table className="pipeline-table w-full">
                    <thead>
                      <tr>
                        <th className="w-48 text-left">Instruction</th>
                        {Array.from({ length: totalCycles }, (_, c) => (
                          <th
                            key={c}
                            className={`text-center ${c + 1 === s.cycle ? 'bg-indigo-100 text-indigo-900 font-bold' : ''}`}
                          >
                            C{c + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-800 border-r border-slate-200">
                            {line}
                          </td>
                          {Array.from({ length: totalCycles }, (_, c) => {
                            const cycleNo = c + 1;
                            const stage = stageAt(s, i, cycleNo);
                            const isCurrent = cycleNo === s.cycle;
                            return (
                              <td
                                key={c}
                                className={`border border-slate-100 transition-all ${
                                  isCurrent ? 'bg-indigo-50/40' : ''
                                }`}
                              >
                                {stage ? (
                                  <span
                                    className={`inline-flex h-7 w-8 items-center justify-center rounded border text-xs shadow-xs ${
                                      STAGE_CLS[stage] ?? 'border-slate-300 bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {stage}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">·</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: FLOWCHART */}
            {activeTab === 'flowchart' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">Pipeline Hazard Detection & Bypass Flowchart</p>
                  <span className="text-[11px] text-indigo-600 font-medium">Standard computer architecture control logic</span>
                </div>
                <div className="flex justify-center overflow-x-auto py-2">
                  <Flowchart
                    title="Pipeline Hazard Flowchart"
                    width={680}
                    height={540}
                    nodes={PIPELINE_NODES}
                    edges={PIPELINE_EDGES}
                    {...getPipelineFlowState(forwarding, hasStall)}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: C++ CODE */}
            {activeTab === 'code' && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="academic-header !mb-0">C++ Reference Implementation</p>
                  <span className="text-[11px] text-slate-500 font-mono">pipeline_simulator.cpp</span>
                </div>
                <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200">
                  {PIPELINE_CPP_CODE}
                </pre>
              </div>
            )}
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const total = lines.length;
        const stalls = s.events.filter((e) => e.kind === 'stall').length;
        const speedup = ((total * 4) / (4 + total - 1 + stalls)).toFixed(2);

        return (
          <div className="grid gap-3 sm:grid-cols-4">
            <ValueChip label="Elapsed Cycles" value={String(s.cycle)} tone="indigo" />
            <ValueChip label="Instructions" value={String(total)} />
            <ValueChip label="Total Stalls (Bubbles)" value={String(stalls)} tone={stalls > 0 ? 'amber' : 'neutral'} />
            <ValueChip label="Theoretical Speedup" value={`${speedup}x`} tone="cyan" />
          </div>
        );
      }}
    />
  );
}
