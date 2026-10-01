import re

file_path = 'client/pages/admin/AdminDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace alert with toast
content = content.replace(
    'alert("Link copied to clipboard: " + link);',
    'toast({ title: "Success", description: "Link copied to clipboard: " + link });'
)

# Replace window.confirm with a state-based Dialog
# To do this safely via script is tricky. Instead, let's just create a custom wrapper ConfirmDialog or modify handleDeleteTest.
# Actually, I'll use multi_replace_file_content for AdminDashboard later if needed.
