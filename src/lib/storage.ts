import { Word, Notebook, EBBINGHAUS_INTERVALS } from "../types";

const LOCAL_STORAGE_WORDS_KEY = "active_vocab_words_v1";
const LOCAL_STORAGE_NOTEBOOKS_KEY = "active_vocab_notebooks_v1";

const DEFAULT_NOTEBOOKS: Notebook[] = [
  {
    id: "notebook-default",
    name: "默认生词本",
    description: "日常学习及阅读中随手记录的生词",
    createdAt: Date.now(),
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-700",
  }
];

const SEED_WORDS: Word[] = [];

export function getWords(): Word[] {
  if (typeof window === "undefined") return [];
  const words = localStorage.getItem(LOCAL_STORAGE_WORDS_KEY);
  if (!words) {
    localStorage.setItem(LOCAL_STORAGE_WORDS_KEY, JSON.stringify(SEED_WORDS));
    return SEED_WORDS;
  }
  return JSON.parse(words);
}

export function saveWords(words: Word[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_WORDS_KEY, JSON.stringify(words));
}

export function getNotebooks(): Notebook[] {
  if (typeof window === "undefined") return [];
  const notebooks = localStorage.getItem(LOCAL_STORAGE_NOTEBOOKS_KEY);
  if (!notebooks) {
    localStorage.setItem(LOCAL_STORAGE_NOTEBOOKS_KEY, JSON.stringify(DEFAULT_NOTEBOOKS));
    return DEFAULT_NOTEBOOKS;
  }
  return JSON.parse(notebooks);
}

export function saveNotebooks(notebooks: Notebook[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_NOTEBOOKS_KEY, JSON.stringify(notebooks));
}

export function createNewWord(payload: Omit<Word, "id" | "stage" | "createdAt" | "nextReviewAt" | "reviewHistory">): Word {
  const newWord: Word = {
    ...payload,
    id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    stage: 0,
    createdAt: Date.now(),
    nextReviewAt: Date.now() + EBBINGHAUS_INTERVALS[0], // first review scheduled in 5 mins
    reviewHistory: []
  };
  
  const currentWords = getWords();
  currentWords.push(newWord);
  saveWords(currentWords);
  return newWord;
}

export function updateWord(updatedWord: Word): void {
  const currentWords = getWords();
  const index = currentWords.findIndex((w) => w.id === updatedWord.id);
  if (index !== -1) {
    currentWords[index] = updatedWord;
    saveWords(currentWords);
  }
}

export function deleteWord(id: string): void {
  const currentWords = getWords();
  const filtered = currentWords.filter((w) => w.id !== id);
  saveWords(filtered);
}

export function registerReviewResult(wordId: string, result: "correct" | "incorrect"): Word {
  const currentWords = getWords();
  const index = currentWords.findIndex((w) => w.id === wordId);
  if (index === -1) {
    throw new Error(`Word with ID ${wordId} not found.`);
  }

  const word = currentWords[index];
  const oldStage = word.stage;
  let newStage = oldStage;

  if (result === "correct") {
    newStage = Math.min(8, oldStage + 1);
  } else {
    // Drop down stage by 2 levels as memory penalty (min 0) or fall to Stage 1. Let's drop -2 levels.
    newStage = Math.max(0, oldStage - 2);
    // If we've made correct recall history but got wrong, reset to early review stage
    if (newStage === 0 && oldStage > 0) {
      newStage = 1; // back to stage 1 (5 mins - 30 mins)
    }
  }

  const now = Date.now();
  const updatedWord: Word = {
    ...word,
    stage: newStage,
    lastReviewAt: now,
    nextReviewAt: now + (EBBINGHAUS_INTERVALS[newStage] || EBBINGHAUS_INTERVALS[8]),
    reviewHistory: [
      ...(word.reviewHistory || []),
      {
        timestamp: now,
        result,
        oldStage,
        newStage
      }
    ]
  };

  currentWords[index] = updatedWord;
  saveWords(currentWords);
  return updatedWord;
}

export function createNotebook(name: string, description: string): Notebook {
  const colors = [
    "from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-700",
    "from-indigo-500/10 to-cyan-500/10 border-indigo-200 text-indigo-700",
    "from-rose-500/10 to-red-500/10 border-rose-200 text-rose-700",
    "from-cyan-500/10 to-blue-500/10 border-cyan-200 text-cyan-700",
    "from-emerald-500/10 to-sky-500/10 border-emerald-200 text-emerald-700",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newNotebook: Notebook = {
    id: `notebook-${Date.now()}`,
    name,
    description,
    createdAt: Date.now(),
    color: randomColor
  };

  const notebooks = getNotebooks();
  notebooks.push(newNotebook);
  saveNotebooks(notebooks);
  return newNotebook;
}

export function deleteNotebook(id: string): void {
  const notebooks = getNotebooks();
  const filtered = notebooks.filter((nb) => nb.id !== id);
  saveNotebooks(filtered);
}

export function exportAllData(): string {
  const data = {
    version: 1,
    exportedAt: Date.now(),
    words: getWords(),
    notebooks: getNotebooks(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): { words: Word[]; notebooks: Notebook[] } {
  const data = JSON.parse(jsonString);
  if (!data.words || !data.notebooks) {
    throw new Error("Invalid backup format");
  }
  saveWords(data.words);
  saveNotebooks(data.notebooks);
  return { words: data.words, notebooks: data.notebooks };
}

// Streak tracking
const STREAK_KEY = "wordtrail_streak_v1";

export interface StreakData {
  lastCheckinDate: string;
  currentStreak: number;
  longestStreak: number;
  checkinHistory: string[];
}

export function getStreakData(): StreakData {
  if (typeof window === "undefined") {
    return { lastCheckinDate: "", currentStreak: 0, longestStreak: 0, checkinHistory: [] };
  }
  const raw = localStorage.getItem(STREAK_KEY);
  if (raw) {
    return JSON.parse(raw);
  }
  return { lastCheckinDate: "", currentStreak: 0, longestStreak: 0, checkinHistory: [] };
}

export function checkinToday(): StreakData {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const streak = getStreakData();

  if (streak.checkinHistory.includes(dateStr)) {
    return streak;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (streak.lastCheckinDate === yesterdayStr) {
    streak.currentStreak += 1;
  } else if (streak.lastCheckinDate !== dateStr) {
    streak.currentStreak = 1;
  }

  streak.lastCheckinDate = dateStr;
  streak.checkinHistory.push(dateStr);
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }
  return streak;
}

// Daily practice stats
const STATS_KEY = "wordtrail_stats_v1";

export interface DailyStats {
  date: string;
  reviewed: number;
  correct: number;
  incorrect: number;
}

export function getStatsHistory(): DailyStats[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STATS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function recordDailyStats(result: "correct" | "incorrect"): void {
  const today = new Date().toISOString().split("T")[0];
  const history = getStatsHistory();
  let dayStats = history.find((d) => d.date === today);
  if (!dayStats) {
    dayStats = { date: today, reviewed: 0, correct: 0, incorrect: 0 };
    history.push(dayStats);
  }
  dayStats.reviewed += 1;
  if (result === "correct") dayStats.correct += 1;
  else dayStats.incorrect += 1;
  if (typeof window !== "undefined") {
    localStorage.setItem(STATS_KEY, JSON.stringify(history));
  }
}

