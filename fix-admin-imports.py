file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

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

print("AdminAssessment.jsx imports fixed")
