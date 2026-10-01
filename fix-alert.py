import re

file_path = 'client/pages/GiveTest.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the specific "Before you begin" HTML with the Shadcn Alert component
alert_html = """        <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 text-lg">
              ⓘ
            </div>

            <div>
              <p className="font-black text-emerald-900">
                Before you begin
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Please make sure your details
                are correct. Once the assessment
                starts, the timer will begin
                immediately.
              </p>
            </div>
          </div>
        </div>"""

shadcn_alert = """        <Alert className="mt-8 border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-500">
          <AlertTitle className="font-black flex items-center gap-2">
            <span className="text-lg">ⓘ</span> Before you begin
          </AlertTitle>
          <AlertDescription className="mt-1 text-emerald-800 dark:text-emerald-400">
            Please make sure your details are correct. Once the assessment starts, the timer will begin immediately.
          </AlertDescription>
        </Alert>"""

content = content.replace(alert_html, shadcn_alert)

# Add Alert imports
imports = """import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
"""
content = content.replace('import { useParams } from "react-router-dom";', imports + 'import { useParams } from "react-router-dom";')

with open(file_path, 'w') as f:
    f.write(content)

print("GiveTest.jsx alert fixed")
