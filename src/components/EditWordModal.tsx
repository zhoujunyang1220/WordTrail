import React, { useState, useEffect } from "react";
import { X, Volume2, Save } from "lucide-react";
import { Word, Notebook } from "../types";
import { updateWord } from "../lib/storage";

interface EditWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word | null;
  notebooks: Notebook[];
  lang: "zh" | "en";
  onWordUpdated: () => void;
}

export default function EditWordModal({
  isOpen,
  onClose,
  word,
  notebooks,
  lang,
  onWordUpdated,
}: EditWordModalProps) {
  const [wordInput, setWordInput] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [pos, setPos] = useState("");
  const [chineseDefinition, setChineseDefinition] = useState("");
  const [englishDefinition, setEnglishDefinition] = useState("");
  const [rootAffix, setRootAffix] = useState("");
  const [memoryHook, setMemoryHook] = useState("");
  const [phrasesInput, setPhrasesInput] = useState("");
  const [sentence1En, setSentence1En] = useState("");
  const [sentence1Zh, setSentence1Zh] = useState("");
  const [sentence2En, setSentence2En] = useState("");
  const [sentence2Zh, setSentence2Zh] = useState("");
  const [notebookId, setNotebookId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (word) {
      setWordInput(word.word);
      setPhonetic(word.phonetic);
      setPos(word.pos);
      setChineseDefinition(word.chineseDefinition);
      setEnglishDefinition(word.englishDefinition);
      setRootAffix(word.rootAffix || "");
      setMemoryHook(word.memoryHook || "");
      setPhrasesInput((word.phrases || []).join("\n"));
      setSentence1En(word.sentences?.[0]?.en || "");
      setSentence1Zh(word.sentences?.[0]?.zh || "");
      setSentence2En(word.sentences?.[1]?.en || "");
      setSentence2Zh(word.sentences?.[1]?.zh || "");
      setNotebookId(word.notebookId);
      setNotes(word.notes || "");
    }
  }, [word]);

  if (!isOpen || !word) return null;

  const t = {
    title: lang === "zh" ? "编辑单词" : "Edit Word",
    wordLabel: lang === "zh" ? "英文单词" : "English Word",
    posLabel: lang === "zh" ? "词性" : "Part of Speech",
    phoneticLabel: lang === "zh" ? "音标" : "Phonetic",
    chineseLabel: lang === "zh" ? "中文释义" : "Chinese Definition",
    englishLabel: lang === "zh" ? "英文释义" : "English Definition",
    rootLabel: lang === "zh" ? "词根词缀" : "Root & Affix",
    hookLabel: lang === "zh" ? "记忆挂钩" : "Memory Hook",
    phrasesLabel: lang === "zh" ? "常用搭配（每行一个）" : "Phrases (one per line)",
    exEn: lang === "zh" ? "英文例句" : "English Example",
    exZh: lang === "zh" ? "例句翻译" : "Example Translation",
    notebookLabel: lang === "zh" ? "所属笔记本" : "Notebook",
    notesLabel: lang === "zh" ? "备注" : "Notes",
    cancel: lang === "zh" ? "取消" : "Cancel",
    save: lang === "zh" ? "保存修改" : "Save Changes",
    validateError: lang === "zh" ? "单词和中文字义为必填项！" : "Word and Chinese definition are required!",
  };

  const handleSave = () => {
    if (!wordInput.trim() || !chineseDefinition.trim()) {
      alert(t.validateError);
      return;
    }
    const phrases = phrasesInput
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const sentences = [];
    if (sentence1En.trim() || sentence1Zh.trim()) {
      sentences.push({ en: sentence1En.trim(), zh: sentence1Zh.trim() });
    }
    if (sentence2En.trim() || sentence2Zh.trim()) {
      sentences.push({ en: sentence2En.trim(), zh: sentence2Zh.trim() });
    }
    const updated: Word = {
      ...word,
      word: wordInput.trim(),
      phonetic: phonetic.trim(),
      pos: pos.trim(),
      chineseDefinition: chineseDefinition.trim(),
      englishDefinition: englishDefinition.trim(),
      rootAffix: rootAffix.trim() || undefined,
      memoryHook: memoryHook.trim() || undefined,
      phrases: phrases.length > 0 ? phrases : undefined,
      sentences: sentences.length > 0 ? sentences : undefined,
      notebookId,
      notes: notes.trim() || undefined,
    };
    updateWord(updated);
    onWordUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.wordLabel}</label>
            <input type="text" value={wordInput} onChange={(e) => setWordInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.posLabel}</label>
              <input type="text" value={pos} onChange={(e) => setPos(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phoneticLabel}</label>
              <input type="text" value={phonetic} onChange={(e) => setPhonetic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.chineseLabel}</label>
            <input type="text" value={chineseDefinition} onChange={(e) => setChineseDefinition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.englishLabel}</label>
            <input type="text" value={englishDefinition} onChange={(e) => setEnglishDefinition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.rootLabel}</label>
            <input type="text" value={rootAffix} onChange={(e) => setRootAffix(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.hookLabel}</label>
            <input type="text" value={memoryHook} onChange={(e) => setMemoryHook(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phrasesLabel}</label>
            <textarea value={phrasesInput} onChange={(e) => setPhrasesInput(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.exEn} / {t.exZh}</label>
            <input type="text" value={sentence1En} onChange={(e) => setSentence1En(e.target.value)} placeholder="English 1"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs mb-1" />
            <input type="text" value={sentence1Zh} onChange={(e) => setSentence1Zh(e.target.value)} placeholder="中文 1"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs mb-1" />
            <input type="text" value={sentence2En} onChange={(e) => setSentence2En(e.target.value)} placeholder="English 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs mb-1" />
            <input type="text" value={sentence2Zh} onChange={(e) => setSentence2Zh(e.target.value)} placeholder="中文 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.notebookLabel}</label>
              <select value={notebookId} onChange={(e) => setNotebookId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs">
                {notebooks.map((nb) => (
                  <option key={nb.id} value={nb.id}>{nb.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.notesLabel}</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs" />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950 rounded-b-2xl">
          <button onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition">
            {t.cancel}
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
            <Save className="w-4 h-4" /> {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
