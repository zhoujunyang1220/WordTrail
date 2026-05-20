import React, { useState } from "react";
import { 
  Sparkles, FileText, Upload, CheckSquare, Square, Check, RefreshCw, Bookmark,
  BookOpen, ChevronRight, HelpCircle, Save, Info, AlertCircle 
} from "lucide-react";
import { CandidateWord, Notebook, Word } from "../types";
import { createNewWord } from "../lib/storage";

interface TextImportScannerProps {
  notebooks: Notebook[];
  defaultNotebookId: string;
  onImportComplete: () => void;
  lang: "zh" | "en";
}

export default function TextImportScanner({
  notebooks,
  defaultNotebookId,
  onImportComplete,
  lang,
}: TextImportScannerProps) {
  const [inputText, setInputText] = useState("");
  const [level, setLevel] = useState("CET-6");
  const [notebookId, setNotebookId] = useState(defaultNotebookId);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [candidates, setCandidates] = useState<CandidateWord[]>([]);
  
  // Importer state
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<{ success: number; total: number } | null>(null);

  const levels = [
    { key: "CET-4", label: lang === "zh" ? "四级 (CET-4)" : "Ielt 5 / CET4" },
    { key: "CET-6", label: lang === "zh" ? "六级 (CET-6)" : "Ielt 6 / CET6" },
    { key: "IELTS", label: lang === "zh" ? "雅思 (IELTS)" : "IELTS" },
    { key: "TOEFL", label: lang === "zh" ? "托福 (TOEFL)" : "TOEFL" },
    { key: "GRE", label: lang === "zh" ? "GRE 核心" : "GRE Core" }
  ];

  const t = {
    title: lang === "zh" ? "智能提取与沉浸式扫书" : "Vocabulary Extract & Text Scan",
    sub: lang === "zh" 
      ? "粘贴或上传你最近正在阅读的任何英文文章（新闻、网页、PDF），AI 将根据你选定的水平标准，一键过滤掉简单词，精准提取核心生词进库。" 
      : "Paste or import custom learning materials or news. AI will automatically filters easy words and extract core candidates for Ebbinghaus study.",
    threshold: lang === "zh" ? "扫词过滤阈值：" : "Prune Threshold:",
    emptyErr: lang === "zh" ? "请先粘贴需要分析的英文篇章或上传 TXT 文件。" : "Please paste or drop custom article text first.",
    readErr: lang === "zh" ? "无法读取该文件，请核实文件编码。" : "Failed to read text file. Ensure it is text encoded.",
    scanErr: lang === "zh" ? "分析文章失败，请检查网络或稍后重试。" : "AI analyzing failed. Please check backend config/credentials.",
    noWordsFound: lang === "zh" 
      ? "分析完成！在此水平下未探查到更多生词。你可以将扫描基准上调，或者替换其他文章。" 
      : "Scan complete! No words above your baseline were found. Try toggling a higher difficulty tier.",
    successReport: (count: number) => lang === "zh" 
      ? `完美收录！已深度精雕并导入 ${count} 个定制生词卡，加入艾宾浩斯复习流。` 
      : `Success! Auto-molded and imported ${count} customized vocabulary cards into review cycle.`,
    pasteLabel: lang === "zh" ? "粘贴英文读物大段文字：" : "Paste English reading materials below:",
    pasteLimit: lang === "zh" ? "长短皆宜，不限行数" : "Flexible length, supports complete copy",
    pastePlacer: lang === "zh" 
      ? "例如: As algorithms choose for us, serendipity is engineered out of our lives. Fleming famously found penicillin by sheer luck..." 
      : "Paste e-book files, journals, news feeds or custom paragraphs here...",
    sourceTitle: lang === "zh" ? "词汇来源与配置" : "Source Capture Options",
    source1: lang === "zh" ? "1. 直接粘贴段落" : "1. Paste Paragraphs",
    source1Desc: lang === "zh" ? "在左侧窗口直接粘贴需要阅读、扫盲的文章。" : "Directly duplicate your daily readings onto the field.",
    source2: lang === "zh" ? "2. 导入生词文本/文章" : "2. TXT / Markdown Scan",
    source2Desc: lang === "zh" ? "如果准备了生词库列表，可在这批量扫进。" : "Upload lists to build active cards fast.",
    fileBtn: lang === "zh" ? "选择本地文本文件" : "Import Text Document",
    fileBtnSub: lang === "zh" ? "支持 TXT / Markdown 格式" : "TXT or MD files supported",
    destNotebook: lang === "zh" ? "归属目标生词本" : "Destination Book",
    ctaScan: lang === "zh" ? "AI 智能精筛生词" : "Smart Filter with Gemini",
    ctaScanning: lang === "zh" ? "AI 正在地毯式扫描..." : "Analyzing structures...",
    deckTitle: (total: number) => lang === "zh" ? `筛出候选生词 (${total} 对)` : `Extracted Candidates (${total} cards)`,
    deckSub: lang === "zh" ? "勾选你想记住的单词，AI 将为它们自动精修音标、词缀与高频搭配。" : "Check words you want to import. AI will compile standard phonetic prefixes and contexts.",
    btnDeselect: lang === "zh" ? "全不选" : "Deselect All",
    btnSelectAll: lang === "zh" ? "全选" : "Select All",
    btnImportChecked: (count: number) => lang === "zh" ? `导入选定的 ${count} 个词` : `Import Selected ${count} Words`,
    importingState: (count: number) => lang === "zh" ? `AI 极速定制生成中 (${count}个)...` : `Card Architecting (${count} words)...`,
    btnGoBack: lang === "zh" ? "← 返回重新扫描" : "← Back & Re-scan",
    importTip: lang === "zh" ? "导入时将触发 AI 级定制：生成精细音标、中文释意、助记口诀与双语应用。" : "Upon importing, Gemini designs custom mnemonic, root analyses, and bilingual translations."
  };

  // Helper to handle text file imports
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setErrorMsg("");
      }
    };
    reader.onerror = () => {
      setErrorMsg(t.readErr);
    };
    reader.readAsText(file);
  };

  const handleScanText = async () => {
    if (!inputText.trim()) {
      setErrorMsg(t.emptyErr);
      return;
    }
    
    setIsScanning(true);
    setErrorMsg("");
    setCandidates([]);
    setImportReport(null);

    try {
      const resp = await fetch("/api/words/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText.trim(),
          userLevel: level
        }),
      });

      if (!resp.ok) {
        throw new Error("扫描提取失败: " + resp.status);
      }

      const result = await resp.json();
      if (result.candidates && Array.isArray(result.candidates)) {
        const cleaned: CandidateWord[] = result.candidates.map((item: any) => ({
          ...item,
          selected: true // default checked
        }));
        setCandidates(cleaned);
        if (cleaned.length === 0) {
          setErrorMsg(t.noWordsFound);
        }
      } else {
        throw new Error("模型格式异常");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(t.scanErr);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = candidates.every((c) => c.selected);
    setCandidates(
      candidates.map((c) => ({
        ...c,
        selected: !allSelected
      }))
    );
  };

  const toggleSelectCandidate = (index: number) => {
    setCandidates(
      candidates.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleImportChecked = async () => {
    const toImport = candidates.filter((c) => c.selected);
    if (toImport.length === 0) {
      setErrorMsg(lang === "zh" ? "未勾选生词！" : "Please select at least one word to import.");
      return;
    }

    setIsImporting(true);
    setErrorMsg("");
    let importCount = 0;

    try {
      // Loop over and create words with details from Gemini back-end
      for (const item of toImport) {
        try {
          const detailsResp = await fetch("/api/words/details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: item.word, context: item.contextSentence }),
          });
          
          if (detailsResp.ok) {
            const data = await detailsResp.json();
            createNewWord({
              word: data.word || item.word.toLowerCase(),
              phonetic: data.phonetic || "/.../",
              pos: data.pos || "adj.",
              chineseDefinition: data.chineseDefinition || item.quickTranslation,
              englishDefinition: data.englishDefinition || "",
              rootAffix: data.rootAffix || "",
              memoryHook: data.memoryHook || "",
              phrases: data.phrases || [],
              sentences: data.sentences || [
                { en: item.contextSentence, zh: "（来自阅读上下文）" }
              ],
              notebookId,
              notes: lang === "zh" ? `AI精选扫描(定制版)` : `AI Context Scan (Premium)`,
            });
            importCount++;
          } else {
            // fallback: basic import
            createNewWord({
              word: item.word.toLowerCase(),
              phonetic: "/.../",
              pos: "n.",
              chineseDefinition: item.quickTranslation,
              englishDefinition: "",
              sentences: [
                { en: item.contextSentence, zh: "（来自阅读上下文）" }
              ],
              notebookId,
              notes: lang === "zh" ? `AI精选扫描(简易版)` : `AI Context Scan (Basic)`
            });
            importCount++;
          }
        } catch (e) {
          createNewWord({
            word: item.word.toLowerCase(),
            phonetic: "/.../",
            pos: "n.",
            chineseDefinition: item.quickTranslation,
            englishDefinition: "",
            sentences: [
              { en: item.contextSentence, zh: "（来自阅读上下文）" }
            ],
            notebookId,
            notes: `Fallback Scan`
          });
          importCount++;
        }
      }

      setImportReport({ success: importCount, total: toImport.length });
      setCandidates([]);
      onImportComplete();
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === "zh" ? "导入中止，请重试。" : "Web socket error during mass import. Verify storage status.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8 space-y-6 transition-colors duration-200">
      
      {/* Upper info rows */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5.5 h-5.5 text-indigo-650 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.title}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {t.sub}
          </p>
        </div>

        {/* Level Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 md:mr-1">
            {t.threshold}
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-0.5 border border-slate-200/50 dark:border-slate-800">
            {levels.map((item) => (
              <button
                key={item.key}
                onClick={() => setLevel(item.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  level === item.key
                    ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-350 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
                }`}
              >
                {item.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/45 text-amber-800 dark:text-amber-400 text-xs flex gap-3 items-start transition-colors">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {importReport && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-400 text-xs flex gap-3 items-center transition-colors">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-450 shrink-0" />
          <div>
            {t.successReport(importReport.success)}
          </div>
        </div>
      )}

      {/* Input layout standard */}
      {candidates.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t.pasteLabel}</span>
              <span>{t.pasteLimit}</span>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.pastePlacer}
              className="w-full h-72 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-650 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none leading-relaxed resize-none font-sans transition-colors"
            />
          </div>

          <div className="bg-slate-50/75 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-5 transition-colors">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-indigo-600 [dark]:text-indigo-400" />
                {t.sourceTitle}
              </h4>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                <p>1. <strong>{t.source1}</strong>: {t.source1Desc}</p>
                <p>2. <strong>{t.source2}</strong>: {t.source2Desc}</p>
              </div>

              {/* Upload file area */}
              <div className="border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl p-4 text-center hover:border-indigo-400 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">{t.fileBtn}</span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-450 mt-1">{t.fileBtnSub}</span>
              </div>

              {/* Tagging book destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.destNotebook}
                </label>
                <select
                  value={notebookId}
                  onChange={(e) => setNotebookId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {notebooks.map((nb) => (
                    <option key={nb.id} value={nb.id}>
                      {nb.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleScanText}
              disabled={isScanning || !inputText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-950 text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t.ctaScanning}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t.ctaScan}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Candidate Words Collection Display */}
      {candidates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/[0.15] p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-650 dark:text-indigo-450" />
              <div>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  {t.deckTitle(candidates.length)}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-350 mt-0.5">
                  {t.deckSub}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-indigo-750 dark:text-indigo-400 hover:text-indigo-900 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 px-3 py-1.5 rounded-lg"
              >
                {candidates.every((c) => c.selected) ? t.btnDeselect : t.btnSelectAll}
              </button>

              <button
                onClick={handleImportChecked}
                disabled={isImporting || !candidates.some((c) => c.selected)}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-indigo-950 text-white flex items-center gap-1.5 px-4 py-2 rounded-xl"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t.importingState(candidates.filter((c) => c.selected).length)}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t.btnImportChecked(candidates.filter((c) => c.selected).length)}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((item, index) => (
              <div
                key={index}
                onClick={() => toggleSelectCandidate(index)}
                className={`p-4 rounded-xl border transition cursor-pointer flex gap-3 relative transition-all ${
                  item.selected
                    ? "bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-900"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="mt-1 shrink-0">
                  {item.selected ? (
                    <CheckSquare className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      {item.word}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
                      {item.difficultyLevel || "Uncommon"}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-900 dark:text-indigo-350 font-semibold bg-indigo-50/60 dark:bg-indigo-950/40 py-0.5 px-1.5 rounded inline-block">
                    {item.quickTranslation}
                  </p>

                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                    &ldquo;{item.contextSentence}&rdquo;
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3 items-center">
            <button
              onClick={() => setCandidates([])}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 self-start"
            >
              {t.btnGoBack}
            </button>
            
            <div className="text-[11px] text-slate-500 dark:text-slate-350 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              {t.importTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
