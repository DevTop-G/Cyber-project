with open(r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any non-standard whitespace with standard spaces
content = content.replace('\xa0', ' ') # Non-breaking space
# Ensure all docstrings use triple double quotes and handle single quotes inside
# But actually, let's just use a clean version of the code.

with open(r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py', 'w', encoding='utf-8') as f:
    f.write(content)
