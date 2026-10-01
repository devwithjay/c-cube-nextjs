import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminTest,
  getAdminTestResults
} from "../../services/adminApi.js";

const columns = [
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
];

export default function AdminResults() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const [testResponse, resultsResponse] = await Promise.all([
          getAdminTest(testId),
          getAdminTestResults(testId)
        ]);
        setTest(testResponse?.data || null);
        setResults(Array.isArray(resultsResponse?.data) ? resultsResponse.data : []);
      } catch (requestError) {
        setError(requestError?.message || "Unable to load responses.");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [testId]);

  function exportToExcel() {
    const header = columns.map(([, label]) => label);
    const rows = results.map((result) =>
      columns.map(([key]) => result[key] ?? "")
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
    return <PageShell><p className="font-bold text-slate-500">Loading responses...</p></PageShell>;
  }

  return (
    <PageShell>
      <button type="button" onClick={() => navigate("/admin/dashboard")} className="mb-6 text-sm font-bold text-slate-500 hover:text-slate-950">Back to dashboard</button>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Response viewer</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.04em]">{test?.title || "Assessment responses"}</h1>
          <p className="mt-3 text-sm text-slate-500">{results.length} submitted response{results.length === 1 ? "" : "s"}</p>
        </div>
        <button type="button" disabled={!results.length} onClick={exportToExcel} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Export to Excel</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {!error && !results.length && <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm"><h2 className="text-xl font-black">No submitted responses yet</h2><p className="mt-2 text-sm text-slate-500">Responses will appear here after participants submit the assessment.</p></div>}

      {!!results.length && <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1250px] w-full text-left text-sm"><thead className="bg-slate-950 text-xs font-black uppercase tracking-[0.08em] text-white"><tr>{columns.map(([, label]) => <th key={label} className="whitespace-nowrap px-4 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{results.map((result) => <tr key={result.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedResult(result)}>{columns.map(([key]) => <td key={key} className="whitespace-nowrap px-4 py-4 text-slate-600">{key === "submitted_at" ? formatDate(result[key]) : result[key]}</td>)}</tr>)}</tbody></table></div></div>}

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
  return <div className="min-h-screen bg-[#f5efe6] px-6 py-8"><main className="mx-auto max-w-7xl">{children}</main></div>;
}
