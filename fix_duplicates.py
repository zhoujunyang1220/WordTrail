import sys
with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Remove the duplicate const { word, context } that was added
text = text.replace(
    '    const { word, context } = req.body;\n    if (!word) return res.status(400).json({error: "word required"});\n',
    ""
)

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed duplicates")

# Check if it compiles now
import subprocess
result = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, cwd="D:\\codex\\WordTrail\\-WordTrail-main")
if result.returncode == 0:
    print("Compiles OK!")
else:
    # Show only TS errors
    for line in result.stderr.split("\n"):
        if "error TS" in line:
            print(line.strip())
