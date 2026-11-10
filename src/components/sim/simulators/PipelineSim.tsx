import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import { STAGE_NAMES, buildPipeline, stageAt, type PipelineState } from '@/sims/logic/pipeline';

const PRESETS: { label: string; program: string }[] = [
  {
    label: 'Independent',
    program: 'ADD R1, R2, R3\nSUB R4, R5, R6\nAND R7, R8, R9\nOR R10, R11, R12',
  },
  {
    label: 'Data hazard',
    program: 'MUL R2, R3, R4\nADD R5, R2, R6\nSUB R7, R8, R9\nOR R10, R5, R1',
  },
  {
    label: 'Branch',
    program: 'ADD R1, R2, R3\nBR 5\nSUB R4, R5, R6\nAND R7, R8, R9\nOR R10, R1, R2',
  },
];

// Bright-mode stage colors
const STAGE_CLS: Record<string, string> = {
  F: 'border-blue-200   bg-blue-50   text-blue-700',
  D: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  E: 'border-violet-200 bg-violet-50 text-violet-700',
  W: 'border-teal-200   bg-teal-50   text-teal-700',
};

const STAGE_LEGEND = [
  { key: 'F', name: 'Fetch' },
  { key: 'D', name: 'Decode' },
  { key: 'E', name: 'Execute' },
  { key: 'W', name: 'Write' },
] as const;

export function PipelineSim() {
  const [program, setProgram] = useState(PRESETS[1].program);
  const [forwarding, setForwarding] = useState(false);
  const [missLine, setMissLine] = useState(0);
  const [missPenalty, setMissPenalty] = useState('2');
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
  const lineCount = program.split('\n').filter((l) => l.trim()).length;

  return (
    <SimLayout<PipelineState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="pl-preset" label="Preset workload">
            <Segmented
              label="Preset"
              value={PRESETS.find((p) => p.program === program)?.label ?? ''}
              options={PRESETS.map((p) => ({ value: p.label, label: p.label }))}
              onChange={(v) => setProgram(PRESETS.find((p) => p.label === v)!.program)}
            />
          </Field>
          <Field
            id="pl-program"
            label="Instructions"
            hint="One per line, destination first: ADD R1, R2, R3 · LOAD R1, (R2) · BR 4 · NOP"
          >
            <textarea
              id="pl-program"
              rows={6}
              className={`${inputClass} resize-y leading-relaxed`}
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field id="pl-fwd" label="Operand forwarding">
            <Segmented
              label="Operand forwarding"
              value={forwarding ? 'on' : 'off'}
              options={[
                { value: 'off', label: 'Off (stall)' },
                { value: 'on',  label: 'On (bypass)' },
              ]}
              onChange={(v) => setForwarding(v === 'on')}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="pl-miss" label="Cache miss on">
              <select
                id="pl-miss"
                className={inputClass}
                value={missLine}
                onChange={(e) => setMissLine(Number(e.target.value))}
              >
                <option value={0}>None</option>
                {Array.from({ length: lineCount }, (_, i) => (
                  <option key={i} value={i + 1}>
                    Line {i + 1}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="pl-pen" label="Extra cycles">
              <input
                id="pl-pen"
                className={inputClass}
                value={missPenalty}
                onChange={(e) => setMissPenalty(e.target.value)}
                inputMode="numeric"
                disabled={missLine === 0}
              />
            </Field>
          </div>
        </>
      }
      assumptions={[
        'Simplified 4-stage teaching model: Fetch, Decode (operand read), Execute, Write. One cycle per stage.',
        'Registers are written in the first half of a cycle and read in the second half.',
        'Without forwarding, a dependent instruction executes the cycle after its producer writes. With forwarding, the cycle after the producer executes.',
        'Branches are resolved in Decode; the one instruction fetched behind them is discarded if on the wrong path.',
      ]}
      visual={(step) => {
        const s = step.state;
        const cycles = Array.from({ length: s.totalCycles }, (_, i) => i + 1);
        return (
          <div className="flex flex-col gap-5">
            {/* Pipeline timing table */}
            <div className="-mx-1 overflow-x-auto px-1 pb-2">
              <table className="border-separate border-spacing-1 font-mono text-xs">
                <caption className="sr-only">
                  Pipeline cycle table up to cycle {s.cycle}
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-1.5 text-left font-semibold text-slate-600 border-b border-slate-200"
                    >
                      Instruction
                    </th>
                    {cycles.map((c) => (
                      <th
                        key={c}
                        scope="col"
                        className={`w-10 px-1 py-1.5 text-center font-semibold border-b border-slate-200 ${
                          c === s.cycle ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.timings.map((t, r) => (
                    <tr key={r}>
                      <th
                        scope="row"
                        className={`sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-1 text-left font-normal ${
                          t.flushed ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}
                      >
                        I{t.instr.line}{' '}
                        <span className="text-slate-400">{t.instr.text}</span>
                      </th>
                      {cycles.map((c) => {
                        const at = c <= s.cycle ? stageAt(t, c) : null;
                        const isNow = c === s.cycle;
                        const fwd =
                          s.forwards.some((f) => f.to === t.instr.line) &&
                          isNow &&
                          at?.stage === 'E';
                        return (
                          <td
                            key={c}
                            aria-label={
                              at
                                ? `${STAGE_NAMES[at.stage]}${at.stalled ? ' stall' : ''}${t.flushed ? ' flushed' : ''}`
                                : 'empty'
                            }
                            className={`h-9 w-10 rounded border text-center align-middle transition-colors duration-200 ${
                              !at
                                ? `border-slate-100 ${isNow ? 'bg-slate-50' : ''}`
                                : t.flushed
                                ? 'border-red-200 bg-red-50 text-red-600'
                                : at.stalled
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : STAGE_CLS[at.stage]
                            } ${isNow && at ? 'ring-2 ring-indigo-300 ring-offset-1' : ''}`}
                          >
                            {at
                              ? t.flushed
                                ? '✕'
                                : at.stalled
                                ? `${at.stage}·`
                                : at.stage
                              : ''}
                            {fwd && (
                              <span className="ml-0.5 text-indigo-500" aria-hidden>
                                ↗
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              {STAGE_LEGEND.map(({ key, name }) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex h-5 w-6 items-center justify-center rounded border font-mono text-[10px] ${STAGE_CLS[key]}`}
                  >
                    {key}
                  </span>
                  {name}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-5 w-6 items-center justify-center rounded border border-amber-200 bg-amber-50 font-mono text-[10px] text-amber-700">
                  D·
                </span>
                Stall
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-5 w-6 items-center justify-center rounded border border-red-200 bg-red-50 font-mono text-[10px] text-red-600">
                  ✕
                </span>
                Flushed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-indigo-500 font-mono">↗</span>
                Forwarded operand
              </span>
            </div>

            {/* Cycle events */}
            {s.events.length > 0 && (
              <ul className="space-y-1.5" aria-label="Events this cycle">
                {s.events.map((e) => (
                  <li
                    key={e}
                    className="rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const executed = s.timings.filter((t) => !t.flushed).length;
        const done = s.cycle === s.totalCycles;
        return (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <ValueChip label="Total cycles" value={String(s.totalCycles)} tone="indigo" />
              <ValueChip label="Ideal (k + n − 1)" value={String(4 + executed - 1)} />
              <ValueChip
                label="Baseline (no fwd, no miss)"
                value={String(build.baseline ?? '—')}
              />
              <ValueChip
                label="CPI"
                value={done ? (s.totalCycles / executed).toFixed(2) : 'At completion'}
                tone={done ? 'amber' : 'neutral'}
              />
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Ideal count assumes k = 4 stages, n = {executed} completed instruction
              {executed !== 1 ? 's' : ''} and no stalls. CPI = total cycles ÷ completed
              instructions (includes pipeline fill).
            </p>
          </div>
        );
      }}
    />
  );
}
