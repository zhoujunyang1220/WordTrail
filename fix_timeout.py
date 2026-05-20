with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Replace the entire Gemini try block with a version that uses Promise.race
old_start = '      // Use AbortController for 3-second timeout\n      const controller = new AbortController();\n      setTimeout(() => controller.abort(), 3000);\n      const ai = getGenAI();\n      // @ts-ignore - pass signal if supported\n      (ai as any)._requestOptions = { signal: controller.signal };'
new_start = '      const ai = getGenAI();'
text = text.replace(old_start, new_start)

# Now wrap the generateContent call in a timeout
old_call = '      const response = await ai.models.generateContent({'
new_call = '      const response = await Promise.race([\n        ai.models.generateContent({'
text = text.replace(old_call, new_call)

# Find the closing of the generateContent call and add timeout
# It ends with "      const geminiText = response.text;"
old_gemini_end = '      ]);\n\n      const geminiText = response.text;'
if old_gemini_end not in text:
    old_gemini_end = '      const geminiText = response.text;'
    # Find this after the generateContent block
    idx = text.find(old_gemini_end)
    if idx > 0:
        # Add timeout before this line
        indent = '      '
        timeout_close = indent + '}),\n' + indent + 'new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini timeout")), 4000))\n' + indent + ']);\n'
        text = text[:idx] + timeout_close + text[idx:]
        print(f"Added timeout race at {idx}")
    else:
        print("Could not find geminiText")
else:
    print("Already has Promise.race")

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Done")
