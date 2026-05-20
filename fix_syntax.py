with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Fix 1: Fix the duplicate closing and bad Promise.race insertion
old = '      }\n    });\n\n          }),\n        new Promise((_, reject) => setTimeout(() => reject(new Error("AI timeout")), 8000))\n      ];\nconst text = response.text;'
new = '      },\n        }),\n        new Promise((_, reject) => setTimeout(() => reject(new Error("AI timeout")), 8000))\n      ];\n      const text = response.text;'
text = text.replace(old, new)

# Fix 2: Fix the duplicate catch
text = text.replace("  }   } catch (error: any) {", "  } catch (error: any) {")

# Fix 3: Ensure local dict check is at the right place
# Check if the local dict check function is properly in the file
if "lookupLocal" not in text:
    print("ERROR: lookupLocal function missing!")
else:
    print("lookupLocal function present")

with open("D:\\codex\\WordTrail\\-WordTrail-main\\server.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed syntax errors")
