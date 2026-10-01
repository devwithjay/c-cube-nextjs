import re

file_path = 'client/pages/GiveTest.jsx'
with open(file_path, 'r') as f:
    content = f.read()

def convert_select(match):
    # match.group(1) is the inner content of <select> (options)
    # The whole match string is what we want to replace
    # We need to extract value, onChange, placeholder/options
    select_block = match.group(0)
    
    # Extract value
    value_match = re.search(r'value=\{([^}]+)\}', select_block)
    value_prop = value_match.group(1) if value_match else '""'
    
    # Extract update key
    update_match = re.search(r'updateParticipant\(\s*"([^"]+)"', select_block)
    update_key = update_match.group(1) if update_match else ''
    
    # Extract first option (placeholder)
    first_opt_match = re.search(r'<option value="">([^<]+)</option>', select_block)
    placeholder = first_opt_match.group(1).strip() if first_opt_match else 'Select an option'
    
    # Extract other options
    options = re.findall(r'<option value="([^"]+)">([^<]+)</option>', select_block)
    options = [opt for opt in options if opt[0] != '']
    
    shadcn_select = f"""<Select value={{{value_prop}}} onValueChange={{(value) => updateParticipant("{update_key}", value)}} required>
              <SelectTrigger className={{selectClass}}>
                <SelectValue placeholder="{placeholder}" />
              </SelectTrigger>
              <SelectContent>"""
              
    for val, label in options:
        shadcn_select += f"""
                <SelectItem value="{val}">{label}</SelectItem>"""
                
    shadcn_select += """
              </SelectContent>
            </Select>"""
            
    return shadcn_select

content = re.sub(r'<select\s+required[^>]*>.*?<\/select>', convert_select, content, flags=re.DOTALL)

# Add imports
imports = """import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
"""
content = content.replace('import { useParams } from "react-router-dom";', imports + 'import { useParams } from "react-router-dom";')

with open(file_path, 'w') as f:
    f.write(content)

print("GiveTest.jsx selects fixed")
