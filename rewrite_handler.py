import sys
with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Find the /api/words/details handler
start = text.find('app.post("/api/words/details"')
end = text.find("// REST API endpoint: extract", start)

if start < 0 or end < 0:
    print("Could not find handler boundaries")
    sys.exit(1)

old_handler = text[start:end]

# Build new handler - MUST use ASCII-safe characters or properly encoded unicode
new_handler = '''
app.post("/api/words/details", async (req, res) => {
  try {
    const { word, context } = req.body;
    if (!word || typeof word !== "string" || word.trim() === "") {
      return res.status(400).json({ error: "Word parameter is required." });
    }

    const key = word.trim().toLowerCase();
    
    // Built-in local dictionary for instant offline results
    const localDict = {
      "ubiquitous": { "word": "ubiquitous", "phonetic": "/ju\u02d0\u02c8b\u026akw\u026at\u0259s/", "pos": "adj.", "chineseDefinition": "\u65e0\u5904\u4e0d\u5728\u7684", "englishDefinition": "Present everywhere.", "rootAffix": "\u8bcd\u6839 ubique \u201c\u5230\u5904\u201d", "memoryHook": "\u8c10\u97f3: you-be-quite-us", "phrases": ["ubiquitous technology", "ubiquitous access"], "sentences": [{"en": "Smartphones have become ubiquitous.", "zh": "\u667a\u80fd\u624b\u673a\u5df2\u65e0\u5904\u4e0d\u5728\u3002"}, {"en": "The brand is ubiquitous.", "zh": "\u8be5\u54c1\u724c\u65e0\u5904\u4e0d\u5728\u3002"}] },
      "ephemeral": { "word": "ephemeral", "phonetic": "/\u026a\u02c8fem\u0259r\u0259l/", "pos": "adj.", "chineseDefinition": "\u77ed\u6682\u7684\uff0c\u8f6c\u77ac\u5373\u901d\u7684", "englishDefinition": "Lasting a very short time.", "rootAffix": "\u5e0c\u814a\u8bed ephemeros \u201c\u4ec5\u4e00\u65e5\u7684\u201d", "memoryHook": "e- + phe- = \u5916\u5728\u5448\u73b0\u7684\u77ed\u6682\u4e00\u77ac", "phrases": ["ephemeral beauty", "ephemeral nature"], "sentences": [{"en": "Cherry blossoms are beautiful but ephemeral.", "zh": "\u6a31\u82b1\u867d\u7f8e\u4f46\u82b1\u671f\u77ed\u6682\u3002"}, {"en": "Fame is ephemeral.", "zh": "\u540d\u58f0\u662f\u77ed\u6682\u7684\u3002"}] },
      "eloquent": { "word": "eloquent", "phonetic": "/\u02c8el\u0259kw\u0259nt/", "pos": "adj.", "chineseDefinition": "\u53e3\u624d\u597d\u7684\uff0c\u96c4\u8fa9\u7684", "englishDefinition": "Fluent or persuasive in speaking or writing.", "rootAffix": "\u8bcd\u6839 loqu- \u201c\u8bf4\u201d", "memoryHook": "e-\u5f80\u5916 + loqu-\u8bf4 = \u80fd\u8bf4\u4f1a\u9053", "phrases": ["an eloquent speaker", "eloquent silence"], "sentences": [{"en": "She delivered an eloquent speech.", "zh": "\u5979\u53d1\u8868\u4e86\u52a8\u4eba\u7684\u6f14\u8bf4\u3002"}, {"en": "His writing is clear and eloquent.", "zh": "\u4ed6\u7684\u6587\u7ae0\u6e05\u6670\u6709\u8bf4\u670d\u529b\u3002"}] },
      "resilient": { "word": "resilient", "phonetic": "/r\u026a\u02c8z\u026ali\u0259nt/", "pos": "adj.", "chineseDefinition": "\u6709\u97e7\u6027\u7684\uff0c\u575a\u97e7\u4e0d\u62d4\u7684", "englishDefinition": "Able to recover quickly from difficulties.", "rootAffix": "\u8bcd\u6839 salire- \u201c\u8df3\u201d (re-\u56de + sil-\u8df3 = \u5f39\u56de)", "memoryHook": "re(\u518d\u6b21) + sil(\u8df3) = \u9047\u5230\u631b\u6298\u80fd\u91cd\u65b0\u632f\u4f5c", "phrases": ["resilient economy", "resilient spirit"], "sentences": [{"en": "Children are often more resilient than adults think.", "zh": "\u5b69\u5b50\u5f80\u5f80\u6bd4\u5927\u4eba\u60f3\u8c61\u7684\u66f4\u6709\u97e7\u6027\u3002"}, {"en": "The economy proved remarkably resilient.", "zh": "\u7ecf\u6d4e\u8868\u73b0\u51fa\u60ca\u4eba\u7684\u97e7\u6027\u3002"}] },
      "ambiguous": { "word": "ambiguous", "phonetic": "/\u00e6m\u02c8b\u026a\u0261ju\u0259s/", "pos": "adj.", "chineseDefinition": "\u6a21\u68f1\u4e24\u53ef\u7684\uff0c\u542b\u7cca\u4e0d\u6e05\u7684", "englishDefinition": "Open to more than one interpretation.", "rootAffix": "ambi- \u201c\u4e24\u8fb9\u201d + agere \u201c\u9a71\u52a8\u201d", "memoryHook": "ambi(\u4e24\u8fb9) + guous = \u4e24\u8fb9\u90fd\u8bf4\u5f97\u901a", "phrases": ["ambiguous statement", "ambiguous results"], "sentences": [{"en": "His answer was deliberately ambiguous.", "zh": "\u4ed6\u7684\u56de\u7b54\u6545\u610f\u542b\u7cca\u4e0d\u6e05\u3002"}, {"en": "The contract is ambiguous.", "zh": "\u5408\u540c\u542b\u7cca\u4e0d\u6e05\u3002"}] },
      "pragmatic": { "word": "pragmatic", "phonetic": "/pr\u00e6\u0261\u02c8m\u00e6t\u026ak/", "pos": "adj.", "chineseDefinition": "\u52a1\u5b9e\u7684\uff0c\u5b9e\u7528\u4e3b\u4e49\u7684", "englishDefinition": "Dealing with things sensibly and realistically.", "rootAffix": "\u8bcd\u6839 pragm- \u201c\u884c\u4e3a\u201d", "memoryHook": "pragmatic = \u5b9e\u8df5\u5bfc\u5411\uff0c\u6ce8\u91cd\u5b9e\u9645\u6548\u679c", "phrases": ["a pragmatic approach", "pragmatic solutions"], "sentences": [{"en": "We need a pragmatic approach.", "zh": "\u6211\u4eec\u9700\u8981\u52a1\u5b9e\u7684\u65b9\u6cd5\u3002"}, {"en": "He is known for his pragmatic style.", "zh": "\u4ed6\u4ee5\u52a1\u5b9e\u7684\u9886\u5bfc\u98ce\u683c\u95fb\u540d\u3002"}] },
    };

    // Return local dict entry immediately for known words
    if (localDict[key]) {
      return res.json(localDict[key]);
    }

    // Try Gemini API (will fail gracefully if no network)
    try {
      const ai = getGenAI();
      const geminiPrompt = context 
        ? `Provide detailed vocabulary details for the English word: "${word.trim()}". Context: "${context}".`
        : `Provide detailed vocabulary details for the English word: "${word.trim()}".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: geminiPrompt,
        config: {
          systemInstruction: "You are an expert English-Chinese bilingual lexicographer.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              pos: { type: Type.STRING },
              chineseDefinition: { type: Type.STRING },
              englishDefinition: { type: Type.STRING },
              rootAffix: { type: Type.STRING },
              memoryHook: { type: Type.STRING },
              phrases: { type: Type.ARRAY, items: { type: Type.STRING } },
              sentences: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, zh: { type: Type.STRING } }, required: ["en", "zh"] } }
            },
            required: ["word", "phonetic", "pos", "chineseDefinition"]
          }
        }
      });

      const geminiText = response.text;
      if (geminiText) {
        return res.json(JSON.parse(geminiText));
      }
    } catch (aiError) {
      console.warn("Gemini unavailable:", aiError.message);
    }

    // Final fallback
    return res.json({
      word: word.trim(), phonetic: "", pos: "",
      chineseDefinition: "",
      englishDefinition: "", rootAffix: "", memoryHook: "",
      phrases: [], sentences: []
    });

  } catch (error) {
    console.error("Word details error:", error);
    return res.status(500).json({ error: error.message });
  }
});

'''

text = text.replace(old_handler, new_handler)

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Handler replaced successfully")
print(f"Old handler was {len(old_handler)} chars")
print(f"New handler is {len(new_handler)} chars")
