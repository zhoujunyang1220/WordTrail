import sys

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Find the boundaries of the first handler
start_marker = 'app.post("/api/words/details", async (req, res) => {'
end_marker = '// REST API endpoint: extract candidate keywords'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx < 0 or end_idx < 0:
    print("Could not find markers")
    sys.exit(1)

old_handler = text[start_idx:end_idx]

# New handler that checks local dict FIRST
new_handler = '''
app.post("/api/words/details", async (req, res) => {
  try {
    const { word, context } = req.body;
    if (!word || typeof word !== "string" || word.trim() === "") {
      return res.status(400).json({ error: "Word parameter is required." });
    }

    const key = word.trim().toLowerCase();
    
    // Built-in local dictionary for quick offline lookup
    const localDict: Record<string, any> = {
      "ubiquitous": { "word": "ubiquitous", "phonetic": "/ju\u02d0\u02c8b\u026akw\u026at\u0259s/", "pos": "adj.", "chineseDefinition": "\u65e0\u5904\u4e0d\u5728\u7684\uff0c\u666e\u904d\u5b58\u5728\u7684", "englishDefinition": "Present everywhere.", "rootAffix": "\u8bcd\u6839 ubique", "memoryHook": "\u8c10\u97f3: you-be-quite-us", "phrases": ["ubiquitous technology"], "sentences": [{"en": "Smartphones are ubiquitous.", "zh": "\u667a\u80fd\u624b\u673a\u65e0\u5904\u4e0d\u5728\u3002"}] },
      "ephemeral": { "word": "ephemeral", "phonetic": "/\u026a\u02c8fem\u0259r\u0259l/", "pos": "adj.", "chineseDefinition": "\u77ed\u6682\u7684\uff0c\u8f6c\u77ac\u5373\u901d\u7684", "englishDefinition": "Lasting briefly.", "rootAffix": "\u5e0c\u814a\u8bed ephemeros", "memoryHook": "e-\u5916 + phe-\u5448\u73b0", "phrases": ["ephemeral beauty"], "sentences": [{"en": "The moment was ephemeral.", "zh": "\u90a3\u4e00\u523b\u8f6c\u77ac\u5373\u901d\u3002"}] },
      "eloquent": { "word": "eloquent", "phonetic": "/\u02c8el\u0259kw\u0259nt/", "pos": "adj.", "chineseDefinition": "\u53e3\u624d\u597d\u7684\uff0c\u96c4\u8fa9\u7684", "englishDefinition": "Fluent and persuasive.", "rootAffix": "\u8bcd\u6839 loqu- \u8bf4", "memoryHook": "e-\u5f80\u5916 + loqu-\u8bf4", "phrases": ["eloquent speech"], "sentences": [{"en": "She gave an eloquent speech.", "zh": "\u5979\u53d1\u8868\u4e86\u52a8\u4eba\u7684\u6f14\u8bf4\u3002"}] },
      "resilient": { "word": "resilient", "phonetic": "/r\u026a\u02c8z\u026ali\u0259nt/", "pos": "adj.", "chineseDefinition": "\u6709\u97e7\u6027\u7684\uff0c\u575a\u97e7\u4e0d\u62d4\u7684", "englishDefinition": "Able to recover quickly.", "rootAffix": "\u8bcd\u6839 salire- \u8df3", "memoryHook": "re-\u518d\u6b21 + sil-\u8df3 = \u5f39\u56de", "phrases": ["resilient economy"], "sentences": [{"en": "Children are resilient.", "zh": "\u5b69\u5b50\u5f88\u6709\u97e7\u6027\u3002"}] },
      "ambiguous": { "word": "ambiguous", "phonetic": "/\u00e6m\u02c8b\u026a\u0261ju\u0259s/", "pos": "adj.", "chineseDefinition": "\u6a21\u68f1\u4e24\u53ef\u7684", "englishDefinition": "Open to interpretation.", "rootAffix": "ambi-\u4e24\u8fb9", "memoryHook": "ambi\u4e24\u8fb9\u90fd\u8bf4\u5f97\u901a", "phrases": ["ambiguous result"], "sentences": [{"en": "His answer was ambiguous.", "zh": "\u4ed6\u7684\u56de\u7b54\u542b\u7cca\u4e0d\u6e05\u3002"}] },
      "pragmatic": { "word": "pragmatic", "phonetic": "/pr\u00e6\u0261\u02c8m\u00e6t\u026ak/", "pos": "adj.", "chineseDefinition": "\u52a1\u5b9e\u7684", "englishDefinition": "Practical and realistic.", "rootAffix": "\u8bcd\u6839 pragm- \u884c\u4e3a", "memoryHook": "\u5b9e\u8df5\u5bfc\u5411", "phrases": ["pragmatic approach"], "sentences": [{"en": "Be pragmatic.", "zh": "\u8981\u52a1\u5b9e\u3002"}] }
    };
    
    // Return immediately if found in local dict
    if (localDict[key]) {
      return res.json(localDict[key]);
    }

    // Try Gemini API
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
    
    // Minimal fallback
    return res.json({
      word: word.trim(), phonetic: "", pos: "",
      chineseDefinition: "[" + "press enter chinese meaning" + "]",
      englishDefinition: "", rootAffix: "", memoryHook: "",
      phrases: [], sentences: []
    });
    
  } catch (error: any) {
    console.warn("Word details failed:", error.message);
    return res.json({
      word: word.trim(), phonetic: "", pos: "",
      chineseDefinition: "[" + "press enter chinese meaning" + "]",
      englishDefinition: "", rootAffix: "", memoryHook: "",
      phrases: [], sentences: []
    });
  }
});

'''

text = text.replace(old_handler, new_handler)

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Handler replaced successfully")
