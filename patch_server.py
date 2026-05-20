with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

old_catch = """  } catch (error: any) {
    console.error("Error fetching word details from Gemini:", error);
    return res.status(500).json({ 
      error: "Failed to generate word details.", 
      details: error.message || error 
    });
  }"""

new_catch = """  } catch (error: any) {
    console.error("Error fetching word details from Gemini:", error);
    // Fallback: try local dictionary
    try {
      const localWords: Record<string, any> = {
        "ubiquitous": { "word": "ubiquitous", "phonetic": "/juːˈbɪkwɪtəs/", "pos": "adj.", "chineseDefinition": "无处不在的，普遍存在的", "englishDefinition": "Present, appearing, or found everywhere.", "rootAffix": "词根: ubique (Latin) 表示到处", "memoryHook": "谐音: you-be-quite-us, 老师无处不在", "phrases": ["ubiquitous technology", "ubiquitous access"], "sentences": [{"en": "Smartphones have become ubiquitous in daily life.", "zh": "智能手机已无处不在。"}, {"en": "The brand is ubiquitous in modern culture.", "zh": "该品牌在现代文化中无处不在。"}] },
        "ephemeral": { "word": "ephemeral", "phonetic": "/ɪˈfemərəl/", "pos": "adj.", "chineseDefinition": "短暂的，朝生暮死的", "englishDefinition": "Lasting for a very short time.", "rootAffix": "源自希腊语 ephemeros", "memoryHook": "e-外 + phe-呈现: 短暂一瞬", "phrases": ["ephemeral beauty", "ephemeral nature"], "sentences": [{"en": "Cherry blossoms are beautiful but ephemeral.", "zh": "樱花虽美但花期短暂。"}, {"en": "Fame can be ephemeral.", "zh": "名声可能是短暂的。"}] },
        "eloquent": { "word": "eloquent", "phonetic": "/ˈeləkwənt/", "pos": "adj.", "chineseDefinition": "口才好的, 雄辩的", "englishDefinition": "Fluent or persuasive in speaking or writing.", "rootAffix": "词根 loqu- 说", "memoryHook": "e-往外 + loqu-说 = 能说会道", "phrases": ["an eloquent speaker", "eloquent silence"], "sentences": [{"en": "She delivered an eloquent speech.", "zh": "她发表了动人的演说。"}, {"en": "His writing is clear and eloquent.", "zh": "他的文章清晰有说服力。"}] },
        "resilient": { "word": "resilient", "phonetic": "/rɪˈzɪliənt/", "pos": "adj.", "chineseDefinition": "有韧性的，坚韧不拔的", "englishDefinition": "Able to recover quickly from difficulties.", "rootAffix": "词根 salire- 跳", "memoryHook": "re-再次 + sil-跳 = 弹回", "phrases": ["resilient economy", "resilient spirit"], "sentences": [{"en": "Children are often more resilient than we think.", "zh": "孩子往往比想象的更有韧性。"}, {"en": "The economy proved remarkably resilient.", "zh": "经济表现出惊人的韧性。"}] },
        "ambiguous": { "word": "ambiguous", "phonetic": "/æmˈbɪɡjuəs/", "pos": "adj.", "chineseDefinition": "模棱两可的，含糊不清的", "englishDefinition": "Open to more than one interpretation.", "rootAffix": "ambi-两边 + agere驱动", "memoryHook": "ambi两边都说得通", "phrases": ["ambiguous statement", "ambiguous results"], "sentences": [{"en": "His answer was deliberately ambiguous.", "zh": "他的回答故意含糊其辞。"}, {"en": "The contract is ambiguous.", "zh": "合同含糊不清。"}] },
        "pragmatic": { "word": "pragmatic", "phonetic": "/præɡˈmætɪk/", "pos": "adj.", "chineseDefinition": "务实的, 实用主义的", "englishDefinition": "Dealing with things sensibly and realistically.", "rootAffix": "词根 pragm- 行为", "memoryHook": "pragmatic = 实践导向", "phrases": ["pragmatic approach", "pragmatic solutions"], "sentences": [{"en": "We need a pragmatic approach.", "zh": "我们需要务实的方法。"}, {"en": "He is known for his pragmatic style.", "zh": "他以务实风格闻名。"}] }
      };
      const key = (word || "").trim().toLowerCase();
      if (localWords[key]) {
        return res.json(localWords[key]);
      }
    } catch (e2) {
      // ignore fallback errors
    }
    return res.status(500).json({ 
      error: "Failed to generate word details.", 
      details: error.message || error,
      hint: "Gemini API unavailable. Try a word in our built-in dictionary or enter details manually."
    });
  }"""

if old_catch in text:
    text = text.replace(old_catch, new_catch)
    print("Catch block replaced successfully")
else:
    print("Old catch pattern NOT found - checking")
    idx = text.find("return res.status(500).json({")
    if idx > 0:
        print(f"Found at {idx}")
        print(text[idx-200:idx+200])

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)
