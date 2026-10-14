import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon, Search } from "lucide-react";

import {
  getAdminTest,
  getAdminTestCertificates
} from "../../services/adminApi.js";

const filters = [
  ["all", "All"],
  ["downloaded", "Downloaded"],
  ["pending", "Pending"]
];

export default function AdminCertificates() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { theme, setTheme } = useTheme();
  const [test, setTest] = useState(null);
  const [stats, setStats] = useState({ totalEligible: 0, downloaded: 0, pending: 0 });
  const [participants, setParticipants] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [testResponse, certificatesResponse] = await Promise.all([
          getAdminTest(testId),
          getAdminTestCertificates(testId)
        ]);
        const data = certificatesResponse?.data || {};
        setTest(testResponse?.data || null);
        setStats({
          totalEligible: data.totalEligible || 0,
          downloaded: data.downloaded || 0,
          pending: data.pending || 0
        });
        setParticipants(Array.isArray(data.participants) ? data.participants : []);
      } catch (requestError) {
        setError(requestError?.message || "Unable to load certificate downloads.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [testId]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return participants.filter((participant) => {
      const isDownloaded = !!participant.first_downloaded_at;
      if (filter === "downloaded" && !isDownloaded) return false;
      if (filter === "pending" && isDownloaded) return false;
      if (!needle) return true;
      return [participant.name, participant.prn, participant.branch, participant.division, participant.college_email]
        .some((value) => String(value || "").toLowerCase().includes(needle));
    });
  }, [participants, filter, query]);

  function exportToCsv() {
    const header = ["Name", "PRN", "Branch", "Division", "Email", "Status", "Times downloaded", "First downloaded", "Last downloaded"];
    const rows = visible.map((participant) => [
      participant.name,
      participant.prn,
      participant.branch,
      participant.division,
      participant.college_email,
      participant.first_downloaded_at ? "Downloaded" : "Pending",
      participant.download_count || 0,
      formatDate(participant.first_downloaded_at),
      formatDate(participant.last_downloaded_at)
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate-downloads-${filter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <PageShell><p className="font-bold text-muted-foreground">Loading certificate downloads...</p></PageShell>;
  }

  const percent = stats.totalEligible ? Math.round((stats.downloaded / stats.totalEligible) * 100) : 0;

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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Certificate downloads</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.04em]">{test?.title || "Assessment"}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Each participant is counted once, however many times they download.</p>
        </div>
        <button type="button" disabled={!visible.length} onClick={exportToCsv} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          Export {filter === "all" ? "All" : filters.find(([key]) => key === filter)[1]}
        </button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {!error && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Downloaded" value={stats.downloaded} hint={`${percent}% of eligible`} accent="text-emerald-600" />
            <StatCard label="Pending" value={stats.pending} hint="Submitted, not downloaded yet" accent="text-amber-600" />
            <StatCard label="Eligible" value={stats.totalEligible} hint="Submitted the test" accent="text-foreground" />
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percent}%` }} />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {filters.map(([key, label]) => {
                const count = key === "all" ? stats.totalEligible : stats[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`rounded-lg px-4 py-2 text-sm font-black transition ${filter === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {label} <span className="ml-1 text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
            <label className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, PRN, branch..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          {!visible.length ? (
            <div className="mt-6 rounded-2xl bg-card p-12 text-center shadow-sm">
              <h2 className="text-xl font-black">No participants here</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {participants.length ? "Try a different filter or search." : "Participants appear here once they submit the assessment."}
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-sm">
                  <thead className="bg-muted text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-4">Name</th>
                      <th className="whitespace-nowrap px-4 py-4">PRN</th>
                      <th className="whitespace-nowrap px-4 py-4">Branch</th>
                      <th className="whitespace-nowrap px-4 py-4">Division</th>
                      <th className="whitespace-nowrap px-4 py-4">Status</th>
                      <th className="whitespace-nowrap px-4 py-4">Times</th>
                      <th className="whitespace-nowrap px-4 py-4">First downloaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visible.map((participant) => {
                      const isDownloaded = !!participant.first_downloaded_at;
                      return (
                        <tr key={participant.participant_id} className="hover:bg-muted/50">
                          <td className="whitespace-nowrap px-4 py-4 font-semibold text-card-foreground">{participant.name}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-card-foreground">{participant.prn}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-card-foreground">{participant.branch}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-card-foreground">{participant.division}</td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${isDownloaded ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                              {isDownloaded ? "Downloaded" : "Pending"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-card-foreground">{participant.download_count || "-"}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-card-foreground">{formatDate(participant.first_downloaded_at) || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}

function StatCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-4xl font-black ${accent}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{hint}</p>
    </div>
  );
}

function escapeCsv(value) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function PageShell({ children }) {
  return <div className="min-h-screen bg-background text-foreground px-6 py-8"><main className="mx-auto max-w-7xl">{children}</main></div>;
}
