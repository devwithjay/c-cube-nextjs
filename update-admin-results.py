import re

file_path = 'client/pages/admin/AdminResults.jsx'
with open(file_path, 'r') as f:
    content = f.read()

imports = """import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
"""
content = content.replace('import { useNavigate, useParams } from "react-router-dom";', imports + 'import { useNavigate, useParams } from "react-router-dom";')

columns_old = """const columns = [
  ["name", "Name"],
  ["branch", "Branch"],
  ["division", "Division"],
  ["prn", "PRN"],
  ["college_email", "Email"],
  ["mobile_number", "Mobile"],
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
content = content.replace(columns_old, columns_new)

# Add state
state_old = """  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");"""
state_new = """  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);"""
content = content.replace(state_old, state_new)

# Add click to row
row_old = """<tr key={result.id} className="hover:bg-slate-50">"""
row_new = """<tr key={result.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedResult(result)}>"""
content = content.replace(row_old, row_new)

# Add Dialog at the end
dialog_code = """
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-2xl bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{selectedResult?.name}'s Submission</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Test Scores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Total Score</span>
                    <span className="text-2xl font-black text-foreground">{selectedResult.total_score}</span>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">IQ</span>
                    <span className="text-2xl font-black text-foreground">{selectedResult.section1_score}</span>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">EQ</span>
                    <span className="text-2xl font-black text-foreground">{selectedResult.section2_score}</span>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">SQ</span>
                    <span className="text-2xl font-black text-foreground">{selectedResult.section3_score}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
"""
content = content.replace('    </PageShell>', dialog_code)

with open(file_path, 'w') as f:
    f.write(content)

print("AdminResults.jsx updated")
EOF
