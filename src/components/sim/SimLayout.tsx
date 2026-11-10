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
      <aside className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:self-start">
        <section aria-labelledby="sim-inputs-heading" className="flex flex-col gap-4">
          <h2 id="sim-inputs-heading" className="font-mono text-xs uppercase tracking-widest text-slate-500">
            Inputs
          </h2>
          {inputs}
          {assumptions && assumptions.length > 0 && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-slate-400">
                Assumptions
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-500">
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
                className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div key={stepper.index} className="step-enter">
                  {visual(step)}
                </div>
              </section>

              {/* Output metrics */}
              {output && (
                <section
                  aria-label="Output"
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
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
      className="flex min-w-0 flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header>
        <p className="font-mono text-[11px] uppercase tracking-widest text-indigo-500">{step.title}</p>
        <p className="mt-1.5 font-mono text-sm font-medium text-slate-800 break-words">{step.operation}</p>
        {step.condition && (
          <p className="mt-1 font-mono text-xs text-amber-700 break-words">{step.condition}</p>
        )}
      </header>
      <p className="text-sm leading-relaxed text-slate-600">{step.explanation}</p>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Changed in this step</p>
        {step.changed.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {step.changed.map((c) => (
              <li
                key={c}
                className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs text-amber-700"
              >
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Nothing changed in this step.</p>
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
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500">Timeline</h3>
      <ol className="max-h-80 space-y-0.5 overflow-y-auto pr-1">
        {steps.map((s, i) => {
          const state = i === current ? 'current' : i < current ? 'done' : 'future';
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={state === 'current' ? 'step' : undefined}
                className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  state === 'current'
                    ? 'bg-indigo-50 text-indigo-800 font-medium border border-indigo-200'
                    : state === 'done'
                    ? 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    : 'text-slate-400 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className="w-7 shrink-0 font-mono text-xs text-slate-400">{i}</span>
                <span className="min-w-0 truncate">{s.title}</span>
                <span className="ml-auto shrink-0 font-mono text-[10px] uppercase text-slate-400">
                  {state === 'done' ? '✓' : state === 'current' ? 'now' : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
