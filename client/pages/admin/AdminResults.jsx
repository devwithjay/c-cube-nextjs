import { useEffect, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { Sun, Moon, LoaderIcon } from "lucide-react";

function Spinner({ className, ...props }) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={`size-4 animate-spin ${className || ""}`}
      {...props}
    />
  )
}

import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminTest,
  getAdminTestResults,
  getTestSections,
  updateParticipantDetails
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
  ["gender", "Gender"],
  ["total_score", "Score"],
  ["attempted_questions", "Attempted"],
  ["total_questions", "Total"]
];

export default function AdminResults() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const loadingMoreRef = useRef(loadingMore);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
  
  const hasMoreRef = useRef(hasMore);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  const [dynamicColumns, setDynamicColumns] = useState(baseColumns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingParticipant, setSavingParticipant] = useState(false);
  const { theme, setTheme } = useTheme();
  const observer = useRef();
  const lastResultElementRef = useCallback(node => {
    if (loadingMoreRef.current) return;
    if (observer.current) observer.current.disconnect();
    if (!node) return;
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
        setPage(prev => prev + 1);
      }
    });
    observer.current.observe(node);
  }, []);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const [testResponse, resultsResponse, sectionsResponse] = await Promise.all([
          getAdminTest(testId),
          getAdminTestResults(testId, 1, 30),
          getTestSections(testId)
        ]);
        setTest(testResponse?.data || null);
        
        const responseData = resultsResponse?.data || {};
        const initialResults = Array.isArray(responseData.results) ? responseData.results : Array.isArray(responseData) ? responseData : [];
        setResults(initialResults);
        setTotalCount(responseData.totalCount || initialResults.length);
        setHasMore(initialResults.length === 30);
        setPage(1);
        
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

  useEffect(() => {
    if (page === 1) return;
    let active = true;
    async function fetchMore() {
      setLoadingMore(true);
      try {
        const res = await getAdminTestResults(testId, page, 30);
        if (!active) return;
        const responseData = res?.data || {};
        const newResults = Array.isArray(responseData.results) ? responseData.results : Array.isArray(responseData) ? responseData : [];
        
        setResults(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const filteredNew = newResults.filter(r => !existingIds.has(r.id));
          return [...prev, ...filteredNew];
        });
        setHasMore(newResults.length === 30);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoadingMore(false);
      }
    }
    fetchMore();
    return () => { active = false; };
  }, [page, testId]);

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

  function handleEditClick() {
    setEditForm({
      name: selectedResult.name || "",
      collegeEmail: selectedResult.college_email || "",
      mobileNumber: selectedResult.mobile_number || "",
      livingAt: selectedResult.living_at || "",
      gender: selectedResult.gender || "",
      prn: selectedResult.prn || "",
      campus: selectedResult.campus || "",
      branch: selectedResult.branch || "",
      division: selectedResult.division || ""
    });
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    try {
      setSavingParticipant(true);
      await updateParticipantDetails(selectedResult.participant_id, editForm);
      const updatedResult = { 
        ...selectedResult, 
        name: editForm.name,
        college_email: editForm.collegeEmail,
        mobile_number: editForm.mobileNumber,
        living_at: editForm.livingAt,
        gender: editForm.gender,
        prn: editForm.prn,
        campus: editForm.campus,
        branch: editForm.branch,
        division: editForm.division
      };
      setSelectedResult(updatedResult);
      setResults(results.map(r => r.id === updatedResult.id ? updatedResult : r));
      setIsEditing(false);
    } catch (e) {
      alert("Failed to save: " + e.message);
    } finally {
      setSavingParticipant(false);
    }
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
          <p className="mt-3 text-sm text-muted-foreground">Showing {results.length} of {totalCount} response{totalCount === 1 ? "" : "s"}</p>
        </div>
        <button type="button" disabled={!results.length} onClick={exportToExcel} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Export to Excel</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {!error && !results.length && <div className="mt-8 rounded-2xl bg-card p-12 text-center shadow-sm"><h2 className="text-xl font-black">No submitted responses yet</h2><p className="mt-2 text-sm text-muted-foreground">Responses will appear here after participants submit the assessment.</p></div>}

      {!!results.length && <div className="mt-8 overflow-hidden rounded-2xl bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1250px] w-full text-left text-sm"><thead className="bg-muted text-xs font-black uppercase tracking-[0.08em] text-muted-foreground"><tr>{dynamicColumns.map(([key, label]) => <th key={key} className="whitespace-nowrap px-4 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{results.map((result, index) => <tr ref={index === results.length - 1 ? lastResultElementRef : null} key={result.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedResult(result)}>{dynamicColumns.map(([key]) => <td key={key} className="whitespace-nowrap px-4 py-4 text-card-foreground">{key === "submitted_at" ? formatDate(result[key]) : key === "gender" && result[key] ? result[key].charAt(0).toUpperCase() + result[key].slice(1) : result[key]}</td>)}</tr>)}</tbody></table></div></div>}
      {loadingMore && (
        <div className="mt-6 mb-2 flex items-center justify-center">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <Dialog open={!!selectedResult} onOpenChange={(open) => {
        if (!open) {
          setSelectedResult(null);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="max-w-2xl bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex justify-between items-center pr-8">
              <span>{selectedResult?.name}'s Submission</span>
              {!isEditing ? (
                <button type="button" onClick={handleEditClick} className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg transition hover:opacity-90">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" disabled={savingParticipant} onClick={handleSaveEdit} className="text-sm px-4 py-2 bg-emerald-600 text-white rounded-lg transition hover:bg-emerald-700 disabled:opacity-50">Save</button>
                  <button type="button" disabled={savingParticipant} onClick={() => setIsEditing(false)} className="text-sm px-4 py-2 bg-muted text-foreground rounded-lg transition hover:bg-muted/80">Cancel</button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Personal Details</h3>
                
                {isEditing && (
                  <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Name</span><input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /></div>
                )}
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email</span>
                  {isEditing ? <input value={editForm.collegeEmail} onChange={e => setEditForm({...editForm, collegeEmail: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.college_email || "-"}</span>}
                </div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Mobile Number</span>
                  {isEditing ? <input value={editForm.mobileNumber} onChange={e => setEditForm({...editForm, mobileNumber: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.mobile_number || "-"}</span>}
                </div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Living At</span>
                  {isEditing ? <input value={editForm.livingAt} onChange={e => setEditForm({...editForm, livingAt: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.living_at || "-"}</span>}
                </div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Gender</span>
                  {isEditing ? <input value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.gender || "-"}</span>}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Academic Details</h3>
                
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">PRN</span>
                  {isEditing ? <input value={editForm.prn} onChange={e => setEditForm({...editForm, prn: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.prn || "-"}</span>}
                </div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Campus</span>
                  {isEditing ? <input value={editForm.campus} onChange={e => setEditForm({...editForm, campus: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.campus || "-"}</span>}
                </div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Branch</span>
                  {isEditing ? <input value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.branch || "-"}</span>}
                </div>
                <div><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Division</span>
                  {isEditing ? <input value={editForm.division} onChange={e => setEditForm({...editForm, division: e.target.value})} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary" /> : <span className="font-semibold text-foreground">{selectedResult.division || "-"}</span>}
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
                                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Test Scores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Total Score</span>
                    <span className="text-2xl font-black text-foreground">{selectedResult.total_score}</span>
                  </div>
                  {(() => {
                    const sorted = [...sections].sort((a, b) => (a.sort_order ?? a.section_number) - (b.sort_order ?? b.section_number));
                    const scoreKeys = ["section1_score", "section2_score", "section3_score"];
                    return sorted.slice(0, 3).map((sec, i) => (
                      <div key={sec.id} className="bg-muted rounded-xl p-4 text-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">{sec.name}</span>
                        <span className="text-2xl font-black text-foreground">{selectedResult[scoreKeys[i]]}</span>
                      </div>
                    ));
                  })()}
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
