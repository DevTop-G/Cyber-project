import re

with open(r"c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\REPORT.md", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Sections to exclude entirely
exclude_sections = False
in_code_block = False
in_references = False
in_toc = False
body_words = 0
excluded_words = 0
total_lines_counted = 0

for i, line in enumerate(lines, 1):
    stripped = line.strip()
    
    # Track code blocks (mermaid, etc)
    if stripped.startswith("```"):
        in_code_block = not in_code_block
        continue
    if in_code_block:
        continue
    
    # Skip empty lines and horizontal rules
    if not stripped or stripped == "---":
        continue
    
    # Skip headings
    if stripped.startswith("#"):
        # Check if entering References or Contents
        if "References" in stripped:
            in_references = True
        elif "Contents" in stripped:
            in_toc = True
        elif "Acknowledgements" in stripped:
            in_toc = False
            in_references = False
        elif stripped.startswith("## ") and "Contents" not in stripped and "References" not in stripped:
            in_toc = False
            in_references = False
        continue
    
    # Skip references section
    if in_references:
        excluded_words += len(stripped.split())
        continue
    
    # Skip ToC section (lists of figures, tables, etc.)
    if in_toc:
        excluded_words += len(stripped.split())
        continue
    
    # Skip title page lines (first ~16 lines with ** markers or empty)
    if i <= 16:
        excluded_words += len(stripped.split())
        continue
    
    # Skip table rows (start with |)
    if stripped.startswith("|"):
        excluded_words += len(stripped.split())
        continue
    
    # Skip lines that are just bold labels like **Table X:**
    if re.match(r'^\*\*(?:Table|Figure)\s+\d+', stripped):
        continue
    
    # Count body words
    words = len(stripped.split())
    body_words += words
    total_lines_counted += 1

print(f"Body prose word count: {body_words}")
print(f"Excluded words (refs, ToC, tables, title): {excluded_words}")
print(f"Lines of body text counted: {total_lines_counted}")
print(f"Total words in file: {body_words + excluded_words}")
print(f"Target: 6000 words")
print(f"Difference: {6000 - body_words} words {'needed' if body_words < 6000 else 'over'}")
