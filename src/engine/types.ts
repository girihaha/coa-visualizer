export interface SimStep<S> {
  title: string;
  operation: string;
  condition?: string;
  changed: string[];
  explanation: string;
  state: S;
}

export interface SimBuild<S> {
  steps: SimStep<S>[];
  error?: string;
}

export type SimStatus = 'ready' | 'running' | 'paused' | 'complete' | 'invalid';
