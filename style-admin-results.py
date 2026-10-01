import re

file_path = 'client/pages/admin/AdminResults.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add useTheme and lucide-react imports
imports = """import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
"""
content = content.replace('import { useNavigate, useParams } from "react-router-dom";', imports + 'import { useNavigate, useParams } from "react-router-dom";')

# Add useTheme inside component
state_new = """  const [selectedResult, setSelectedResult] = useState(null);
  const { theme, setTheme } = useTheme();"""
content = content.replace('  const [selectedResult, setSelectedResult] = useState(null);', state_new)

# Replace the header bar to include the theme toggle
old_header = """<button type="button" onClick={() => navigate("/admin/dashboard")} className="mb-6 text-sm font-bold text-slate-500 hover:text-slate-950">Back to dashboard</button>"""
new_header = """<div className="flex justify-between items-center mb-6">
        <button type="button" onClick={() => navigate("/admin/dashboard")} className="text-sm font-bold text-muted-foreground hover:text-foreground">Back to dashboard</button>
        <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl border bg-card p-2.5 text-card-foreground transition hover:bg-muted">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>"""
content = content.replace(old_header, new_header)

# Fix background and text colors
content = content.replace('bg-[#f5efe6]', 'bg-background text-foreground')
content = content.replace('text-slate-500', 'text-muted-foreground')
content = content.replace('hover:text-slate-950', 'hover:text-foreground')
content = content.replace('text-white', 'text-foreground') # This might be in the button or the header
# Revert button text-white
content = content.replace('text-foreground hover:bg-emerald-700', 'text-white hover:bg-emerald-700')
# Fix table header
content = content.replace('bg-slate-950 text-xs font-black uppercase tracking-[0.08em] text-white', 'bg-muted text-xs font-black uppercase tracking-[0.08em] text-muted-foreground')
content = content.replace('bg-white', 'bg-card')
content = content.replace('divide-slate-100', 'divide-border')
content = content.replace('hover:bg-slate-50', 'hover:bg-muted/50')
content = content.replace('text-slate-600', 'text-card-foreground')

# The header Title text was originally tracking-[-0.04em]. It didn't have text-white? Oh, maybe it did.
content = content.replace('text-4xl font-black tracking-[-0.04em] text-white', 'text-4xl font-black tracking-[-0.04em]')

with open(file_path, 'w') as f:
    f.write(content)

print("AdminResults styled")
