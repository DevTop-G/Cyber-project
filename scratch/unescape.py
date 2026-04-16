import ast

file_path = r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent3_synthesizer.py'

# Read the file. It's likely one giant escaped string or similar.
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Try to unescape it. 
# If it's like what I saw: \"\"\"\n... it might just need a literal_eval if it's wrapped in quotes,
# or a simple replace.

# Actually, if it's "raw escaped", we can use .encode().decode('unicode-escape')
try:
    # Example: \" -> "
    unescaped = content.encode('utf-8').decode('unicode-escape')
    
    # If it started with a literal quote in the file, remove it
    if unescaped.startswith('"') and unescaped.endswith('"'):
        unescaped = unescaped[1:-1]
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(unescaped)
    print("Unescaped successfully.")
except Exception as e:
    print(f"Failed to unescape: {e}")
