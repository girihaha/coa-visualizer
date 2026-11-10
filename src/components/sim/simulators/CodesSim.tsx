import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  CODE_LABELS,
  CODE_MODES,
  buildCodes,
  type CodeMode,
  type CodeState,
  type ParityType,
} from '@/sims/logic/codes';

const PLACEHOLDER: Record<CodeMode, string> = {
  bcd: '2024',
  xs3: '2024',
  'gray-encode': '1011',
  'gray-decode': '1110',
  ascii: 'Hi',
  parity: '1011001',
};

export function CodesSim() {
  const [mode, setMode] = useState<CodeMode>('bcd');
  const [input, setInput] = useState(PLACEHOLDER.bcd);
  const [parity, setParity] = useState<ParityType>('even');
  const build = useMemo(() => buildCodes(mode, input, parity), [mode, input, parity]);

  const changeMode = (next: CodeMode) => {
    setMode(next);
    setInput(PLACEHOLDER[next]);
  };

  return (
    <SimLayout<CodeState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="code-mode" label="Encoding type">
            <select
              id="code-mode"
              className={inputClass}
              value={mode}
              onChange={(e) => changeMode(e.target.value as CodeMode)}
            >
              {CODE_MODES.map((m) => (
                <option key={m} value={m}>
                  {CODE_LABELS[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="code-input"
            label={
              mode === 'ascii'
                ? 'Text input'
                : mode === 'bcd' || mode === 'xs3'
                ? 'Decimal digits'
                : 'Binary string'
            }
            hint={modeHint(mode)}
          >
            <input
              id="code-input"
              className={inputClass}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </Field>
          {mode === 'parity' && (
            <Field id="code-parity" label="Parity scheme">
              <select
                id="code-parity"
                className={inputClass}
                value={parity}
                onChange={(e) => setParity(e.target.value as ParityType)}
              >
                <option value="even">Even parity (total 1s must be even)</option>
                <option value="odd">Odd parity (total 1s must be odd)</option>
              </select>
            </Field>
          )}
        </>
      }
      assumptions={[
        'Code mapping maps each symbol to its bit pattern without arithmetic evaluation.',
        'BCD maps each decimal digit independently to a 4-bit binary group (0000 to 1001).',
        'Excess-3 (XS-3) adds 3 to each decimal digit before encoding into a 4-bit group.',
        'Gray code ensures adjacent values differ by exactly one bit.',
        'ASCII uses standard 7-bit character codes (0 to 127).',
        'Single parity bit detects odd-count errors but cannot locate or correct them.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Encoded groups / bit patterns
              </p>
              <div
                className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
                aria-label="Encoded groups"
              >
                {s.groups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No groups formed yet.</p>
                ) : (
                  s.groups.map((g, i) => (
                    <span
                      key={`${i}-${g}`}
                      className={`rounded-md border px-3 py-1.5 font-mono text-sm tabular-nums font-semibold transition-all ${
                        i === s.groups.length - 1
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {g}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip label="Accumulated groups" value={String(s.groups.length)} />
              <ValueChip label="Current operation" value={step.title} tone="indigo" />
            </div>
          </div>
        );
      }}
      output={(step) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <ValueChip
            label="Final encoded result"
            value={step.state.output ?? 'Shown after the final step'}
            tone={step.state.output ? 'indigo' : 'neutral'}
          />
          <ValueChip label="Operation summary" value={step.state.note || '—'} />
        </div>
      )}
    />
  );
}

function modeHint(mode: CodeMode): string {
  if (mode === 'bcd' || mode === 'xs3') return 'Decimal digits 0 to 9 only.';
  if (mode === 'ascii') return 'Standard ASCII characters (codes 0 to 127).';
  return 'Binary digits 0 and 1 only.';
}
