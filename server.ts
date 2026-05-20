import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config({override:true});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Local Dictionary
const LOCAL_DICT = {};

function lookupLocal(word) {
  return LOCAL_DICT[(word || '"').trim().toLowerCase()] || null;
}

// DeepSeek API
async function callDeepSeek(prompt, systemPrompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });
    if (!resp.ok) { throw new Error('DeepSeek ' + resp.status + ': ' + (await resp.text())); }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '';
  } finally { clearTimeout(timeout); }
}

// Word Details API
app.post("/api/words/details", async (req, res) => {
  try {
    const { word, context } = req.body;
    if (!word || typeof word !== "string" || word.trim() === "") {
      return res.status(400).json({ error: "Word required" });
    }
    const local = lookupLocal(word);
    if (local) return res.json(local);
    try {
      let prompt = 'Provide vocabulary details for the English word: "' + word.trim() + '"';
      if (context) prompt += ' Context: "' + context + '"';
      prompt += '. Return a valid JSON object with keys: word, phonetic, pos, chineseDefinition, englishDefinition, rootAffix, memoryHook, phrases (array), sentences (array of objects with en and zh).';
      const result = await callDeepSeek(prompt, "You are a bilingual lexicographer. Respond ONLY with valid JSON.");
      if (result) {
        try {
          const data = JSON.parse(result);
          return res.json(data);
        } catch (e) {}
      }
    } catch (e) { console.warn('AI failed:', e.message); }
    return res.json({ word: word.trim(), phonetic: '', pos: '', chineseDefinition: '', englishDefinition: '', rootAffix: '', memoryHook: '', phrases: [], sentences: [] });
  } catch (error) { console.error(error); return res.status(500).json({ error: error.message }); }
});

// Word Extraction API
app.post("/api/words/extract", async (req, res) => {
  try {
    const { text: inputText, userLevel } = req.body;
    if (!inputText || typeof inputText !== "string" || inputText.trim() === "") {
      return res.status(400).json({ error: "Text required" });
    }
    try {
      const prompt = 'Extract 5-12 difficult English words from this text for a ' + (userLevel || 'CET-6') + ' learner. Ignore easy words. Return JSON with: candidates (array of objects with word, contextSentence, quickTranslation, difficultyLevel). Text: ' + inputText.substring(0, 3000);
      const result = await callDeepSeek(prompt, "You are an ESL teacher. Return valid JSON only.");
      if (result) { try { return res.json(JSON.parse(result)); } catch(e) {} }
    } catch (e) { console.warn('AI extraction failed:', e.message); }
    const words = inputText.match(/[a-zA-Z]{5,}/g) || [];
    const unique = [...new Set(words.map(w => w.toLowerCase()))].slice(0, 10);
    return res.json({ candidates: unique.map(w => ({ word: w, contextSentence: inputText.substring(0, 100) + '...', quickTranslation: '[AI涓嶅彲鐢╙', difficultyLevel: 'Unknown' })) });
  } catch (error) { console.error(error); return res.status(500).json({ error: error.message }); }
});

// Boot
async function boot() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log("Server on http://0.0.0.0:" + PORT));
}

boot().catch(console.error);
