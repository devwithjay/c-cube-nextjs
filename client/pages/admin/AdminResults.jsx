import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminTest,
  getAdminTestResults,
  getTestSections
} from "../../services/adminApi.js";

const baseColumns = [
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
  ["attempted_questions", "Attempted"]
];

export default function AdminResults() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [results, setResults] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState(baseColumns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const [testResponse, resultsResponse, sectionsResponse] = await Promise.all([
          getAdminTest(testId),
          getAdminTestResults(testId),
          getTestSections(testId)
        ]);
        setTest(testResponse?.data || null);
        setResults(Array.isArray(resultsResponse?.data) ? resultsResponse.data : []);
        
        const fetchedSections = Array.isArray(sectionsResponse?.data) ? sectionsResponse.data : [];
        setSections(fetchedSections);
        
        // Build dynamic columns based on sections
        const dynamicCols = [...baseColumns];
        const sortedSections = [...fetchedSections].sort((a, b) => 
          (a.sort_order ?? a.section_number) - (b.sort_order ?? b.section_number)
        );

        if (sortedSections.length > 0) dynamicCols.push(["section1_score", sortedSections[0].name]);
        if (sortedSections.length > 1) dynamicCols.push(["section2_score", sortedSections[1].name]);
        if (sortedSections.length > 2) dynamicCols.push(["section3_score", sortedSections[2].name]);

        dynamicCols.push(["submitted_at", "Submitted at"]);
        setDynamicColumns(dynamicCols);
      } catch (requestError) {
        setError(requestError?.message || "Unable to load responses.");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [testId]);

  function exportToExcel() {
    const header = dynamicColumns.map(([, label]) => label);
    const rows = results.map((result) =>
      dynamicColumns.map(([key]) => result[key] ?? "")
    );
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(test?.title || "assessment")}-responses.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <PageShell><p className="font-bold text-muted-foreground">Loading responses...</p></PageShell>;
  }

  return (
    <PageShell>
      <div className="flex justify-between items-center mb-6">
        <button type="button" onClick={() => navigate("/admin/dashboard")} className="text-sm font-bold text-muted-foreground hover:text-foreground">Back to dashboard</button>
        <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl border bg-card p-2.5 text-card-foreground transition hover:bg-muted">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Response viewer</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.04em]">{test?.title || "Assessment responses"}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{results.length} submitted response{results.length === 1 ? "" : "s"}</p>
        </div>
        <button type="button" disabled={!results.length} onClick={exportToExcel} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Export to Excel</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {!error && !results.length && <div className="mt-8 rounded-2xl bg-card p-12 text-center shadow-sm"><h2 className="text-xl font-black">No submitted responses yet</h2><p className="mt-2 text-sm text-muted-foreground">Responses will appear here after participants submit the assessment.</p></div>}

      {!!results.length && <div className="mt-8 overflow-hidden rounded-2xl bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1250px] w-full text-left text-sm"><thead className="bg-muted text-xs font-black uppercase tracking-[0.08em] text-muted-foreground"><tr>{dynamicColumns.map(([, label]) => <th key={label} className="whitespace-nowrap px-4 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{results.map((result) => <tr key={result.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedResult(result)}>{dynamicColumns.map(([key]) => <td key={key} className="whitespace-nowrap px-4 py-4 text-card-foreground">{key === "submitted_at" ? formatDate(result[key]) : result[key]}</td>)}</tr>)}</tbody></table></div></div>}

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
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Living At</span><span className="font-semibold text-foreground">{selectedResult.living_at || "-"}</span></div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Academic Details</h3>
                
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">PRN</span><span className="font-semibold text-foreground">{selectedResult.prn || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Campus</span><span className="font-semibold text-foreground">{selectedResult.campus || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Branch</span><span className="font-semibold text-foreground">{selectedResult.branch || "-"}</span></div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Division</span><span className="font-semibold text-foreground">{selectedResult.division || "-"}</span></div>
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
                                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Test Scores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Total Score</span>
                    <span className="text-2xl font-black text-foreground">{selectedResult.total_score}</span>
                  </div>
                  {sections.map(sec => {
                    let scoreKey = null;
                    const sNum = Number(sec.section_number);
                    if (sNum === 1) scoreKey = "section1_score";
                    else if (sNum === 2) scoreKey = "section2_score";
                    else if (sNum === 3) scoreKey = "section3_score";
                    if (!scoreKey) return null;
                    return (
                      <div key={sec.id} className="bg-muted rounded-xl p-4 text-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">{sec.name}</span>
                        <span className="text-2xl font-black text-foreground">{selectedResult[scoreKey]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>

  );
}

function escapeCsv(value) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "assessment";
}

function PageShell({ children }) {
  return <div className="min-h-screen bg-background text-foreground px-6 py-8"><main className="mx-auto max-w-7xl">{children}</main></div>;
}
