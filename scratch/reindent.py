import re

file_path = r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Split into docstring and code if possible
# If the file starts with a docstring, we should preserve it.
# But for now, let's just focus on the code part.

lines = content.splitlines()

# Re-indentation logic:
# 1. Class starts at column 0
# 2. Methods start at column 4
# 3. Method bodies start at column 8

new_lines = []
in_class = False
in_method = False

for line in lines:
    stripped = line.lstrip()
    if not stripped:
        new_lines.append("")
        continue
    
    if stripped.startswith("class ContentAnalysisAgent"):
        new_lines.append(stripped)
        in_class = True
        continue
    
    if in_class:
        if stripped.startswith("def "):
            new_lines.append("    " + stripped)
            continue
        
        # Everything else inside the class (like class variables or method bodies)
        # This is tricky because we don't know if we are inside a method or not here.
        # But based on the file content, everything after a 'def' until the next 'def' is inside a method.
        # EXCEPT for class-level variables (which might not exist here).
        
        # Let's just fix the specific part that failed.
        if "Analyze text for phishing indicators using pattern matching." in stripped:
             new_lines.append("        " + stripped)
             continue

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(new_lines) + "\n")

print("Re-indentation complete.")
