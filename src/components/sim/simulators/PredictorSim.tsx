import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  PREDICTOR_STATES,
  buildPredictor,
  type PredictorSimState,
  type PredictorState,
} from '@/sims/logic/predictor';

const POS: Record<PredictorState, { x: number; y: number }> = {
  ST:  { x: 80,  y: 55 },
  WT:  { x: 250, y: 55 },
  WNT: { x: 420, y: 55 },
  SNT: { x: 590, y: 55 },
};

export function PredictorSim() {
  const [outcomes, setOutcomes] = useState('T T T N T T T N T T');
  const [initial, setInitial] = useState<PredictorState>('WNT');
  const [staticGuess, setStaticGuess] = useState<'T' | 'N'>('N');
  const build = useMemo(
    () => buildPredictor({ outcomes, initial, staticGuess }),
    [outcomes, initial, staticGuess],
  );

  return (
    <SimLayout<PredictorSimState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field
            id="bp-out"
            label="Branch outcome sequence"
            hint="T = Taken, N = Not Taken. Loop branches typically follow T T T N."
          >
            <input
              id="bp-out"
              className={inputClass}
              value={outcomes}
              onChange={(e) => setOutcomes(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field id="bp-init" label="Initial 2-bit predictor state">
            <select
              id="bp-init"
              className={inputClass}
              value={initial}
              onChange={(e) => setInitial(e.target.value as PredictorState)}
            >
              {PREDICTOR_STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.id})
                </option>
              ))}
            </select>
          </Field>
          <Field id="bp-static" label="Static predictor baseline">
            <Segmented
              label="Static prediction"
              value={staticGuess}
              options={[
                { value: 'N', label: 'Always Not Taken' },
                { value: 'T', label: 'Always Taken' },
              ]}
              onChange={setStaticGuess}
            />
          </Field>
        </>
      }
      assumptions={[
        '2-bit saturating counter branch prediction state machine.',
        'Taken (T) transitions toward Strongly Taken (ST); Not Taken (N) transitions toward Strongly Not Taken (SNT).',
        'Predictions: ST & WT predict TAKEN; WNT & SNT predict NOT TAKEN.',
        'State transitions require two consecutive mispredictions to flip prediction polarity.',
      ]}
      visual={(step) => {
        const s = step.state;
        const last = s.history[s.history.length - 1];
        return (
          <div className="flex flex-col gap-6">
            {/* Finite state machine SVG diagram */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 overflow-x-auto shadow-sm">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                2-Bit Branch Predictor State Machine
              </p>
              <svg
                viewBox="0 0 670 145"
                className="h-auto w-full min-w-[540px] mx-auto"
                role="img"
                aria-label={`Predictor state ${s.state}${s.previous ? `, moved from ${s.previous}` : ''}`}
              >
                <defs>
                  <marker
                    id="bp-arrow-slate"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="bp-arrow-active"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M0 0 L10 5 L0 10 z" fill="#4f46e5" />
                  </marker>
                </defs>

                {/* Transition arcs */}
                {(['ST', 'WT', 'WNT'] as PredictorState[]).map((st, i) => {
                  const a = POS[st];
                  const b = POS[(['WT', 'WNT', 'SNT'] as PredictorState[])[i]];
                  return (
                    <g key={st}>
                      {/* N arrow (rightward) */}
                      <path
                        d={`M${a.x + 52} ${a.y - 8} L${b.x - 52} ${a.y - 8}`}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        markerEnd="url(#bp-arrow-slate)"
                      />
                      {/* T arrow (leftward) */}
                      <path
                        d={`M${b.x - 52} ${a.y + 8} L${a.x + 52} ${a.y + 8}`}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        markerEnd="url(#bp-arrow-slate)"
                      />
                      <text
                        x={(a.x + b.x) / 2}
                        y={a.y - 13}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#64748b"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        N
                      </text>
                      <text
                        x={(a.x + b.x) / 2}
                        y={a.y + 23}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#64748b"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        T
                      </text>
                    </g>
                  );
                })}

                {/* State nodes */}
                {PREDICTOR_STATES.map((st) => {
                  const p = POS[st.id];
                  const current = s.state === st.id;
                  const prev = s.previous === st.id && s.previous !== s.state;
                  return (
                    <g key={st.id}>
                      <rect
                        x={p.x - 50}
                        y={p.y - 26}
                        width="100"
                        height="52"
                        rx="8"
                        fill={current ? '#eef2ff' : '#f8fafc'}
                        stroke={current ? '#4f46e5' : prev ? '#f59e0b' : '#cbd5e1'}
                        strokeWidth={current ? 2.5 : 1.5}
                        strokeDasharray={prev ? '4 3' : undefined}
                      />
                      <text
                        x={p.x}
                        y={p.y - 3}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fill={current ? '#3730a3' : '#1e293b'}
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {st.id}
                      </text>
                      <text
                        x={p.x}
                        y={p.y + 14}
                        textAnchor="middle"
                        fontSize="9"
                        fill={current ? '#4f46e5' : '#64748b'}
                        fontFamily="system-ui, sans-serif"
                        fontWeight={current ? '600' : 'normal'}
                      >
                        {st.predicts === 'T' ? 'Predict TAKEN' : 'Predict NOT'}
                      </text>
                    </g>
                  );
                })}

                <text
                  x="80"
                  y="118"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="system-ui, sans-serif"
                >
                  ↺ T stays ST
                </text>
                <text
                  x="590"
                  y="118"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="system-ui, sans-serif"
                >
                  ↺ N stays SNT
                </text>
              </svg>
            </div>

            {/* Outcome sequence trace */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Resolution history per branch
              </p>
              <ol className="flex flex-wrap gap-1.5">
                {s.outcomes.map((o, i) => {
                  const h = s.history[i];
                  const isCurrent = i === s.index && s.phase !== 'initial';
                  return (
                    <li
                      key={i}
                      aria-label={`Branch ${i + 1}: actual ${o}${
                        h
                          ? `, predicted ${h.predicted}, ${h.correct ? 'correct' : 'mispredicted'}`
                          : ', not yet resolved'
                      }`}
                      className={`flex w-12 flex-col items-center rounded-lg border py-1.5 font-mono text-xs transition-colors ${
                        !h
                          ? isCurrent
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                          : h.correct
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold'
                          : 'border-red-200 bg-red-50 text-red-700 font-semibold'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400">#{i + 1}</span>
                      <span>{h ? `${h.predicted}→${o}` : isCurrent ? '?' : '·'}</span>
                      {h && (
                        <span className="text-[9px]">
                          {h.correct ? '✓' : '✗'}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Current status indicators */}
            <div className="grid gap-3 sm:grid-cols-3">
              <ValueChip
                label="Current Predictor State"
                value={`${s.state} (${PREDICTOR_STATES.find((p) => p.id === s.state)!.label})`}
                tone="indigo"
              />
              <ValueChip
                label="Next Prediction"
                value={
                  PREDICTOR_STATES.find((p) => p.id === s.state)!.predicts === 'T'
                    ? 'TAKEN'
                    : 'NOT TAKEN'
                }
                tone="indigo"
              />
              <ValueChip
                label="Last Branch Outcome"
                value={
                  last && s.phase === 'resolve'
                    ? last.correct
                      ? '✓ Correct (no penalty)'
                      : '✗ Mispredicted (pipeline flush)'
                    : '—'
                }
                tone={
                  last && s.phase === 'resolve'
                    ? last.correct
                      ? 'indigo'
                      : 'red'
                    : 'neutral'
                }
              />
            </div>
          </div>
        );
      }}
      output={(step) => {
        const h = step.state.history;
        const correct = h.filter((x) => x.correct).length;
        const sc = h.filter((x) => x.staticCorrect).length;
        return (
          <div className="grid gap-3 sm:grid-cols-3">
            <ValueChip label="Branches resolved" value={`${h.length} of ${step.state.outcomes.length}`} />
            <ValueChip
              label="2-Bit dynamic accuracy"
              value={h.length ? `${correct} of ${h.length} (${Math.round((correct / h.length) * 100)}%)` : '—'}
              tone="indigo"
            />
            <ValueChip
              label="Static predictor accuracy"
              value={h.length ? `${sc} of ${h.length} (${Math.round((sc / h.length) * 100)}%)` : '—'}
            />
          </div>
        );
      }}
    />
  );
}
