import React, { useState } from "react";
import { X, Sparkles, Loader2, Plus, Volume2, Save, HelpCircle } from "lucide-react";
import { Word, Notebook } from "../types";
import { lookupLocal } from "../lib/localDictionary";
import { createNewWord } from "../lib/storage";

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: Notebook[];
  defaultNotebookId: string;
  onWordAdded: (word: Word) => void;
  lang: "zh" | "en";
}

export default function AddWordModal({
  isOpen,
  onClose,
  notebooks,
  defaultNotebookId,
  onWordAdded,
  lang,
}: AddWordModalProps) {
  const [wordInput, setWordInput] = useState("");
  const [notebookId, setNotebookId] = useState(defaultNotebookId);
  const [notes, setNotes] = useState("");
  
  // Scraped/Generated States
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedData, setGeneratedData] = useState<Partial<Word> | null>(null);

  // Manual Fields (Fallbacks or editable fields after AI generation)
  const [pos, setPos] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [chineseDefinition, setChineseDefinition] = useState("");
  const [englishDefinition, setEnglishDefinition] = useState("");
  const [rootAffix, setRootAffix] = useState("");
  const [memoryHook, setMemoryHook] = useState("");
  const [phrasesInput, setPhrasesInput] = useState("");
  const [sentence1En, setSentence1En] = useState("");
  const [sentence1Zh, setSentence1Zh] = useState("");
  const [sentence2En, setSentence2En] = useState("");
  const [sentence2Zh, setSentence2Zh] = useState("");

  if (!isOpen) return null;

  // UI Strings
  const t = {
    title: lang === "zh" ? "添加新单词 / 词组" : "Add Word / Phrase",
    subtitle: lang === "zh" ? "用 AI 自动查询音标、释义、科学词缀及趣味联想。" : "AI automatically details phonetics, translations, roots, and associations.",
    wordLabel: lang === "zh" ? "英文单词 / 短语" : "English Word / Phrase",
    aiLookupBtn: lang === "zh" ? "AI 智能查询" : "AI Lookup",
    lookingUp: lang === "zh" ? "正在查询..." : "Looking up...",
    manualTextPrompt: lang === "zh" ? "输入单词，点击 “AI 智能查询”" : "Enter word and tap 'AI Lookup'",
    manualTextDetails: lang === "zh" ? "自动补全其IPA国际音标，剖析中英文义，以及艾宾浩斯定制记忆技巧。" : "Automatically parses standard IPA details, bilingual meanings, and memory keys.",
    manualInstead: lang === "zh" ? "或者：我想完全自己手动填写 ➔" : "Or: I want to fill in details manually ➔",
    posLabel: lang === "zh" ? "词性" : "Part of Speech",
    phoneticLabel: lang === "zh" ? "音标 (IPA)" : "Phonetic Pronunciation (IPA)",
    chineseLabel: lang === "zh" ? "中文核心释义 (必填)" : "Chinese Definition (Required)",
    englishLabel: lang === "zh" ? "英文释义 (可选)" : "English Definition (Optional)",
    memoryKitTitle: lang === "zh" ? "艾宾浩斯智能助记" : "Scientific Memory Booster",
    etymLabel: lang === "zh" ? "词源、词缀与构造逻辑" : "Root & Prefix Breakdown",
    hookLabel: lang === "zh" ? "趣味记忆挂钩 (Memory Hook)" : "Creative Memory Association Hook",
    collocationLabel: lang === "zh" ? "高频搭配 / 常见习语 (每行一个)" : "Collocations / Key Phrases (One per line)",
    examplesTitle: lang === "zh" ? "双语互动例句" : "Bilingual Target Sentences",
    exEn: lang === "zh" ? "英文例句" : "English Example Sentence",
    exZh: lang === "zh" ? "例句汉译" : "Example Translation",
    targetNotebook: lang === "zh" ? "归属生词书" : "Destined Notebook",
    personalNotes: lang === "zh" ? "点拨笔记 / 私人备注 (选填)" : "Study Notes / Context Snippets",
    footerHint: lang === "zh" ? "新单词将进入艾宾浩斯 0 阶段，启动科学间隔复习。" : "Active word will join Ebbinghaus Stage 0 spaced-repetition loop.",
    cancel: lang === "zh" ? "取消" : "Cancel",
    save: lang === "zh" ? "保存并记忆" : "Save & Learn",
    validateError: lang === "zh" ? "单词和中文核心释义为必有项！" : "Word spelling and Chinese definition are required!",
    aiFailError: lang === "zh" ? "AI 分析词汇失败，请确认后重试，或切换为手动填写。" : "AI analysis failed. Please retry or click manual input.",
    aiInputRequired: lang === "zh" ? "请输入单词后再进行 AI 智能分析" : "Please input a word before making an AI request.",
  };

  const handleGenerateAI = async () => {
    if (!wordInput.trim()) {
      setErrorMsg(t.aiInputRequired);
      return;
    }
    setErrorMsg("");
    setIsGenerating(true);
    setGeneratedData(null);

    try {
      const resp = await fetch("/api/words/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: wordInput.trim() }),
      });

      if (!resp.ok) {
        throw new Error("API request failed with status " + resp.status);
      }

      const data = await resp.json();
      setGeneratedData(data);
      
      // Auto fill form states
      setPos(data.pos || "n.");
      setPhonetic(data.phonetic || "");
      setChineseDefinition(data.chineseDefinition || "");
      setEnglishDefinition(data.englishDefinition || "");
      setRootAffix(data.rootAffix || "");
      setMemoryHook(data.memoryHook || "");
      setPhrasesInput(data.phrases?.join("\n") || "");
      
      if (data.sentences && data.sentences.length > 0) {
        setSentence1En(data.sentences[0].en || "");
        setSentence1Zh(data.sentences[0].zh || "");
        if (data.sentences.length > 1) {
          setSentence2En(data.sentences[1].en || "");
          setSentence2Zh(data.sentences[1].zh || "");
        } else {
          setSentence2En("");
          setSentence2Zh("");
        }
      } else {
        setSentence1En("");
        setSentence1Zh("");
        setSentence2En("");
        setSentence2Zh("");
      }
    } catch (err: any) {
      console.error(err);
      // Try local dictionary fallback
      const localResult = lookupLocal(wordInput.trim());
      if (localResult) {
        setGeneratedData(localResult);
        setPos(localResult.pos || "n.");
        setPhonetic(localResult.phonetic || "");
        setChineseDefinition(localResult.chineseDefinition || "");
        setEnglishDefinition(localResult.englishDefinition || "");
        setRootAffix(localResult.rootAffix || "");
        setMemoryHook(localResult.memoryHook || "");
        setPhrasesInput(localResult.phrases?.join("\n") || "");
        if (localResult.sentences && localResult.sentences.length > 0) {
          setSentence1En(localResult.sentences[0].en || "");
          setSentence1Zh(localResult.sentences[0].zh || "");
          if (localResult.sentences.length > 1) {
            setSentence2En(localResult.sentences[1].en || "");
            setSentence2Zh(localResult.sentences[1].zh || "");
          }
        }
        return; // Success from local dict, skip error
      }
      setErrorMsg(t.aiFailError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualEditInit = () => {
    setGeneratedData({}); // trigger edit form empty state
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    if (!wordInput.trim() || !chineseDefinition.trim()) {
      setErrorMsg(t.validateError);
      return;
    }

    const collocations = phrasesInput
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const targetSentences = [];
    if (sentence1En.trim()) {
      targetSentences.push({
        en: sentence1En.trim(),
        zh: sentence1Zh.trim(),
      });
    }
    if (sentence2En.trim()) {
      targetSentences.push({
        en: sentence2En.trim(),
        zh: sentence2Zh.trim(),
      });
    }

    const payload = {
      word: wordInput.trim().toLowerCase(),
      phonetic: phonetic.trim(),
      pos: pos.trim(),
      chineseDefinition: chineseDefinition.trim(),
      englishDefinition: englishDefinition.trim(),
      rootAffix: rootAffix.trim() || undefined,
      memoryHook: memoryHook.trim() || undefined,
      phrases: collocations.length > 0 ? collocations : undefined,
      sentences: targetSentences.length > 0 ? targetSentences : undefined,
      notebookId,
      notes: notes.trim() || undefined,
    };

    const newWord = createNewWord(payload);
    onWordAdded(newWord);
    
    // Clear state
    setWordInput("");
    setGeneratedData(null);
    setPos("");
    setPhonetic("");
    setChineseDefinition("");
    setEnglishDefinition("");
    setRootAffix("");
    setMemoryHook("");
    setPhrasesInput("");
    setSentence1En("");
    setSentence1Zh("");
    setSentence2En("");
    setSentence2Zh("");
    setNotes("");
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {t.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Word Inputs & AI Trigger */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.wordLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ubiquitous, ephemeral..."
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm transition-colors duration-150"
                  id="add-word-input"
                />
                {wordInput.trim() && (
                  <button
                    onClick={() => handleSpeak(wordInput)}
                    title="Speak"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating || !wordInput.trim()}
              className="w-full sm:col-span-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900/40 text-white font-medium py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.lookingUp}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t.aiLookupBtn}
                </>
              )}
            </button>
          </div>

          {!generatedData && !isGenerating && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
              <Sparkles className="w-8 h-8 text-indigo-400 dark:text-indigo-550 mb-2" />
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.manualTextPrompt}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm text-center">
                {t.manualTextDetails}
              </p>
              <button
                onClick={handleManualEditInit}
                className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {t.manualInstead}
              </button>
            </div>
          )}

          {/* Form details after AI details or manual trigger */}
          {(generatedData || isGenerating) && (
            <div className={`space-y-4 transition-opacity duration-350 ${isGenerating ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
              
              {/* Pos & Phonetics */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.posLabel}
                  </label>
                  <input
                    type="text"
                    value={pos}
                    onChange={(e) => setPos(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    placeholder="adj., n., v."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.phoneticLabel}
                  </label>
                  <input
                    type="text"
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    placeholder="/.../"
                  />
                </div>
              </div>

              {/* Chinese & English Definitions */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t.chineseLabel}
                </label>
                <input
                  type="text"
                  value={chineseDefinition}
                  onChange={(e) => setChineseDefinition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  placeholder={lang === "zh" ? "输入核心翻译含义" : "Enter Core Meaning"}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t.englishLabel}
                </label>
                <textarea
                  value={englishDefinition}
                  onChange={(e) => setEnglishDefinition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs h-14"
                  placeholder="Direct english translation or definition phrase..."
                />
              </div>

              {/* Memory Aid Section */}
              <div className="bg-gradient-to-tr from-amber-500/[0.03] to-orange-500/[0.03] dark:from-amber-900/[0.06] dark:to-orange-900/[0.06] p-4 rounded-xl border border-amber-500/10 dark:border-amber-900/30 space-y-3">
                <div className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-medium text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {t.memoryKitTitle}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t.etymLabel}
                    </label>
                    <textarea
                      value={rootAffix}
                      onChange={(e) => setRootAffix(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs h-16 resize-none"
                      placeholder="e.g. sub- (under) + merge (sink)..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t.hookLabel}
                    </label>
                    <textarea
                      value={memoryHook}
                      onChange={(e) => setMemoryHook(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs h-16 resize-none"
                      placeholder="Mnemonic link, wordplay, or phonetic similarity hook..."
                    />
                  </div>
                </div>
              </div>

              {/* Collocations */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t.collocationLabel}
                </label>
                <textarea
                  value={phrasesInput}
                  onChange={(e) => setPhrasesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs h-14 resize-none"
                  placeholder="e.g. ubiquitous influence&#10;ubiquitous access"
                />
              </div>

              {/* Example Sentences */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{t.examplesTitle}</span>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 gap-1.5">
                    <input
                      type="text"
                      value={sentence1En}
                      onChange={(e) => setSentence1En(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      placeholder={`${t.exEn} 1`}
                    />
                    <input
                      type="text"
                      value={sentence1Zh}
                      onChange={(e) => setSentence1Zh(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      placeholder={`${t.exZh} 1`}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 gap-1.5">
                    <input
                      type="text"
                      value={sentence2En}
                      onChange={(e) => setSentence2En(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-755 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      placeholder={`${t.exEn} 2`}
                    />
                    <input
                      type="text"
                      value={sentence2Zh}
                      onChange={(e) => setSentence2Zh(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-755 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      placeholder={`${t.exZh} 2`}
                    />
                  </div>
                </div>
              </div>

              {/* Notebook & Custom Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.targetNotebook}
                  </label>
                  <select
                    value={notebookId}
                    onChange={(e) => setNotebookId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    {notebooks.map((nb) => (
                      <option key={nb.id} value={nb.id}>
                        {nb.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.personalNotes}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    placeholder="e.g. From Economist, issue 2..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-slate-50 dark:bg-slate-950 rounded-b-2xl gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            {t.footerHint}
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!chineseDefinition.trim() || !wordInput.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-indigo-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
