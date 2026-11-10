import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  BUFFER_START,
  DATA_ADDRESS,
  STATUS_ADDRESS,
  buildPolling,
  type IoMapping,
  type PollingState,
} from '@/sims/logic/polling';

const hex = (n: number) => `0x${n.toString(16).toUpperCase()}`;

const LOOP = [
  { id: 'poll',  label: 'READ: Read status register (SIN)' },
  { id: 'test',  label: 'Branch back to READ if SIN == 0' },
  { id: 'read',  label: 'Read DATAIN register into R0' },
  { id: 'store', label: 'Store R0 into buffer in memory' },
] as const;

export function PollingSim() {
  const [text, setText] = useState('COA');
  const [delay, setDelay] = useState(2);
  const [mapping, setMapping] = useState<IoMapping>('memory-mapped');
  const build = useMemo(() => buildPolling({ text, delay, mapping }), [text, delay, mapping]);

  return (
    <SimLayout<PollingState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="io-map" label="I/O addressing architecture">
            <Segmented
              label="I/O addressing"
              value={mapping}
              options={[
                { value: 'memory-mapped', label: 'Memory-mapped I/O' },
                { value: 'io-mapped',     label: 'I/O-mapped (Isolated)' },
              ]}
              onChange={setMapping}
            />
          </Field>
          <Field
            id="io-text"
            label="Device input characters"
            hint="1 to 6 characters simulated from keyboard or serial line."
          >
            <input
              id="io-text"
              className={inputClass}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={6}
              spellCheck={false}
            />
          </Field>
          <Field
            id="io-delay"
            label="Device readiness delay"
            hint="Failed polling cycles before character arrives in DATAIN."
          >
            <Segmented
              label="Device delay"
              value={delay}
              options={[0, 1, 2, 3, 4].map((n) => ({ value: n, label: `${n} cycles` }))}
              onChange={setDelay}
            />
          </Field>
        </>
      }
      assumptions={[
        'Program-controlled I/O: The CPU polls the SIN (input ready) status flag repeatedly in a loop.',
        'Reading the data register automatically clears SIN back to 0.',
        'Memory-mapped: I/O registers share the memory address space and use regular load/store instructions.',
        'I/O-mapped: I/O devices reside in an independent port space accessed via specialized IN/OUT instructions.',
      ]}
      visual={(step) => {
        const s = step.state;
        const mm = s.mapping === 'memory-mapped';
        return (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Address space model */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
                  {mm ? 'Unified Address Space (Memory-Mapped)' : 'Dual Address Spaces (Isolated I/O)'}
                </p>
                <div className="mt-3 flex flex-col gap-2 font-mono text-xs">
                  <div
                    className={`rounded-lg border px-3 py-2 transition-colors ${
                      s.pc === 'store'
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    RAM {hex(BUFFER_START)}… (Buffer)
                  </div>
                  {mm ? (
                    <>
                      <div
                        className={`rounded-lg border px-3 py-2 transition-colors ${
                          s.pc === 'read'
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-bold shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        RAM {hex(DATA_ADDRESS)} DATAIN (Device)
                      </div>
                      <div
                        className={`rounded-lg border px-3 py-2 transition-colors ${
                          s.pc === 'poll'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 font-bold shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        RAM {hex(STATUS_ADDRESS)} STATUS (Device SIN)
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 border-t border-dashed border-slate-300 pt-3">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-slate-400">
                        Separate I/O Port Space (IN / OUT instructions)
                      </p>
                      <div
                        className={`mb-2 rounded-lg border px-3 py-2 transition-colors ${
                          s.pc === 'read'
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-bold shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        Port DATA_PORT (IN instruction)
                      </div>
                      <div
                        className={`rounded-lg border px-3 py-2 transition-colors ${
                          s.pc === 'poll'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 font-bold shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        Port STATUS_PORT (IN instruction)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Polling loop sequence */}
              <ol
                className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-4"
                aria-label="Polling loop"
              >
                <li className="mb-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                  Instruction Loop Sequence
                </li>
                {LOOP.map((l) => (
                  <li
                    key={l.id}
                    aria-current={s.pc === l.id ? 'step' : undefined}
                    className={`rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
                      s.pc === l.id
                        ? 'border-indigo-400 bg-indigo-50 font-bold text-indigo-800 shadow-sm'
                        : 'border-transparent text-slate-600'
                    }`}
                  >
                    {l.label}
                    {s.pc === l.id && (
                      <span className="ml-2 font-sans text-[10px] text-indigo-600 font-normal">
                        ← current
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Status indicators */}
            <div className="grid gap-3 sm:grid-cols-4">
              <ValueChip
                label="SIN Status Flag"
                value={s.sin ? '1 (Ready)' : '0 (Busy)'}
                tone={s.sin ? 'indigo' : 'neutral'}
              />
              <ValueChip label="R0 Data Register" value={s.R0 ? `"${s.R0}"` : '—'} />
              <ValueChip label="Total Status Reads" value={String(s.statusReads)} tone="indigo" />
              <ValueChip
                label="Bus Routing"
                value={
                  s.bus === 'address'
                    ? 'Memory address bus'
                    : s.bus === 'io'
                    ? 'Dedicated I/O bus'
                    : 'Idle'
                }
              />
            </div>

            {/* Memory buffer display */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Received characters in memory buffer
              </p>
              <div className="flex flex-wrap gap-2">
                {s.chars.map((_, i) => (
                  <div
                    key={i}
                    className={`flex w-16 flex-col items-center rounded-lg border py-2 ${
                      s.buffer[i]
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-800 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-400">
                      {hex(BUFFER_START + i)}
                    </span>
                    <span className="font-mono text-base font-bold">
                      {s.buffer[i] ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }}
      output={(step) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <ValueChip
            label="Received string"
            value={step.state.buffer.join('') || '—'}
            tone="indigo"
          />
          <ValueChip
            label="Characters transferred"
            value={`${step.state.buffer.length} of ${step.state.chars.length}`}
          />
          <ValueChip
            label="Wasted polling cycles"
            value={String(
              Math.max(
                0,
                step.state.statusReads -
                  step.state.buffer.length -
                  (step.state.pc === 'poll' || step.state.pc === 'test' ? 1 : 0),
              ),
            )}
            tone="amber"
          />
        </div>
      )}
    />
  );
}
