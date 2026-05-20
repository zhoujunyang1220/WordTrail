with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\components\\StatsModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Fix style height template literal - the issue is $ sign in python strings
old_style = 'style={{ height: ${height}% }}'
new_style = 'style={{ height: height + "%" }}'
text = text.replace(old_style, new_style)

old_title = 'title={${day.date}:  reviewed}'
new_title = 'title={`${day.date}: ${day.reviewed} reviewed`}'
text = text.replace(old_title, new_title)

with open("D:\\codex\\WordTrail\\-WordTrail-main\\src\\components\\StatsModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed StatsModal")
