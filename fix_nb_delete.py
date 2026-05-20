with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\App.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# The patch_app.py created a separate delete button OUTSIDE the notebook button
# This is invalid JSX. We need to remove it and add it INSIDE

# Find the pattern: </button>\n\n                    <button\n                      onClick={delete}
# Remove the standalone delete button block and restore just </button>
import re

# Pattern: a ) was removed from the replacement and it ended up with </button>\n<button delete>\n  );
# So the actual code has: </button>\n<button delete>\n  );

# Let's find it directly
idx = text.find("handleDeleteNotebook")

if idx > 0:
    # Go backwards to find the opening <button
    start_delete = text.rfind("<button", 0, idx)
    # Go back further to find the previous </button>
    prev_close = text.rfind("</button>", 0, start_delete)
    
    print(f"Delete button starts at {start_delete}, prev close at {prev_close}")
    
    # Go forward to find the closing </button> of delete button
    next_close = text.find("</button>", idx) + len("</button>")
    
    # Extract the delete button block
    delete_block = text[start_delete:next_close]
    print(f"Delete block: {repr(delete_block[:200])}")
    
    # Remove it - replace the delete block with nothing
    # But also need to fix the JSX: the return now has just one sibling (the notebook button)
    # Actually it should still have the ");" 
    text = text.replace(delete_block, "")
    
    with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\App.tsx", "w", encoding="utf-8") as f:
        f.write(text)
    
    print("Removed standalone delete button")
    
    # Now add delete icon INSIDE the notebook button
    # Find the numWords span and wrap it in a flex container with delete button
    old_span = '<span className={`text-[10px] px-2 py-0.5 rounded-full ${activeNotebook === nb.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-655"}`}>\n                        {numWords}\n                      </span>'
    new_block = '<div className="flex items-center gap-1">\n                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeNotebook === nb.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-655"}`}>\n                        {numWords}\n                      </span>\n                      <button\n                        onClick={(e) => { e.stopPropagation(); handleDeleteNotebook(nb.id); }}\n                        className={`p-1 rounded-full transition ${activeNotebook === nb.id ? "text-white/60 hover:text-white hover:bg-white/20" : "text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"}`}\n                        title={lang === "zh" ? "删除" : "Delete"}\n                      >\n                        <Trash2 className="w-3 h-3" />\n                      </button>\n                      </div>'
    if old_span in text:
        text = text.replace(old_span, new_block)
        print("Added inline delete button")
    else:
        print("Span pattern not found for button insertion")
        # Check what's there
        idx2 = text.find("rounded-full ${activeNotebook")
        if idx2 > 0:
            print(f"Found similar at {idx2}: {repr(text[idx2:idx2+200])}")
else:
    print("handleDeleteNotebook not found - already removed?")

with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\App.tsx", "w", encoding="utf-8") as f:
    f.write(text)
