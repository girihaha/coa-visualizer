export interface TopicNote {
  definition: string;
  purpose?: string;
  working?: string;
  algorithm?: string[];
  formula?: { expression: string; meaning: string }[];
  example?: { label: 'Source example' | 'Illustration'; body: string };
  keyPoints: string[];
  visualization?: string;
}
