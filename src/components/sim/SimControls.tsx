import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import type { Stepper } from '@/engine/useStepper';
import { SPEEDS } from '@/engine/useStepper';
import type { SimStatus } from '@/engine/types';

const STATUS_LABEL: Record<SimStatus, string> = {
  ready: 'Ready',
  running: 'Running',
  paused: 'Paused',
  complete: 'Complete',
  invalid: 'Invalid input',
};

const STATUS_TONE: Record<SimStatus, string> = {
  ready:    'border-slate-300 bg-slate-50 text-slate-600',
  running:  'border-indigo-300 bg-indigo-50 text-indigo-700',
  paused:   'border-amber-300 bg-amber-50 text-amber-700',
  complete: 'border-green-300 bg-green-50 text-green-700',
  invalid:  'border-red-300 bg-red-50 text-red-700',
};

export function StatusPill({
  status,
  index,
  total,
}: {
  status: SimStatus;
  index: number;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span
        role="status"
        aria-live="polite"
        className={`rounded border px-2.5 py-1 font-mono text-xs uppercase tracking-wide ${STATUS_TONE[status]}`}
      >
        {STATUS_LABEL[status]}
      </span>
      {status !== 'invalid' && (
        <span className="font-mono text-xs text-slate-500">
          Step {index} of {Math.max(total - 1, 0)}
        </span>
      )}
    </div>
  );
}

const btn =
  'inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700';

export function SimControls<S>({ stepper }: { stepper: Stepper<S> }) {
  const playing = stepper.status === 'running';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${btn} min-w-[7.5rem] justify-center`}
          onClick={playing ? stepper.pause : stepper.play}
          disabled={!playing && !stepper.canPlay}
          aria-label={
            playing
              ? 'Pause simulation'
              : stepper.status === 'paused'
              ? 'Resume simulation'
              : 'Run simulation'
          }
        >
          {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          {playing ? 'Pause' : stepper.status === 'paused' ? 'Resume' : 'Run'}
        </button>
        <button type="button" className={btn} onClick={stepper.prev} disabled={!stepper.canPrev}>
          <SkipBack size={16} aria-hidden />
          Previous
        </button>
        <button type="button" className={btn} onClick={stepper.next} disabled={!stepper.canPlay}>
          <SkipForward size={16} aria-hidden />
          Next step
        </button>
        <button
          type="button"
          className={btn}
          onClick={stepper.reset}
          disabled={stepper.index === 0 && !playing}
        >
          <RotateCcw size={16} aria-hidden />
          Reset
        </button>
      </div>

      {/* Speed selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-wide text-slate-500">Speed</span>
        <div role="group" aria-label="Playback speed" className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={stepper.speed === s}
              onClick={() => stepper.setSpeed(s)}
              className={`rounded border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                stepper.speed === s
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
