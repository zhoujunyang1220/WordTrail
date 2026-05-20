with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")

# Find the catch block of /api/words/details
for i, line in enumerate(lines):
    if 'catch (error: any)' in line and i > 5:
        context_before = "\n".join(lines[max(0,i-15):i])
        if "/api/words/details" in context_before:
            print(f"Found details catch at line {i+1}")
            for j in range(i, min(i+10, len(lines))):
                if "console.error" in lines[j]:
                    indent = lines[j][:len(lines[j]) - len(lines[j].lstrip())]
                    insert_lines = [
                        indent + "  // Try local dictionary fallback",
                        indent + '  const localDict = {',
                        indent + '    "ubiquitous": {"word":"ubiquitous","phonetic":"/juu02d0u02c8b026akw026atu0259s/","pos":"adj.","chineseDefinition":"u65e0u5904u4e0du5728u7684uff0cu666eu904du5b58u5728u7684","englishDefinition":"Present everywhere."},',
                        indent + '    "ephemeral": {"word":"ephemeral","phonetic":"/u026au02c8femu0259ru0259l/","pos":"adj.","chineseDefinition":"u77edu6682u7684uff0cu8f6cu77acu5373u901du7684","englishDefinition":"Lasting briefly."},',
                        indent + '    "eloquent": {"word":"eloquent","phonetic":"/u02c8elu0259kwu0259nt/","pos":"adj.","chineseDefinition":"u53e3u624du597du7684uff0cu96c4u8fa9u7684","englishDefinition":"Fluent and persuasive."}',
                        indent + "  };",
                        indent + '  const w = (req.body?.word || "").trim().toLowerCase();',
                        indent + "  if (localDict[w]) {",
                        indent + "    return res.json(localDict[w]);",
                        indent + "  }",
                    ]
                    for k in range(len(insert_lines)-1, -1, -1):
                        lines.insert(j+1, insert_lines[k])
                    print(f"Inserted {len(insert_lines)} lines after line {j+1}")
                    break
            break

text = "\n".join(lines)
with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Done")
