import os
import re

def fix_css(file_path):
    if not os.path.exists(file_path): return
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove hardcoded backgrounds
    content = re.sub(r'color:\s*#[0-9a-fA-F]+;', '', content)
    content = re.sub(r'background:\s*#[0-9a-fA-F]+;', '', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Fixed {file_path}")

def fix_jsx(file_path):
    if not os.path.exists(file_path): return
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Replace common hardcoded classes with Shadcn
    content = content.replace('bg-[#f5efe6]', 'bg-background')
    content = content.replace('bg-white', 'bg-card')
    content = content.replace('text-slate-950', 'text-foreground')
    content = content.replace('text-slate-900', 'text-foreground')
    content = content.replace('text-slate-800', 'text-foreground')
    content = content.replace('text-slate-700', 'text-foreground')
    content = content.replace('text-slate-600', 'text-muted-foreground')
    content = content.replace('text-slate-500', 'text-muted-foreground')
    content = content.replace('text-white', 'text-primary-foreground')
    content = content.replace('bg-slate-950', 'bg-primary')
    content = content.replace('bg-slate-900', 'bg-primary')
    content = content.replace('bg-slate-800', 'bg-primary')
    content = content.replace('bg-slate-200', 'bg-muted')
    content = content.replace('bg-slate-100', 'bg-muted')
    content = content.replace('bg-slate-50', 'bg-muted/50')
    content = content.replace('border-slate-200', 'border-border')
    content = content.replace('border-slate-300', 'border-border')
    content = content.replace('border-black/5', 'border-border')
    
    # Specific fix for inputs and textareas
    content = content.replace('bg-card text-card-foreground px-4 py-3', 'bg-background text-foreground px-4 py-3')
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Fixed {file_path}")

fix_css('client/index.css')
fix_jsx('client/pages/admin/AdminDashboard.jsx')
fix_jsx('client/pages/admin/AdminAssessment.jsx')
fix_jsx('client/components/admin/AdminLayout.jsx')
fix_jsx('client/pages/GiveTest.jsx')

