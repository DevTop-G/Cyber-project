import os
import subprocess

def run_command(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running {cmd}: {result.stderr}")
    return result.stdout

# Get all tracked files that are not committed yet
# or all files that are not ignored
files = run_command("git ls-files --others --exclude-standard").splitlines()

print(f"Found {len(files)} files to commit.")

batch_size = 2
for i in range(0, len(files), batch_size):
    batch = files[i:i+batch_size]
    for f in batch:
        run_command(f'git add "{f}"')
    
    commit_msg = f"add: {', '.join([os.path.basename(f) for f in batch])}"
    print(f"Committing {commit_msg}...")
    run_command(f'git commit -m "{commit_msg}"')

print("All files committed in batches.")
