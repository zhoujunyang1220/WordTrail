import express from "express";
import dotenv from "dotenv";

dotenv.config({ override: true });

const app = express();
app.use(express.json({ limit: "10mb" }));

// ─── DeepSeek API ──────────────────────────────────────────────────────────
async function callDeepSeek(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not set");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error("DeepSeek " + resp.status + ": " + (await resp.text()));
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "";
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Word Details API ──────────────────────────────────────────────────────
app.post("/api/words/details", async (req, res) => {
  try {
    const { word, context } = req.body;
    if (!word || typeof word !== "string" || word.trim() === "") {
      return res.status(400).json({ error: "Word required" });
    }
    try {
      let prompt =
        'Provide vocabulary details for the English word: "' +
        word.trim() +
        '"';
      if (context) prompt += ' Context: "' + context + '"';
      prompt +=
        '. Return a valid JSON object with keys: word, phonetic, pos, chineseDefinition, englishDefinition, rootAffix, memoryHook, phrases (array), sentences (array of objects with en and zh).';
      const result = await callDeepSeek(
        prompt,
        "You are a bilingual lexicographer. Respond ONLY with valid JSON."
      );
      if (result) {
        try {
          const data = JSON.parse(result);
          return res.json(data);
        } catch (_) {}
      }
    } catch (e: any) {
      console.warn("AI failed:", e.message);
    }
    return res.json({
      word: word.trim(),
      phonetic: "",
      pos: "",
      chineseDefinition: "",
      englishDefinition: "",
      rootAffix: "",
      memoryHook: "",
      phrases: [],
      sentences: [],
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Word Extraction API ───────────────────────────────────────────────────
app.post("/api/words/extract", async (req, res) => {
  try {
    const { text: inputText, userLevel } = req.body;
    if (!inputText || typeof inputText !== "string" || inputText.trim() === "") {
      return res.status(400).json({ error: "Text required" });
    }
    try {
      const prompt =
        "Extract 5-12 difficult English words from this text for a " +
        (userLevel || "CET-6") +
        " learner. Ignore easy words. Return JSON with: candidates (array of objects with word, contextSentence, quickTranslation, difficultyLevel). Text: " +
        inputText.substring(0, 3000);
      const result = await callDeepSeek(
        prompt,
        "You are an ESL teacher. Return valid JSON only."
      );
      if (result) {
        try {
          return res.json(JSON.parse(result));
        } catch (_) {}
      }
    } catch (e: any) {
      console.warn("AI extraction failed:", e.message);
    }
    const words = inputText.match(/[a-zA-Z]{5,}/g) || [];
    const unique = [...new Set(words.map((w: string) => w.toLowerCase()))].slice(0, 10);
    return res.json({
      candidates: unique.map((w: string) => ({
        word: w,
        contextSentence: inputText.substring(0, 100) + "...",
        quickTranslation: "[AI unavailable]",
        difficultyLevel: "Unknown",
      })),
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Auth (in-memory for demo) ────────────────────────────────────────────
interface AuthUser {
  id: string;
  username: string;
  password: string;
  createdAt: number;
}
const users: AuthUser[] = [];

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== "string" || username.trim() === "") {
      return res.status(400).json({ error: "Username required" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const trimmed = username.trim();
    if (users.find((u) => u.username === trimmed)) {
      return res.status(409).json({ error: "Username already exists" });
    }
    users.push({ id: `user-${Date.now()}`, username: trimmed, password, createdAt: Date.now() });
    return res.json({ user: { id: `user-${Date.now()}`, username: trimmed }, message: "Registration successful" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    const user = users.find((u) => u.username === username.trim() && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid username or password" });
    return res.json({ user: { id: user.id, username: user.username }, message: "Login successful" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/check-username", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });
    return res.json({ available: !users.some((u) => u.username === username.trim()) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

export default app;
