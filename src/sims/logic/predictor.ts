import type { SimBuild, SimStep } from '@/engine/types';

export type PredictorState = 'ST' | 'WT' | 'WNT' | 'SNT';

export const PREDICTOR_STATES: { id: PredictorState; label: string; predicts: 'T' | 'N' }[] = [
  { id: 'ST', label: 'Strongly taken', predicts: 'T' },
  { id: 'WT', label: 'Weakly taken', predicts: 'T' },
  { id: 'WNT', label: 'Weakly not taken', predicts: 'N' },
  { id: 'SNT', label: 'Strongly not taken', predicts: 'N' },
];

const ORDER: PredictorState[] = ['SNT', 'WNT', 'WT', 'ST'];

export function transition(state: PredictorState, outcome: 'T' | 'N'): PredictorState {
  const i = ORDER.indexOf(state);
  return ORDER[outcome === 'T' ? Math.min(i + 1, 3) : Math.max(i - 1, 0)];
}

export function predictionOf(state: PredictorState): 'T' | 'N' {
  return PREDICTOR_STATES.find((s) => s.id === state)!.predicts;
}

export interface PredictorSimState {
  state: PredictorState;
  previous: PredictorState | null;
  index: number;
  outcomes: ('T' | 'N')[];
  history: { predicted: 'T' | 'N'; actual: 'T' | 'N'; correct: boolean; staticCorrect: boolean }[];
  phase: 'initial' | 'predict' | 'resolve';
}

export function parseOutcomes(text: string): ('T' | 'N')[] | null {
  const cleaned = text.toUpperCase().replace(/[\s,]+/g, '');
  if (!/^[TN]{1,24}$/.test(cleaned)) return null;
  return cleaned.split('') as ('T' | 'N')[];
}

export function buildPredictor(opts: { outcomes: string; initial: PredictorState; staticGuess: 'T' | 'N' }): SimBuild<PredictorSimState> {
  const outcomes = parseOutcomes(opts.outcomes);
  if (!outcomes) return { steps: [], error: 'Enter 1 to 24 branch outcomes using T (taken) and N (not taken), for example "T T T N T T T N".' };
  let s: PredictorSimState = { state: opts.initial, previous: null, index: 0, outcomes, history: [], phase: 'initial' };
  const steps: SimStep<PredictorSimState>[] = [
    { title: 'Initial state', operation: `Predictor starts in ${opts.initial}`, changed: [], explanation: 'The predictor keeps a 2-bit history for one branch. Its state decides the prediction each time the branch is fetched.', state: s },
  ];
  outcomes.forEach((actual, i) => {
    const predicted = predictionOf(s.state);
    s = { ...s, index: i, phase: 'predict', previous: null };
    steps.push({
      title: `Branch ${i + 1}: predict`,
      operation: `State ${s.state} predicts ${predicted === 'T' ? 'taken' : 'not taken'}`,
      changed: ['prediction'],
      explanation: `The fetch unit follows the ${predicted === 'T' ? 'target' : 'fall-through'} path before the branch outcome is known.`,
      state: s,
    });
    const next = transition(s.state, actual);
    const correct = predicted === actual;
    s = {
      ...s,
      phase: 'resolve',
      previous: s.state,
      state: next,
      history: [...s.history, { predicted, actual, correct, staticCorrect: opts.staticGuess === actual }],
    };
    steps.push({
      title: `Branch ${i + 1}: resolve`,
      operation: `Actual ${actual === 'T' ? 'taken' : 'not taken'} · ${s.previous} -> ${next}`,
      condition: correct ? 'Prediction correct' : 'Misprediction: wrong-path instructions are flushed',
      changed: ['state', ...(correct ? [] : ['flush'])],
      explanation: correct
        ? 'The prediction matched, so the instructions already fetched are kept. The state moves one step toward the actual outcome (or stays if already saturated).'
        : 'The prediction was wrong, so instructions fetched on the predicted path are discarded and fetching restarts on the correct path. One wrong outcome from a strong state only weakens it, so a single exception does not flip the prediction.',
      state: s,
    });
  });
  return { steps };
}
