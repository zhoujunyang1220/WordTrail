with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Replace ALL occurrences of "word.trim()" that appear AFTER "catch" 
# by replacing them with the req.body version
lines = text.split("\n")
for i in range(len(lines)):
    lines[i] = lines[i].replace("word.trim()", "req.body.word?.trim() || \"\"")

text = "\n".join(lines)

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Done - replaced all word.trim() with req.body version")
