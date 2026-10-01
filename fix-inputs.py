import re

file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add bg-transparent text-foreground to inputs and textareas that don't have a bg- class
content = re.sub(
    r'(<input[^>]*className="[^"]*)(px-4 py-3)',
    r'\1bg-transparent text-foreground \2',
    content
)
content = re.sub(
    r'(<textarea[^>]*className="[^"]*)(px-4 py-3)',
    r'\1bg-transparent text-foreground \2',
    content
)

with open(file_path, 'w') as f:
    f.write(content)
print("Fixed inputs")
