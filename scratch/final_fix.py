import os

file_path = r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py'

# I'll just write the entire method body for analyze_phishing and fix the other one too.
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Fix the messed up docstring in analyze_phishing
    if "def analyze_phishing" in line:
        new_lines.append(line)
        new_lines.append('        """\n')
        new_lines.append('        Analyze text for phishing indicators using pattern matching.\n')
        new_lines.append('        """\n')
        continue
    
    # Skip the lines that are now syntax errors (the ones I left behind)
    if "ALGORITHM: Heuristic" in line or "Keyword spotting" in line or "Urgency phrase" in line or "Personal information" in line or "Returns: Combined" in line:
        continue
    
    # Also fix the DeBERTa line which is probably also missing its triple quotes now if I messed up more.
    # Actually, let's just make sure all docstrings are intact.
    
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
