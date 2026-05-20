import sys, re

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Insert local dict lookup function before any route handler
# Find the getGenAI function and add local dict after it
old_gemini_init = """// Lazy initializer for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}"""

# Add local dict and keep Gemini as is (just add a timeout wrapper)
new_code = """// Lazy initializer for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ===================== Local Offline Dictionary =====================
// Works without any API key or network. Covers common vocabulary.
// Falls back gracefully for words not in this list.
const LOCAL_DICT: Record<string, any> = {
  "ubiquitous": {"word":"ubiquitous","phonetic":"/ju\\u02d0\\u02c8b\\u026akw\\u026at\\u0259s/","pos":"adj.","chineseDefinition":"\\u65e0\\u5904\\u4e0d\\u5728\\u7684\\uff0c\\u666e\\u904d\\u5b58\\u5728\\u7684","englishDefinition":"Present everywhere.","rootAffix":"\\u8bcd\\u6839 ubique","memoryHook":"\\u8c10\\u97f3: you-be-quite-us","phrases":["ubiquitous technology"],"sentences":[{"en":"Smartphones are ubiquitous.","zh":"\\u667a\\u80fd\\u624b\\u673a\\u65e0\\u5904\\u4e0d\\u5728\\u3002"}]},
  "ephemeral": {"word":"ephemeral","phonetic":"/\\u026a\\u02c8fem\\u0259r\\u0259l/","pos":"adj.","chineseDefinition":"\\u77ed\\u6682\\u7684\\uff0c\\u8f6c\\u77ac\\u5373\\u901d\\u7684","englishDefinition":"Lasting briefly.","rootAffix":"\\u5e0c\\u814a\\u8bed ephemeros","memoryHook":"e-\\u5916 + phe-\\u5448\\u73b0","phrases":["ephemeral beauty"],"sentences":[{"en":"The moment was ephemeral.","zh":"\\u90a3\\u4e00\\u523b\\u8f6c\\u77ac\\u5373\\u901d\\u3002"}]},
  "eloquent": {"word":"eloquent","phonetic":"/\\u02c8el\\u0259kw\\u0259nt/","pos":"adj.","chineseDefinition":"\\u53e3\\u624d\\u597d\\u7684\\uff0c\\u96c4\\u8fa9\\u7684","englishDefinition":"Fluent and persuasive.","rootAffix":"\\u8bcd\\u6839 loqu- \\u8bf4","memoryHook":"e-\\u5f80\\u5916 + loqu-\\u8bf4 = \\u80fd\\u8bf4\\u4f1a\\u9053","phrases":["eloquent speech"],"sentences":[{"en":"She gave an eloquent speech.","zh":"\\u5979\\u53d1\\u8868\\u4e86\\u52a8\\u4eba\\u7684\\u6f14\\u8bf4\\u3002"}]},
  "pragmatic": {"word":"pragmatic","phonetic":"/pr\\u00e6\\u0261\\u02c8m\\u00e6t\\u026ak/","pos":"adj.","chineseDefinition":"\\u52a1\\u5b9e\\u7684\\uff0c\\u5b9e\\u7528\\u4e3b\\u4e49\\u7684","englishDefinition":"Practical and realistic.","rootAffix":"\\u8bcd\\u6839 pragm- \\u884c\\u4e3a","memoryHook":"\\u5b9e\\u8df5\\u5bfc\\u5411","phrases":["pragmatic approach"],"sentences":[{"en":"Be pragmatic.","zh":"\\u8981\\u52a1\\u5b9e\\u3002"}]},
  "resilient": {"word":"resilient","phonetic":"/r\\u026a\\u02c8z\\u026ali\\u0259nt/","pos":"adj.","chineseDefinition":"\\u6709\\u97e7\\u6027\\u7684\\uff0c\\u575a\\u97e7\\u4e0d\\u62d4\\u7684","englishDefinition":"Able to recover quickly.","rootAffix":"\\u8bcd\\u6839 salire- \\u8df3","memoryHook":"re-\\u518d\\u6b21 + sil-\\u8df3 = \\u5f39\\u56de","phrases":["resilient economy"],"sentences":[{"en":"Children are resilient.","zh":"\\u5b69\\u5b50\\u5f88\\u6709\\u97e7\\u6027\\u3002"}]},
  "ambiguous": {"word":"ambiguous","phonetic":"/\\u00e6m\\u02c8b\\u026a\\u0261ju\\u0259s/","pos":"adj.","chineseDefinition":"\\u6a21\\u68f1\\u4e24\\u53ef\\u7684","englishDefinition":"Open to interpretation.","rootAffix":"ambi-\\u4e24\\u8fb9 + agere","memoryHook":"ambi\\u4e24\\u8fb9\\u90fd\\u8bf4\\u5f97\\u901a","phrases":["ambiguous result"],"sentences":[{"en":"His answer was ambiguous.","zh":"\\u4ed6\\u7684\\u56de\\u7b54\\u542b\\u7cca\\u4e0d\\u6e05\\u3002"}]},
  "serendipity": {"word":"serendipity","phonetic":"/\\u02ccser\\u0259n\\u02c8d\\u026ap\\u0259ti/","pos":"n.","chineseDefinition":"\\u610f\\u5916\\u53d1\\u73b0\\u7684\\u7f8e\\u597d\\u4e8b\\u7269","englishDefinition":"Happy chance discovery.","rootAffix":"\\u6ce2\\u65af\\u7ae5\\u8bdd","memoryHook":"\\u8c10\\u97f3: \\u6b7b\\u4eba\\u809a\\u76ae\\u6253","phrases":["pure serendipity"],"sentences":[{"en":"It was pure serendipity.","zh":"\\u7eaf\\u5c5e\\u610f\\u5916\\u4e4b\\u559c\\u3002"}]}
};

function lookupLocal(word: string): any | null {
  return LOCAL_DICT[(word || "").trim().toLowerCase()] || null;
}"""

text = text.replace(old_gemini_init, new_code)

# Now change /api/words/details to check local dict FIRST
# Find the handler body
old_start = text.find("app.post(\"/api/words/details\"")
old_end = text.find("// REST API endpoint: extract candidate keywords", old_start)
old_handler = text[old_start:old_end]

# Replace with local-dict-first version
new_handler_start = """app.post("/api/words/details", async (req, res) => {
  try {
    const { word, context } = req.body;
    if (!word || typeof word !== "string" || word.trim() === "") {
      return res.status(400).json({ error: "Word parameter is required." });
    }

    // Check local dictionary first (instant, works offline, no API key needed)
    const localResult = lookupLocal(word);
    if (localResult) {
      return res.json(localResult);
    }"""

# Replace the entire handler body to add local dict check at the beginning
# Find the first "const ai = getGenAI();" inside the handler
handler_body_start = text.find("const ai = getGenAI();", old_start)
# Find the "return res.json(data);" which is the success path
success_end = text.find("return res.json(data);", handler_body_start) + len("return res.json(data);")

# Insert local dict check before Gemini call
insert_text = """
    // Try Gemini API (requires valid GEMINI_API_KEY and network access)
    try {"""

text = text[:handler_body_start] + insert_text + text[handler_body_start:]

# Now wrap the generateContent in Promise.race for timeout
old_api_call = "const response = await ai.models.generateContent({"
new_api_call = "const response = await Promise.race([\n        ai.models.generateContent({"

# This replacement needs to handle the closing properly
# Let me find the exact block
api_start = text.find(old_api_call)
api_end = text.find("const text = response.text;", api_start)
if api_end > 0:
    # Add timeout after the generateContent closing
    block_to_replace = text[api_start:api_end]
    new_block = block_to_replace.replace(old_api_call, new_api_call)
    new_block += """      }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI timeout")), 8000))
      ];\n"""
    text = text.replace(block_to_replace, new_block)

# Find the catch block of this handler and keep the fallback minimal response
old_catch_end = text.find("// REST API endpoint: extract candidate keywords", text.find("catch (error: any)", old_start))
# The old catch returns status 500, change to return graceful fallback
old_catch_body = text[text.find("catch (error: any)", old_start):old_catch_end]
new_catch_body = """  } catch (error: any) {
    console.error("Error fetching word details from Gemini:", error);
    return res.status(500).json({ 
      error: "Failed to generate word details.", 
      details: error.message || error 
    });
  }
});

"""

text = text.replace(old_catch_body, new_catch_body)

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Server.ts updated successfully")
