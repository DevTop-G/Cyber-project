file_path = r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(file_path, 'w', encoding='utf-8') as f:
    for line in lines:
        f.write(line.rstrip() + '\n')
