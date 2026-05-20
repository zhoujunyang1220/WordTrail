with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Find the Gemini initialization and insert local dict BEFORE it
idx = text.find("const ai = getGenAI();")
if idx < 0:
    print("Could not find marker")
else:
    # Find the line start
    line_start = text.rfind("\n", 0, idx) + 1
    
    local_dict_code = """    const key2 = (req.body.word || "").trim().toLowerCase();

    // Built-in local dictionary for instant results
    const localWords = {
      "ubiquitous": {"word":"ubiquitous","phonetic":"/juu02d0u02c8b026akw026atu0259s/","pos":"adj.","chineseDefinition":"u65e0u5904u4e0du5728u7684","englishDefinition":"Present everywhere."},
      "ephemeral": {"word":"ephemeral","phonetic":"/u026au02c8femu0259ru0259l/","pos":"adj.","chineseDefinition":"u77edu6682u7684","englishDefinition":"Lasting briefly."},
      "eloquent": {"word":"eloquent","phonetic":"/u02c8elu0259kwu0259nt/","pos":"adj.","chineseDefinition":"u53e3u624du597du7684","englishDefinition":"Fluent and persuasive."},
    };
    if (localWords[key2]) {
      return res.json(localWords[key2]);
    }

"""
    text = text[:line_start] + "    const { word, context } = req.body;\n    if (!word) return res.status(400).json({error: \"word required\"});\n" + local_dict_code + text[line_start:]
    
    with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
        f.write(text)
    print("Added local dict")
