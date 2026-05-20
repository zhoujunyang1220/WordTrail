/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExampleSentence {
  en: string;
  zh: string;
}

export interface WordReviewHistory {
  timestamp: number;
  result: "correct" | "incorrect";
  oldStage: number;
  newStage: number;
}

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  chineseDefinition: string;
  englishDefinition: string;
  rootAffix?: string;
  memoryHook?: string;
  phrases?: string[];
  sentences?: ExampleSentence[];
  notebookId: string;
  notes?: string;
  
  // Spaced repetition properties (Ebbinghaus Forgetting Curve)
  stage: number; // 0 to 8
  createdAt: number;
  lastReviewAt?: number;
  nextReviewAt: number; // timestamp in ms when next review is due
  reviewHistory: WordReviewHistory[];
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  color: string; // Tailwind color class for visual representation
}

export interface CandidateWord {
  word: string;
  contextSentence: string;
  quickTranslation: string;
  difficultyLevel?: string;
  selected?: boolean;
}

// Ebbinghaus Forgetting Curve intervals in milliseconds
// Stage 0 -> 1: 5 min
// Stage 1 -> 2: 30 min
// Stage 2 -> 3: 12 hours
// Stage 3 -> 4: 1 day (24 hours)
// Stage 4 -> 5: 2 days (48 hours)
// Stage 5 -> 6: 4 days
// Stage 6 -> 7: 7 days
// Stage 7 -> 8: 15 days
// Stage 8 -> Mastered (review becomes very periodic or stays fully learned)
export const EBBINGHAUS_INTERVALS: { [key: number]: number } = {
  0: 5 * 60 * 1000,          // 5 minutes
  1: 30 * 60 * 1000,         // 30 minutes
  2: 12 * 60 * 60 * 1000,     // 12 hours
  3: 24 * 60 * 60 * 1000,     // 1 day
  4: 2 * 24 * 60 * 60 * 1000, // 2 days
  5: 4 * 24 * 60 * 60 * 1000, // 4 days
  6: 7 * 24 * 60 * 60 * 1000, // 7 days
  7: 15 * 24 * 60 * 60 * 1000,// 15 days
  8: 30 * 24 * 60 * 60 * 1000 // 30 days
};

export const STAGE_LABELS: { [key: number]: string } = {
  0: "新记录（待初记）",
  1: "记忆初期（5分钟）",
  2: "短期记忆（30分钟）",
  3: "短期强化（12小时）",
  4: "中期稳固（1天）",
  5: "中期熟练（2天）",
  6: "长期记忆（4天）",
  7: "巩固熟记（7天）",
  8: "终期熟记（15天）"
};

export const STAGE_LABELS_EN: { [key: number]: string } = {
  0: "New Entry (First Note)",
  1: "Early Memory (5 min)",
  2: "Short-term (30 min)",
  3: "Strengthen (12 hours)",
  4: "Mid-term Solid (1 day)",
  5: "Mid-term Fluent (2 days)",
  6: "Long-term (4 days)",
  7: "Deeply Learnt (7 days)",
  8: "Final Mastery (15 days)"
};
