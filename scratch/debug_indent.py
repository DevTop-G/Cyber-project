file_path = r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 73 <= i <= 82: # Remove docstring lines
        if '"""' in line:
            continue
        if 'Analyze' in line or 'ALGORITHM' in line or 'Keyword' in line or 'Urgency' in line or 'Personal' in line or 'Returns' in line:
            continue
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
