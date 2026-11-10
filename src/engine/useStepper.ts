import { useEffect, useState } from 'react';
import type { SimStatus, SimStep } from '@/engine/types';

export const SPEEDS = [0.5, 1, 2, 4] as const;

export function useStepper<S>(steps: SimStep<S>[]) {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [source, setSource] = useState(steps);

  if (source !== steps) {
    setSource(steps);
    setIndex(0);
    setRunning(false);
  }

  const last = Math.max(steps.length - 1, 0);
  const clamp = (i: number) => Math.min(Math.max(i, 0), last);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setIndex((i) => Math.min(i + 1, last));
    }, 1000 / speed);
    return () => window.clearInterval(id);
  }, [running, speed, last]);

  useEffect(() => {
    if (running && index >= last) setRunning(false);
  }, [running, index, last]);

  const status: SimStatus =
    steps.length === 0
      ? 'invalid'
      : running
        ? 'running'
        : index >= last
          ? 'complete'
          : index === 0
            ? 'ready'
            : 'paused';

  return {
    index: clamp(index),
    step: steps[clamp(index)] as SimStep<S> | undefined,
    total: steps.length,
    status,
    speed,
    setSpeed,
    canPlay: steps.length > 0 && index < last,
    canPrev: index > 0,
    play: () => {
      if (index < last) setRunning(true);
    },
    pause: () => setRunning(false),
    next: () => {
      setRunning(false);
      setIndex((i) => clamp(i + 1));
    },
    prev: () => {
      setRunning(false);
      setIndex((i) => clamp(i - 1));
    },
    goTo: (i: number) => {
      setRunning(false);
      setIndex(clamp(i));
    },
    reset: () => {
      setRunning(false);
      setIndex(0);
    },
  };
}

export type Stepper<S> = ReturnType<typeof useStepper<S>>;
