import re

file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add useTheme and lucide-react imports
imports = """import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
"""
content = content.replace('import { Button } from "@/components/ui/button";', imports + 'import { Button } from "@/components/ui/button";')

# Add useTheme inside component
state_new = """  const { testId } = useParams();
  const { theme, setTheme } = useTheme();"""
content = content.replace('  const { testId } = useParams();', state_new)

# Add button to the top flex box
old_flex = """          <div className="flex gap-3">

            {isDraft && ("""

new_flex = """          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-border bg-card p-3 text-card-foreground transition hover:bg-muted"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isDraft && ("""
content = content.replace(old_flex, new_flex)

with open(file_path, 'w') as f:
    f.write(content)

print("AdminAssessment theme button added")
