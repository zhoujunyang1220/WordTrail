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
  },
  {
    id: "notebook-reading",
    name: "学术精读与科技",
    description: "来自学术论文、英文新闻和专业书籍的词汇",
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700",
  },
  {
    id: "notebook-exam",
    name: "备考核心拔高",
    description: "雅思/托福、GRE等高难度核心高频词",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    color: "from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700",
  }
];

const SEED_WORDS: Word[] = [
  {
    id: "seed-1",
    word: "ubiquitous",
    phonetic: "/juːˈbɪkwɪtəs/",
    pos: "adj.",
    chineseDefinition: "无处不在的，普遍存在的",
    englishDefinition: "Present, appearing, or found everywhere.",
    rootAffix: "【词根】ubique (Latin) 表示“到处”。后缀 -ous 表示形容词，“满含…的”。",
    memoryHook: "谐音记忆：'you-be-quite-us'：你们都要安静（be quiet），因为老师【无处不在】地盯着我们。",
    phrases: ["ubiquitous technology (无处不在的技术)", "ubiquitous access (随时随地的访问)"],
    sentences: [
      {
        en: "Smartphones have become ubiquitous in daily life, reshaping how we communicate.",
        zh: "智能手机在日常生活中已变得无处不在，重塑了我们的交流方式。"
      },
      {
        en: "The brand's ubiquitous advertising campaign ensured that everyone knew their name.",
        zh: "该品牌铺天盖地的广告攻势确保了每个人都知道他们的名字。"
      }
    ],
    notebookId: "notebook-default",
    stage: 3, // Already reviewed slightly
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    lastReviewAt: Date.now() - 12 * 60 * 60 * 1000,
    nextReviewAt: Date.now() + 12 * 60 * 60 * 1000, // Due in 12 hours from now
    reviewHistory: [
      { timestamp: Date.now() - 36 * 60 * 1000, result: "correct", oldStage: 1, newStage: 2 },
      { timestamp: Date.now() - 12 * 60 * 60 * 1000, result: "correct", oldStage: 2, newStage: 3 }
    ]
  },
  {
    id: "seed-2",
    word: "ephemeral",
    phonetic: "/ɪˈfemərəl/",
    pos: "adj.",
    chineseDefinition: "短暂的，朝生暮死的",
    englishDefinition: "Lasting for a very short time.",
    rootAffix: "【词源】源自希腊语 ephemeros（仅一日的）。epi- (在...之上) + hemera (日/天)。",
    memoryHook: "联想记忆：e- (外) + phe- (发声/呈现)：露水蒸发后声音和现象在外面也只停留【短暂的一瞬】。",
    phrases: ["ephemeral beauty (短暂的美丽)", "ephemeral nature of fame (名声的瞬时性)"],
    sentences: [
      {
        en: "The beauty of cherry blossoms is beautiful but ephemeral, lasting only a few days.",
        zh: "樱花虽美但花期短暂，仅仅能持续几天时间。"
      },
      {
        en: "In the digital age, social media trends are highly ephemeral.",
        zh: "在数字时代，社交媒体上的潮流趋势往往如过眼云烟、稍纵即逝。"
      }
    ],
    notebookId: "notebook-reading",
    stage: 0, // Brand new
    createdAt: Date.now() - 1000,
    nextReviewAt: Date.now() - 5000, // Due now!
    reviewHistory: []
  },
  {
    id: "seed-3",
    word: "serendipity",
    phonetic: "/ˌserənˈdɪpəti/",
    pos: "n.",
    chineseDefinition: "（意外发现美好事物的）机缘，缘分，幸运的巧合",
    englishDefinition: "The occurrence and development of events by chance in a happy or beneficial way.",
    rootAffix: "【典故】源于波斯童话《塞伦迪普的三个王子》(The Three Princes of Serendip)，故事中王子总是能意外地发现奇珍异宝。",
    memoryHook: "记忆挂钩：'死人肚皮啼'（谐音）- 绝境逢生：相传古代勇士在废墟中以为别人死去了，耳朵贴在肚皮上居然听到啼哭声，【意外地撞大运】救出了生还者。",
    phrases: ["by sheer serendipity (纯属巧合)", "a serendipitous finding (意外的发现)"],
    sentences: [
      {
        en: "It was a scientific serendipity when Alexander Fleming discovered penicillin by accident.",
        zh: "当亚历山大·弗莱明偶然发现青霉素的时候，可以说是科学史上的一次奇妙机缘。"
      },
      {
        en: "Meeting my old school friend in a foreign train terminal was pure serendipity.",
        zh: "在国外的火车站台遇到我的老校友纯属幸运的巧合。"
      }
    ],
    notebookId: "notebook-exam",
    stage: 5, // Mastered or far in curve
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    lastReviewAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    nextReviewAt: Date.now() + 2 * 24 * 60 * 60 * 1000, // Due in 2 days
    reviewHistory: [
      { timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, result: "correct", oldStage: 1, newStage: 2 },
      { timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, result: "correct", oldStage: 2, newStage: 3 },
      { timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, result: "correct", oldStage: 3, newStage: 4 },
      { timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, result: "correct", oldStage: 4, newStage: 5 }
    ]
  }
];

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
