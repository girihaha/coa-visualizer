import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  DATA_END,
  DATA_START,
  MODES,
  buildAddressing,
  type AddressingMode,
  type AddressingState,
} from '@/sims/logic/addressing';

const STAGES: { id: AddressingState['stage']; label: string }[] = [
  { id: 'fetch',   label: 'Fetch' },
  { id: 'decode',  label: 'Decode' },
  { id: 'address', label: 'Address' },
  { id: 'operand', label: 'Operand' },
  { id: 'execute', label: 'Execute' },
  { id: 'write',   label: 'Write' },
];

const DEFAULT_X: Partial<Record<AddressingMode, string>> = {
  immediate: '7',
  direct:    '17',
  indirect:  '20',
  indexed:   '16',
  relative:  '15',
};

const USES_X: AddressingMode[] = ['immediate', 'direct', 'indirect', 'indexed', 'relative'];

export function AddressingSim() {
  const [mode, setMode] = useState<AddressingMode>('indexed');
  const [x, setX] = useState('16');
  const [r0, setR0] = useState('10');
  const [r1, setR1] = useState('20');
  const [r2, setR2] = useState('4');
  const build = useMemo(
    () => buildAddressing({ mode, x, r0, r1, r2 }),
    [mode, x, r0, r1, r2],
  );
  const modeInfo = MODES.find((m) => m.value === mode)!;

  return (
    <SimLayout<AddressingState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="am-mode" label="Addressing mode" hint={`Formula: ${modeInfo.ea}`}>
            <select
              id="am-mode"
              className={inputClass}
              value={mode}
              onChange={(e) => {
                const next = e.target.value as AddressingMode;
                setMode(next);
                setX(DEFAULT_X[next] ?? x);
              }}
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label} ({m.ea})
                </option>
              ))}
            </select>
          </Field>
          {USES_X.includes(mode) && (
            <Field
              id="am-x"
              label="Address field X"
              hint={
                mode === 'immediate'
                  ? 'Literal constant in the instruction.'
                  : 'Address or offset value in the instruction.'
              }
            >
              <input
                id="am-x"
                className={inputClass}
                value={x}
                onChange={(e) => setX(e.target.value)}
                inputMode="numeric"
              />
            </Field>
          )}
          <Field id="am-r0" label="R0 (accumulator / destination)">
            <input
              id="am-r0"
              className={inputClass}
              value={r0}
              onChange={(e) => setR0(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="am-r1" label="R1 (base / pointer register)">
              <input
                id="am-r1"
                className={inputClass}
                value={r1}
                onChange={(e) => setR1(e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field id="am-r2" label="R2 (index register)">
              <input
                id="am-r2"
                className={inputClass}
                value={r2}
                onChange={(e) => setR2(e.target.value)}
                inputMode="numeric"
              />
            </Field>
          </div>
        </>
      }
      assumptions={[
        'Teaching model: Word-addressed memory; PC advances by 1 per instruction.',
        `The instruction is located at address 4; data memory spans addresses ${DATA_START} to ${DATA_END}.`,
        'Operation executed: ADD R0, source (effective: R0 ← [R0] + source operand).',
        'Effective Address (EA) resolution follows standard course conventions.',
      ]}
      visual={(step) => {
        const s = step.state;
        const stageIdx = STAGES.findIndex((x) => x.id === s.stage);
        return (
          <div className="flex flex-col gap-6">
            {/* Instruction cycle stage indicator */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Instruction cycle progress
              </p>
              <ol
                className="grid grid-cols-3 gap-1.5 sm:grid-cols-6"
                aria-label="Instruction cycle stage"
              >
                {STAGES.map((st, i) => (
                  <li
                    key={st.id}
                    aria-current={i === stageIdx ? 'step' : undefined}
                    className={`rounded border px-2.5 py-1.5 text-center font-mono text-xs uppercase tracking-wide transition-colors ${
                      i === stageIdx
                        ? 'border-indigo-400 bg-indigo-50 font-bold text-indigo-700 shadow-sm'
                        : i < stageIdx
                        ? 'border-slate-200 bg-slate-50 text-slate-600'
                        : 'border-slate-100 bg-white text-slate-300'
                    }`}
                  >
                    {st.label}
                  </li>
                ))}
              </ol>
            </div>

            {/* Instruction register display */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                Instruction Register (IR)
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-slate-900">
                {s.IR || <span className="text-slate-400 font-normal italic">empty</span>}
              </p>
            </div>

            {/* Register bank */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Processor registers &amp; status
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ValueChip
                  label="PC"
                  value={String(s.PC)}
                  tone={step.changed.includes('PC') ? 'amber' : 'neutral'}
                />
                <ValueChip
                  label="R0"
                  value={String(s.R0)}
                  tone={step.changed.includes('R0') ? 'amber' : 'neutral'}
                />
                <ValueChip
                  label="R1 (pointer)"
                  value={String(s.R1)}
                  tone={step.changed.includes('R1') ? 'amber' : 'neutral'}
                />
                <ValueChip label="R2 (index)" value={String(s.R2)} />
                <ValueChip
                  label="Effective Address (EA)"
                  value={s.ea === null ? '—' : String(s.ea)}
                  tone={s.ea === null ? 'neutral' : 'indigo'}
                />
                <ValueChip
                  label="Operand value"
                  value={s.operand === null ? '—' : String(s.operand)}
                  tone={s.operand === null ? 'neutral' : 'indigo'}
                />
                <ValueChip label="Zero Flag (Z)" value={String(s.flags.Z)} />
                <ValueChip label="Negative Flag (N)" value={String(s.flags.N)} />
              </div>
            </div>

            {/* Data memory grid */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Data memory ({DATA_START}–{DATA_END})
              </p>
              <div
                className="grid grid-cols-4 gap-1.5 sm:grid-cols-8"
                role="list"
                aria-label="Data memory words"
              >
                {Array.from(
                  { length: DATA_END - DATA_START + 1 },
                  (_, i) => DATA_START + i,
                ).map((addr) => {
                  const isEa = s.ea === addr;
                  const isPointer = s.path.includes(addr) && !isEa;
                  return (
                    <div
                      key={addr}
                      role="listitem"
                      aria-label={`Address ${addr}: ${s.memory[addr]}${
                        isEa ? ', effective address' : ''
                      }${isPointer ? ', pointer read' : ''}`}
                      className={`rounded border px-2 py-1.5 transition-colors ${
                        isEa
                          ? 'border-indigo-400 bg-indigo-50 font-bold shadow-sm'
                          : isPointer
                          ? 'border-amber-300 bg-amber-50 font-semibold'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <p className="font-mono text-[10px] text-slate-400">addr {addr}</p>
                      <p
                        className={`font-mono text-sm tabular-nums ${
                          isEa ? 'text-indigo-800' : isPointer ? 'text-amber-800' : 'text-slate-700'
                        }`}
                      >
                        {s.memory[addr]}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2.5 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded border border-indigo-400 bg-indigo-100" />
                  Effective address (EA)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded border border-amber-300 bg-amber-100" />
                  Pointer read (indirect address)
                </span>
              </p>
            </div>
          </div>
        );
      }}
      output={(step) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <ValueChip label="Addressing mode" value={modeInfo.label} tone="indigo" />
          <ValueChip label="EA derivation rule" value={modeInfo.ea} />
          <ValueChip
            label="R0 result"
            value={step.state.stage === 'write' ? String(step.state.R0) : 'After write back'}
            tone={step.state.stage === 'write' ? 'indigo' : 'neutral'}
          />
        </div>
      )}
    />
  );
}
