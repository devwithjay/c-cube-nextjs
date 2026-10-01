import re

file_path = 'client/pages/admin/AdminResults.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Fix columns
columns_old = """const columns = [
  ["name", "Name"],
  ["college_email", "Email"],
  ["mobile_number", "Mobile"],
  ["prn", "PRN"],
  ["campus", "Campus"],
  ["branch", "Branch"],
  ["class_name", "Class"],
  ["division", "Division"],
  ["current_year", "Current Year"],
  ["gender", "Gender"],
  ["staying_at", "Living at"],
  ["current_city", "Current City"],
  ["total_score", "Score"],
  ["total_questions", "Total"],
  ["attempted_questions", "Attempted"],
  ["section1_score", "IQ"],
  ["section2_score", "EQ"],
  ["section3_score", "SQ"],
  ["submitted_at", "Submitted at"]
];"""
columns_new = """const columns = [
  ["name", "Name"],
  ["college_email", "Email"],
  ["mobile_number", "Mobile"],
  ["prn", "PRN"],
  ["campus", "Campus"],
  ["branch", "Branch"],
  ["division", "Division"],
  ["living_at", "Living at"],
  ["total_score", "Score"],
  ["total_questions", "Total"],
  ["attempted_questions", "Attempted"],
  ["section1_score", "IQ"],
  ["section2_score", "EQ"],
  ["section3_score", "SQ"],
  ["submitted_at", "Submitted at"]
];"""
content = content.replace(columns_old, columns_new)

# Fix Dialog
dialog_old = """              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Personal Details</h3>
                
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email</span><span className="font-semibold text-foreground">{selectedResult.college_email || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Mobile Number</span><span className="font-semibold text-foreground">{selectedResult.mobile_number || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Gender</span><span className="font-semibold text-foreground">{selectedResult.gender || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Current City</span><span className="font-semibold text-foreground">{selectedResult.current_city || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Living At</span><span className="font-semibold text-foreground">{selectedResult.staying_at || "-"}</span></div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Academic Details</h3>
                
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">PRN</span><span className="font-semibold text-foreground">{selectedResult.prn || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Campus</span><span className="font-semibold text-foreground">{selectedResult.campus || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Branch</span><span className="font-semibold text-foreground">{selectedResult.branch || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Class</span><span className="font-semibold text-foreground">{selectedResult.class_name || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Division</span><span className="font-semibold text-foreground">{selectedResult.division || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Current Year</span><span className="font-semibold text-foreground">{selectedResult.current_year || "-"}</span></div>
              </div>"""

dialog_new = """              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Personal Details</h3>
                
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email</span><span className="font-semibold text-foreground">{selectedResult.college_email || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Mobile Number</span><span className="font-semibold text-foreground">{selectedResult.mobile_number || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Living At</span><span className="font-semibold text-foreground">{selectedResult.living_at || "-"}</span></div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Academic Details</h3>
                
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">PRN</span><span className="font-semibold text-foreground">{selectedResult.prn || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Campus</span><span className="font-semibold text-foreground">{selectedResult.campus || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Branch</span><span className="font-semibold text-foreground">{selectedResult.branch || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Division</span><span className="font-semibold text-foreground">{selectedResult.division || "-"}</span></div>
              </div>"""

content = content.replace(dialog_old, dialog_new)

with open(file_path, 'w') as f:
    f.write(content)

print("Fix completed")
