import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useStepper } from '@/engine/useStepper';
import type { SimStep } from '@/engine/types';
import { SimControls, StatusPill } from '@/components/sim/SimControls';

interface SimLayoutProps<S> {
  steps: SimStep<S>[];
  error?: string;
  inputs: ReactNode;
  assumptions?: string[];
  visual: (step: SimStep<S>) => ReactNode;
  output?: (step: SimStep<S>) => ReactNode;
}

export function SimLayout<S>({ steps, error, inputs, assumptions, visual, output }: SimLayoutProps<S>) {
  const stepper = useStepper(steps);
  const step = stepper.step;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">

      {/* ── Left column: inputs + controls ──────────────────────── */}
      <aside className="flex flex-col gap-5 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:self-start">
        <section aria-labelledby="sim-inputs-heading" className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 id="sim-inputs-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
              Simulation Parameters
            </h2>
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              Lab Input
            </span>
          </div>
          {inputs}
          {assumptions && assumptions.length > 0 && (
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600 font-sans">
                Academic Assumptions
              </p>
              <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
                {assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="border-t border-slate-100 pt-5">
          <SimControls stepper={stepper} />
        </div>
      </aside>

      {/* ── Right column: visualization ─────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-5">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertTriangle size={18} aria-hidden className="mt-0.5 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        ) : (
          step && (
            <>
              {/* Status pill */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusPill status={stepper.status} index={stepper.index} total={stepper.total} />
              </div>

              {/* Simulation visual */}
              <section
                aria-label="Current state"
                className="min-w-0 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm"
              >
                <div key={stepper.index} className="step-enter">
                  {visual(step)}
                </div>
              </section>

              {/* Output metrics */}
              {output && (
                <section
                  aria-label="Output"
                  className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
                    Computed Output &amp; Registers
                  </p>
                  {output(step)}
                </section>
              )}

              {/* Step explanation + Timeline */}
              <div className="grid gap-5 xl:grid-cols-2">
                <StepExplanation step={step} />
                <StepTimeline steps={steps} current={stepper.index} onSelect={stepper.goTo} />
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

function StepExplanation<S>({ step }: { step: SimStep<S> }) {
  return (
    <section
      aria-label="Step explanation"
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm"
    >
      <header className="border-b border-slate-100 pb-3">
        <span className="inline-block rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
          {step.title}
        </span>
        <p className="mt-2 text-sm font-semibold text-slate-800 break-words font-sans">
          {step.operation}
        </p>
        {step.condition && (
          <p className="mt-1 font-mono text-xs font-medium text-amber-700 break-words">
            Condition: {step.condition}
          </p>
        )}
      </header>
      <p className="text-xs leading-relaxed text-slate-600 font-sans">{step.explanation}</p>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-sans">
          Register State Changes
        </p>
        {step.changed.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {step.changed.map((c) => (
              <li
                key={c}
                className="rounded-md border border-amber-200 bg-amber-50/80 px-2.5 py-0.5 font-mono text-xs font-medium text-amber-800"
              >
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1.5 text-xs text-slate-400 font-sans">Registers unchanged in this step.</p>
        )}
      </div>
    </section>
  );
}

function StepTimeline<S>({
  steps,
  current,
  onSelect,
}: {
  steps: SimStep<S>[];
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <section
      aria-label="Step timeline"
      className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
          Execution Step Log
        </h3>
        <span className="text-[11px] text-slate-400 font-sans">
          {steps.length} cycles total
        </span>
      </div>
      <ol className="max-h-80 space-y-0.5 overflow-y-auto pr-1">
        {steps.map((s, i) => {
          const state = i === current ? 'current' : i < current ? 'done' : 'future';
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={state === 'current' ? 'step' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  state === 'current'
                    ? 'bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200 shadow-xs'
                    : state === 'done'
                    ? 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    : 'text-slate-400 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className="w-6 shrink-0 font-mono text-xs text-slate-400">{i}</span>
                <span className="min-w-0 truncate font-sans">{s.title}</span>
                <span className="ml-auto shrink-0 font-mono text-[10px] uppercase font-bold text-slate-400">
                  {state === 'done' ? '✓' : state === 'current' ? 'active' : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
