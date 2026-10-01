import re

file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# For inputs with outline-none focus:border-slate-950
content = content.replace(
    'outline-none focus:border-slate-950',
    'bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground'
)

# For inputs that don't have outline-none but have px-3 py-3 (like section fields)
content = content.replace(
    'px-3 py-3"',
    'px-3 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"'
)
content = content.replace(
    'px-3 py-3 md:col-span-2"',
    'px-3 py-3 md:col-span-2 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"'
)

# For question marks field
content = content.replace(
    'px-4 py-3"',
    'px-4 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"'
)
# Note: the above might affect the SelectTrigger, but SelectTrigger already has bg-background and text-foreground, and ends with "h-auto text-base" not "px-4 py-3"

with open(file_path, 'w') as f:
    f.write(content)

print("Inputs fixed")
