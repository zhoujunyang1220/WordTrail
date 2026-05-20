import re

with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\App.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update import for EditWordModal + StatsModal
text = text.replace(
    'import TextImportScanner from "./components/TextImportScanner";',
    'import TextImportScanner from "./components/TextImportScanner";\nimport EditWordModal from "./components/EditWordModal";\nimport StatsModal from "./components/StatsModal";\nimport { deleteNotebook, exportAllData, importAllData, checkinToday, getStreakData, StreakData, recordDailyStats, getStatsHistory } from "./lib/storage";'
)

# 2. Update lucide-react import
text = text.replace(
    'FileText, ArrowRight, Star, ExternalLink, HelpCircle, Save, Check, X',
    'FileText, ArrowRight, Star, ExternalLink, HelpCircle, Save, Check, X, Edit3, Download, Upload, Award, BarChart3, Flame'
)

# 3. Add new state variables after expandedWordId
text = text.replace(
    'const [expandedWordId, setExpandedWordId] = useState<string | null>(null);',
    'const [expandedWordId, setExpandedWordId] = useState<string | null>(null);\n  const [editingWord, setEditingWord] = useState<Word | null>(null);\n  const [isStatsOpen, setIsStatsOpen] = useState(false);\n  const [streakData, setStreakData] = useState<StreakData>(() => getStreakData());\n  const [showImportDialog, setShowImportDialog] = useState(false);\n  const [importText, setImportText] = useState("");'
)

# 4. Update reloadWords
text = text.replace(
    'const reloadWords = () => {\n    setWords(getWords());\n  };',
    'const reloadWords = () => {\n    setWords(getWords());\n    setStreakData(getStreakData());\n  };'
)

# 5. Add new functions before handleSpeak
text = text.replace(
    '  const handleSpeak = (text: string) => {',
    '  const handleEditWord = (word: Word) => {\n    setEditingWord(word);\n  };\n\n  const handleDeleteNotebook = (id: string) => {\n    if (window.confirm(lang === "zh" ? "确定删除此笔记本吗？单词不会被删除。" : "Delete this notebook? Words will not be deleted.")) {\n      deleteNotebook(id);\n      setNotebooks(getNotebooks());\n      if (activeNotebook === id) setActiveNotebook("all");\n    }\n  };\n\n  const handleCheckin = () => {\n    const result = checkinToday();\n    setStreakData(result);\n  };\n\n  const handleExport = () => {\n    const data = exportAllData();\n    const blob = new Blob([data], { type: "application/json" });\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement("a");\n    a.href = url;\n    a.download = `wordtrail-backup-${new Date().toISOString().split("T")[0]}.json`;\n    a.click();\n    URL.revokeObjectURL(url);\n  };\n\n  const handleImportFromFile = () => {\n    const input = document.createElement("input");\n    input.type = "file";\n    input.accept = ".json";\n    input.onchange = (e: any) => {\n      const file = e.target.files?.[0];\n      if (!file) return;\n      const reader = new FileReader();\n      reader.onload = (ev) => {\n        try {\n          const jsonText = ev.target?.result as string;\n          const result = importAllData(jsonText);\n          setWords(result.words);\n          setNotebooks(result.notebooks);\n          alert(lang === "zh" ? `成功导入 ${result.words.length} 个单词` : `Imported ${result.words.length} words`);\n        } catch (e) {\n          alert(lang === "zh" ? "导入失败，请检查数据格式" : "Import failed, check data format");\n        }\n      };\n      reader.readAsText(file);\n    };\n    input.click();\n  };\n\n  const handleSpeak = (text: string) => {'
)

# 6. Add recordDailyStats in handleRateReview
text = text.replace(
    'const updated = registerReviewResult(currentReviewWord.id, result);\n    reloadWords();',
    'const updated = registerReviewResult(currentReviewWord.id, result);\n    recordDailyStats(result);\n    reloadWords();'
)

# 7. Add Edit button in expanded word details
text = text.replace(
    '朗读发音 (Speak)',
    '朗读发音'
)
# Need to find the speak block and add edit button
old_speak_block = '<div className="flex gap-2">\n                                <button\n                                  onClick={() => handleSpeak(item.word)}\n                                  className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-300 flex items-center gap-1.5 transition select-none"\n                                >\n                                  <Volume2 className="w-3.5 h-3.5" />\n                                  朗读发音\n                                </button>\n                              </div>'
new_speak_block = '<div className="flex gap-2">\n                                <button\n                                  onClick={() => handleSpeak(item.word)}\n                                  className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-300 flex items-center gap-1.5 transition select-none"\n                                >\n                                  <Volume2 className="w-3.5 h-3.5" />\n                                  朗读发音\n                                </button>\n                                <button\n                                  onClick={() => handleEditWord(item)}\n                                  className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-850 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 transition select-none"\n                                >\n                                  <Edit3 className="w-3.5 h-3.5" />\n                                  编辑\n                                </button>\n                              </div>'
if old_speak_block in text:
    text = text.replace(old_speak_block, new_speak_block)
    print("Replaced speak block")
else:
    print("Speak block NOT found - checking alternatives")
    # Fallback: find any Volume2 button
    idx = text.find("Volume2")
    print(f"Volume2 found at index: {idx}")
    print(f"Context: {text[idx:idx+300]}")

# 8. Add header buttons - find the dark mode toggle block
old_header_end = '<button\n              onClick={() => setDarkMode(!darkMode)}\n              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold select-none border border-slate-200/40 dark:border-slate-800/60"\n              title="深浅模式 / Toggle Theme"\n            >\n              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}\n              <span className="hidden xs:inline">{darkMode ? T.themeLight : T.themeDark}</span>\n            </button>\n          </div>'
new_header_end = '<button\n              onClick={() => { handleCheckin(); }}\n              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold select-none border border-slate-200/40 dark:border-slate-800/60"\n              title="签到打卡"\n            >\n              <Flame className={`w-4 h-4 ${streakData.currentStreak > 0 ? "text-orange-500" : "text-slate-500"}`} />\n              <span className="text-[10px] font-bold">{streakData.currentStreak}</span>\n            </button>\n            <button\n              onClick={() => setIsStatsOpen(true)}\n              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold select-none border border-slate-200/40 dark:border-slate-800/60"\n              title="学习统计"\n            >\n              <BarChart3 className="w-4 h-4 text-indigo-500" />\n            </button>\n            <button\n              onClick={() => handleExport()}\n              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold select-none border border-slate-200/40 dark:border-slate-800/60"\n              title="导出数据"\n            >\n              <Download className="w-4 h-4 text-emerald-500" />\n            </button>\n            <button\n              onClick={() => handleImportFromFile()}\n              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold select-none border border-slate-200/40 dark:border-slate-800/60"\n              title="导入数据"\n            >\n              <Upload className="w-4 h-4 text-amber-500" />\n            </button>\n            <button\n              onClick={() => setDarkMode(!darkMode)}\n              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold select-none border border-slate-200/40 dark:border-slate-800/60"\n              title="深浅模式 / Toggle Theme"\n            >\n              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}\n              <span className="hidden xs:inline">{darkMode ? T.themeLight : T.themeDark}</span>\n            </button>\n          </div>'
if old_header_end in text:
    text = text.replace(old_header_end, new_header_end)
    print("Replaced header end")
else:
    print("Header end pattern NOT found")
    # Find '深浅模式 / Toggle Theme' as fallback
    idx = text.find("深浅模式 / Toggle Theme")
    if idx > 0:
        print(f"Found '深浅模式' at {idx}")
        print(text[idx-100:idx+10])

# 9. Add delete notebook button
old_nb_end = '<span className={`text-[10px] px-2 py-0.5 rounded-full ${activeNotebook === nb.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-655"}`}>\n                        {numWords}\n                      </span>\n                    </button>'
new_nb_end = '<span className={`text-[10px] px-2 py-0.5 rounded-full ${activeNotebook === nb.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-655"}`}>\n                        {numWords}\n                      </span>\n                    </button>\n                    <button\n                      onClick={(e) => { e.stopPropagation(); handleDeleteNotebook(nb.id); }}\n                      className="p-1 text-[9px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"\n                      title={lang === "zh" ? "删除笔记本" : "Delete"}\n                    >\n                      <Trash2 className="w-3 h-3" />\n                    </button>'
if old_nb_end in text:
    text = text.replace(old_nb_end, new_nb_end)
    print("Replaced notebook end")
else:
    print("Notebook end pattern NOT found")
    nb_idx = text.find('"bg-white/20 text-white"')
    print(f"nb bg pattern at {nb_idx}")
    print(text[nb_idx:nb_idx+200])

# 10. Add modal mounts
old_modal_end = '<AddWordModal\n        isOpen={isAddOpen}\n        onClose={() => setIsAddOpen(false)}\n        notebooks={notebooks}\n        defaultNotebookId={notebooks[0]?.id || "notebook-default"}\n        lang={lang}\n        onWordAdded={() => {\n          reloadWords();\n        }}\n      />\n    </div>\n  );\n}'
new_modal_end = '<AddWordModal\n        isOpen={isAddOpen}\n        onClose={() => setIsAddOpen(false)}\n        notebooks={notebooks}\n        defaultNotebookId={notebooks[0]?.id || "notebook-default"}\n        lang={lang}\n        onWordAdded={() => {\n          reloadWords();\n        }}\n      />\n      <EditWordModal\n        isOpen={editingWord !== null}\n        onClose={() => setEditingWord(null)}\n        word={editingWord}\n        notebooks={notebooks}\n        lang={lang}\n        onWordUpdated={() => {\n          reloadWords();\n        }}\n      />\n      <StatsModal\n        isOpen={isStatsOpen}\n        onClose={() => setIsStatsOpen(false)}\n        lang={lang}\n        totalWords={words.length}\n        masteredWords={masteryWords.length}\n      />\n    </div>\n  );\n}'
if old_modal_end in text:
    text = text.replace(old_modal_end, new_modal_end)
    print("Replaced modal mount end")
else:
    print("Modal mount pattern NOT found")
    add_idx = text.find("<AddWordModal")
    print(f"AddWordModal at {add_idx}")

with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\App.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("DONE writing file")
