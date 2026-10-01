import re

file_path = 'client/pages/GiveTest.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Fix Section buttons UI (remove ring, use border)
content = content.replace(
    'bg-card text-muted-foreground ring-1 ring-slate-200 hover:bg-muted/50',
    'border border-border bg-card text-muted-foreground hover:bg-muted/50'
)

# Fix question wrapper
content = content.replace(
    'border border-slate-100 bg-card p-4',
    'border border-border bg-card p-4'
)

# Fix image UI (remove ugly border and background)
content = content.replace(
    'mt-6 flex justify-center rounded-2xl border border-slate-100 bg-muted/50 p-4 sm:p-6',
    'mt-6 flex justify-center'
)

with open(file_path, 'w') as f:
    f.write(content)

print("GiveTest.jsx UI fixed")
