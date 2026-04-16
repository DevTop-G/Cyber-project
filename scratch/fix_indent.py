import sys

file_path = r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # If the line is exactly the one that caused the error, fix it.
    if "Analyze text for phishing indicators using pattern matching." in line:
        # Check if it has an extra space or something
        stripped = line.strip()
        new_lines.append("        " + stripped + "\n")
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Indentation fixed.")
