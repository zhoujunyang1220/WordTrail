import re

with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\App.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Remove the standalone delete notebook button
old_delete_btn = (
    '                    </button>\n'
    '                    <button\n'
    '                      onClick={(e) => { e.stopPropagation(); handleDeleteNotebook(nb.id); }}\n'
    '                      className="p-1 text-[9px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"\n'
    '                      title={lang === "zh" ? "删除笔记本" : "Delete"}\n'
    '                    >\n'
    '                      <Trash2 className="w-3 h-3" />\n'
    '                    </button>\n'
    '                  );'
)
new_close = '                  );'
text = text.replace(old_delete_btn, new_close)

# Remove the fragment wrapper (<> and </>) that might have been added
text = text.replace("\n                    <>", "")
text = text.replace("\n                    </>", "")

# Update the emoji prefix
text = text.replace("🔖 {nb.name}", "{nb.name}")

# Add delete button inside the notebook button next to numWords
old_span = (
    '<span className={`text-[10px] px-2 py-0.5 rounded-full ${activeNotebook === nb.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-655"}`}>\n'
    '                        {numWords}\n'
    '                      </span>'
)
new_span = (
    '<div className="flex items-center gap-1">\n'
    '                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeNotebook === nb.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-655"}`}>\n'
    '                        {numWords}\n'
    '                      </span>\n'
    '                      <button\n'
    '                        onClick={(e) => { e.stopPropagation(); handleDeleteNotebook(nb.id); }}\n'
    '                        className={`p-1 rounded-full transition ${activeNotebook === nb.id ? "text-white/60 hover:text-white hover:bg-white/20" : "text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"}`}\n'
    '                        title={lang === "zh" ? "删除" : "Delete"}\n'
    '                      >\n'
    '                        <Trash2 className="w-3 h-3" />\n'
    '                      </button>\n'
    '                      </div>'
)
text = text.replace(old_span, new_span)

with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\App.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed notebook delete button placement")
