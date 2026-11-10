import { describe, it, expect } from 'vitest';
import { buildPredictor, parseOutcomes, predictionOf, transition } from '@/sims/logic/predictor';

describe('2-bit branch predictor', () => {
  it('saturates at the strong states', () => {
    expect(transition('ST', 'T')).toBe('ST');
    expect(transition('SNT', 'N')).toBe('SNT');
  });

  it('moves one state toward the actual outcome', () => {
    expect(transition('ST', 'N')).toBe('WT');
    expect(transition('WT', 'N')).toBe('WNT');
    expect(transition('WNT', 'T')).toBe('WT');
    expect(transition('SNT', 'T')).toBe('WNT');
  });

  it('predicts taken only in the taken states', () => {
    expect(['ST', 'WT', 'WNT', 'SNT'].map((s) => predictionOf(s as never))).toEqual(['T', 'T', 'N', 'N']);
  });

  it('a single loop exit does not flip a strongly taken prediction', () => {
    const b = buildPredictor({ outcomes: 'TTTN TTTN', initial: 'ST', staticGuess: 'T' });
    const end = b.steps[b.steps.length - 1].state;
    expect(end.history.map((h) => h.predicted).join('')).toBe('TTTTTTTT');
    expect(end.history.filter((h) => h.correct)).toHaveLength(6);
    expect(end.state).toBe('WT');
  });

  it('compares against a static guess', () => {
    const end = buildPredictor({ outcomes: 'NNT', initial: 'WT', staticGuess: 'N' }).steps.at(-1)!.state;
    expect(end.history.map((h) => h.staticCorrect)).toEqual([true, true, false]);
    expect(end.history.map((h) => h.correct)).toEqual([false, true, false]);
  });

  it('creates a predict and a resolve step per branch', () => {
    expect(buildPredictor({ outcomes: 'TNT', initial: 'SNT', staticGuess: 'T' }).steps).toHaveLength(7);
  });

  it('rejects invalid outcome strings', () => {
    expect(parseOutcomes('TXN')).toBeNull();
    expect(parseOutcomes('')).toBeNull();
    expect(parseOutcomes('t, n')).toEqual(['T', 'N']);
    expect(buildPredictor({ outcomes: 'abc', initial: 'ST', staticGuess: 'T' }).error).toBeTruthy();
  });
});
