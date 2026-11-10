import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  PROGRAMS,
  buildDatapath,
  type DatapathProgram,
  type DatapathState,
} from '@/sims/logic/datapath';

function Unit({
  name,
  value,
  active,
  wide,
}: {
  name: string;
  value: string;
  active: boolean;
  wide?: boolean;
}) {
  return (
    <div
      aria-label={`${name}: ${value || 'empty'}${active ? ', active' : ''}`}
      className={`flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-all duration-300 ${
        active
          ? 'border-indigo-400 bg-indigo-50 shadow-sm ring-1 ring-indigo-200'
          : 'border-slate-200 bg-white'
      } ${wide ? 'col-span-2' : ''}`}
    >
      <span
        className={`font-mono text-xs font-bold ${active ? 'text-indigo-800' : 'text-slate-600'}`}
      >
        {name}
      </span>
      <span
        className={`truncate font-mono text-sm tabular-nums ${
          active ? 'text-indigo-950 font-semibold' : 'text-slate-700'
        }`}
      >
        {value || '—'}
      </span>
    </div>
  );
}

function Bus({ label, value }: { label: string; value: string }) {
  const live = value !== '';
  return (
    <div
      className="flex flex-col items-center gap-2"
      aria-label={`${label}: ${live ? value : 'idle'}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <div
        className={`relative w-4 flex-1 rounded-full transition-colors duration-300 ${
          live ? 'bg-indigo-300' : 'bg-slate-200'
        }`}
      >
        {live && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-indigo-300 bg-indigo-600 px-2 py-0.5 font-mono text-[11px] font-semibold text-white shadow-sm">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export function DatapathSim() {
  const [program, setProgram] = useState<DatapathProgram>('add-indirect');
  const [pc, setPc] = useState('100');
  const [r1, setR1] = useState('25');
  const [r3, setR3] = useState('200');
  const [operand, setOperand] = useState('17');
  const [offset, setOffset] = useState('40');
  const [r4, setR4] = useState('12');
  const [r5, setR5] = useState('30');
  const build = useMemo(
    () => buildDatapath({ program, pc, r1, r3, operand, offset, r4, r5 }),
    [program, pc, r1, r3, operand, offset, r4, r5],
  );
  const topology = PROGRAMS.find((p) => p.value === program)!.topology;

  return (
    <SimLayout<DatapathState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="dp-program" label="Instruction sequence">
            <Segmented
              label="Instruction"
              value={program}
              options={PROGRAMS.map((p) => ({ value: p.value, label: p.label }))}
              onChange={setProgram}
            />
          </Field>
          <Field id="dp-pc" label="Starting PC" hint="Byte address, multiple of 4.">
            <input
              id="dp-pc"
              className={inputClass}
              value={pc}
              onChange={(e) => setPc(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          {program === 'add-indirect' && (
            <>
              <Field id="dp-r1" label="R1 initial value">
                <input
                  id="dp-r1"
                  className={inputClass}
                  value={r1}
                  onChange={(e) => setR1(e.target.value)}
                  inputMode="numeric"
                />
              </Field>
              <Field id="dp-r3" label="R3 (pointer to operand in memory)">
                <input
                  id="dp-r3"
                  className={inputClass}
                  value={r3}
                  onChange={(e) => setR3(e.target.value)}
                  inputMode="numeric"
                />
              </Field>
              <Field id="dp-op" label="Memory word at address [R3]">
                <input
                  id="dp-op"
                  className={inputClass}
                  value={operand}
                  onChange={(e) => setOperand(e.target.value)}
                  inputMode="numeric"
                />
              </Field>
            </>
          )}
          {program === 'branch' && (
            <Field id="dp-off" label="Branch offset" hint="Added to the updated PC.">
              <input
                id="dp-off"
                className={inputClass}
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                inputMode="numeric"
              />
            </Field>
          )}
          {program === 'three-bus' && (
            <div className="grid grid-cols-2 gap-3">
              <Field id="dp-r4" label="R4">
                <input
                  id="dp-r4"
                  className={inputClass}
                  value={r4}
                  onChange={(e) => setR4(e.target.value)}
                  inputMode="numeric"
                />
              </Field>
              <Field id="dp-r5" label="R5">
                <input
                  id="dp-r5"
                  className={inputClass}
                  value={r5}
                  onChange={(e) => setR5(e.target.value)}
                  inputMode="numeric"
                />
              </Field>
            </div>
          )}
        </>
      }
      assumptions={[
        'Byte-addressed memory with 4-byte words, so PC advances by 4 on each instruction word.',
        'Each numbered step is one control step (clock period). WMFC holds the step until memory responds.',
        topology === 'single'
          ? 'Single internal bus: exactly one source may drive the bus per step.'
          : 'Three buses: Bus A and Bus B feed the ALU inputs; Bus C carries the ALU result.',
        'Control sequences follow the Unit 4 listing and are verified against the course slides.',
      ]}
      visual={(step) => {
        const s = step.state;
        const on = (n: string) => s.active.includes(n);
        const regs = Object.entries(s.regs);
        return (
          <div className="flex flex-col gap-6">
            {/* Control signals bar */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Active control signals this step
              </p>
              <div
                className="flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2"
                aria-label="Active control signals"
              >
                {s.signals.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No control signals asserted yet.</span>
                ) : (
                  s.signals.map((sig) => (
                    <span
                      key={sig}
                      className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700"
                    >
                      {sig}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Datapath connected diagram */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Connected Datapath ({topology === 'single' ? 'Single-bus organization' : 'Three-bus organization'})
              </p>
              <div
                className={`grid gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 ${
                  topology === 'single'
                    ? 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'
                    : 'grid-cols-[auto_auto_minmax(0,1fr)_auto]'
                }`}
              >
                {topology === 'single' ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Control &amp; Memory Interface</p>
                      <Unit name="PC" value={String(s.PC)} active={on('PC')} />
                      <Unit name="MAR" value={s.MAR === null ? '' : String(s.MAR)} active={on('MAR')} />
                      <Unit name="MDR" value={s.MDR} active={on('MDR')} />
                      <Unit name="IR" value={s.IR} active={on('IR')} />
                    </div>
                    <Bus label="Internal Bus" value={s.bus} />
                    <div className="flex flex-col gap-2">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Registers &amp; ALU</p>
                      {regs.map(([k, v]) => (
                        <Unit key={k} name={k} value={String(v)} active={on(k)} />
                      ))}
                      <Unit name="Y (Temp)" value={s.Y === null ? '' : String(s.Y)} active={on('Y')} />
                      <Unit
                        name="ALU"
                        value={
                          s.signals.includes('Add')
                            ? s.signals.includes('Select4')
                              ? '4 + bus'
                              : 'Y + bus'
                            : ''
                        }
                        active={on('ALU')}
                      />
                      <Unit name="Z (Out)" value={s.Z === null ? '' : String(s.Z)} active={on('Z')} />
                    </div>
                  </>
                ) : (
                  <>
                    <Bus label="Bus A" value={s.busA} />
                    <Bus label="Bus B" value={s.busB} />
                    <div className="flex flex-col gap-2">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Registers &amp; Units</p>
                      <Unit name="PC" value={String(s.PC)} active={on('PC')} />
                      <Unit name="MAR" value={s.MAR === null ? '' : String(s.MAR)} active={on('MAR')} />
                      <Unit name="MDR" value={s.MDR} active={on('MDR')} />
                      <Unit name="IR" value={s.IR} active={on('IR')} />
                      {regs.map(([k, v]) => (
                        <Unit key={k} name={k} value={String(v)} active={on(k)} />
                      ))}
                      <Unit
                        name="ALU"
                        value={
                          s.signals.includes('Add')
                            ? 'A + B'
                            : s.signals.includes('R=B')
                            ? 'R = B'
                            : ''
                        }
                        active={on('ALU')}
                      />
                    </div>
                    <Bus label="Bus C" value={s.busC} />
                  </>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-3 sm:grid-cols-3">
              <ValueChip
                label="Control step (clock period)"
                value={s.step === 0 ? 'Initial' : `Step T${s.step}`}
                tone="indigo"
              />
              <ValueChip
                label="Memory state"
                value={
                  s.waiting
                    ? 'Waiting (MFC)'
                    : on('Memory')
                    ? 'Read started'
                    : 'Idle'
                }
                tone={s.waiting ? 'amber' : 'neutral'}
              />
              <ValueChip
                label="Sequence status"
                value={s.signals.includes('End') ? 'Completed (End)' : 'In progress'}
              />
            </div>
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const done = s.signals.includes('End');
        const result =
          program === 'add-indirect'
            ? `R1 = ${s.regs.R1}`
            : program === 'branch'
            ? `PC = ${s.PC}`
            : `R6 = ${s.regs.R6}`;
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueChip
              label="Final outcome"
              value={done ? result : 'Shown when End is asserted'}
              tone={done ? 'indigo' : 'neutral'}
            />
            <ValueChip
              label="Total control steps"
              value={done ? `${s.step} steps` : '—'}
            />
          </div>
        );
      }}
    />
  );
}
