import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  getAdminTests,
  clearAdminToken,
  createAdminTest,
  updateAdminTest,
  deleteAdminTest
} from "../../services/adminApi.js";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    durationSeconds: 1800,
    liveMessage: "Assessment will be live shortly."
  });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminTests();

      setTests(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Failed to load assessments."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAdminToken();

    navigate("/admin/login", {
      replace: true
    });
  }

  function openAssessment(testId) {
    navigate(`/admin/tests/${testId}`);
  }

  function openResults(testId) {
    navigate(`/admin/tests/${testId}/results`);
  }

  function openSettings() {
    navigate("/admin/settings");
  }

  function openCreateDrawer() {
    setEditingTestId(null);
    setCreateForm({ title: "", description: "", durationSeconds: 1800, liveMessage: "Assessment will be live shortly." });
    setIsDrawerOpen(true);
  }

  function openEditDrawer(test) {
    setEditingTestId(test.id);
    setCreateForm({
      title: test.title,
      description: test.description || "",
      durationSeconds: test.duration_seconds || 1800,
      liveMessage: test.live_message || "Assessment will be live shortly."
    });
    setIsDrawerOpen(true);
  }

  async function handleSaveTest(event) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      const payload = {
        ...createForm,
        durationSeconds: Number(createForm.durationSeconds),
        liveMessage: createForm.liveMessage
      };
      
      if (editingTestId) {
        await updateAdminTest(editingTestId, payload);
      } else {
        await createAdminTest(payload);
      }
      
      await loadTests();
      setIsDrawerOpen(false);
    } catch (requestError) {
      setError(requestError?.message || "Unable to save assessment.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTest(test) {
    const hasResults =
      test.status === "published" ||
      test.status === "closed";
    const confirmed = window.confirm(
      `Delete ${test.status} assessment "${test.title}"? This will permanently delete its sections, questions${hasResults ? ", participant sessions, and results" : ""}.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(test.id);
      setError("");
      await deleteAdminTest(test.id);
      setTests((current) =>
        current.filter((item) => item.id !== test.id)
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to delete assessment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* =====================================================
          HEADER
         ===================================================== */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Brand */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
              C Cube Admin
            </p>

            <h1 className="mt-1 font-display text-2xl font-black tracking-[-0.03em] text-foreground">
              Assessment Management
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border bg-card p-2.5 text-card-foreground transition hover:bg-muted"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={openSettings}
              className="rounded-xl border bg-card px-4 py-2.5 text-sm font-bold text-card-foreground transition hover:bg-muted"
            >
              Settings
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
         ===================================================== */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Page Heading */}
        <div className="mb-8">

          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>

          <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.04em] text-foreground">
            3Q Assessments
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Manage assessment versions, sections,
            questions, and publication status.
          </p>

          <button
            type="button"
            onClick={openCreateDrawer}
            className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
          >
            Create assessment
          </button>

        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-2xl px-4 py-6">
              <DrawerHeader>
                <DrawerTitle>{editingTestId ? "Edit Assessment Details" : "New Assessment"}</DrawerTitle>
                <DrawerDescription>Configure the basic details of the assessment.</DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleSaveTest} className="p-4 flex flex-col gap-5">
                <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                  <label className="text-sm font-bold text-foreground">
                    Title
                    <input
                      required
                      value={createForm.title}
                      onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-slate-950"
                    />
                  </label>
                  <label className="text-sm font-bold text-foreground">
                    Duration (seconds)
                    <input
                      required
                      min="1"
                      type="number"
                      value={createForm.durationSeconds}
                      onChange={(event) => setCreateForm({ ...createForm, durationSeconds: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-slate-950"
                    />
                  </label>
                </div>
                <label className="text-sm font-bold text-foreground">
                  Live Message (Timing/Details)
                  <input
                    required
                    value={createForm.liveMessage}
                    onChange={(event) => setCreateForm({ ...createForm, liveMessage: event.target.value })}
                    placeholder="e.g. Assessment will be live on 2nd of October, from 6 AM to 11 PM"
                    className="mt-2 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-slate-950"
                  />
                </label>
                <label className="text-sm font-bold text-foreground">
                  Description
                  <textarea
                    rows="3"
                    value={createForm.description}
                    onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-slate-950"
                  />
                </label>
                <DrawerFooter className="px-0">
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-primary-foreground hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {creating ? "Saving..." : editingTestId ? "Save Changes" : "Create draft"}
                  </button>
                  <DrawerClose asChild>
                    <button type="button" className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-black text-foreground hover:bg-muted/50">
                      Cancel
                    </button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </div>
          </DrawerContent>
        </Drawer>

        {/* =====================================================
            ERROR
           ===================================================== */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
           ===================================================== */}
        {loading && (
          <div className="rounded-[2rem] bg-card p-12 text-center shadow-sm">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-slate-950" />

            <p className="text-sm font-semibold text-muted-foreground">
              Loading assessments...
            </p>

          </div>
        )}

        {/* =====================================================
            EMPTY STATE
           ===================================================== */}
        {!loading &&
          !error &&
          tests.length === 0 && (
            <div className="rounded-[2rem] bg-card p-12 text-center shadow-sm">

              <h3 className="text-xl font-black text-foreground">
                No assessments found
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Create an assessment from the admin
                tools.
              </p>

            </div>
          )}

        {/* =====================================================
            TEST CARDS
           ===================================================== */}
        {!loading &&
          tests.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {tests.map((test) => {
                const isDraft =
                  test.status === "draft";

                const isPublished =
                  test.status === "published";

                const isClosed =
                  test.status === "closed";

                const isArchived =
                  test.status === "archived";

                const durationMinutes =
                  Math.floor(
                    Number(
                      test.duration_seconds || 0
                    ) / 60
                  );

                return (
                  <article
                    key={test.id}
                    className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Card Top */}
                    <div className="flex items-center justify-between gap-4">

                      <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                        Test #{test.id}
                      </span>

                      {/* Status */}
                      <span
                        className={`
                          rounded-full px-3 py-1
                          text-xs font-black uppercase

                          ${
                            isPublished
                              ? "bg-emerald-100 text-emerald-700"
                              : isDraft
                              ? "bg-amber-100 text-amber-700"
                              : isClosed
                              ? "bg-red-100 text-red-700"
                              : isArchived
                              ? "bg-muted text-muted-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        `}
                      >
                        {test.status}
                      </span>

                    </div>

                    {/* Title */}
                    <h3 className="mt-5 font-display text-2xl font-black tracking-[-0.03em] text-foreground">
                      {test.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-muted-foreground">
                      {test.description ||
                        "No description provided."}
                    </p>

                    {/* Metadata */}
                    <div className="mt-6 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-background p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Duration
                        </p>

                        <p className="mt-1 text-lg font-black text-foreground">
                          {durationMinutes} min
                        </p>
                      </div>

                      <div className="rounded-xl bg-background p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Version
                        </p>

                        <p className="mt-1 text-lg font-black text-foreground">
                          v{test.version}
                        </p>
                      </div>

                    </div>

                    {/* Assessment Actions */}
                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(test)}
                        className="flex-1 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-black text-foreground transition hover:-translate-y-0.5 hover:bg-muted/50"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openAssessment(test.id)}
                        className="flex-1 rounded-xl bg-primary px-5 py-3.5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary"
                      >
                        Manage Content
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openResults(test.id)}
                      className="mt-3 w-full rounded-xl border border-border px-4 py-3.5 text-sm font-black text-foreground transition hover:bg-muted/50"
                    >
                      View responses
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === test.id}
                      onClick={() =>
                        handleDeleteTest(test)
                      }
                      className={`${isDraft ? "mt-3 w-full" : "mt-6 w-full"} rounded-xl border border-red-200 px-4 py-3.5 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50`}
                      title="Delete assessment"
                    >
                      {deletingId === test.id ? "Deleting..." : "Delete assessment"}
                    </button>

                    {/* Published */}
                    {isPublished && (
                      <div className="mt-6 flex gap-2">
                        <div className="flex-1 rounded-xl bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-700 flex items-center justify-center">
                          Published assessment
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${window.location.origin}/give-test/${test.id}`;
                            navigator.clipboard.writeText(link);
                            toast({ title: "Copied!", description: "Link copied to clipboard." });
                          }}
                          className="rounded-xl bg-blue-100 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-200"
                          title="Copy Public Link"
                        >
                          Copy Link
                        </button>
                      </div>
                    )}

                    {/* Closed */}
                    {isClosed && (
                      <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-bold text-red-700">
                        Assessment closed
                      </div>
                    )}

                    {/* Archived */}
                    {isArchived && (
                      <div className="mt-6 rounded-xl bg-muted px-4 py-3 text-center text-xs font-bold text-muted-foreground">
                        Archived assessment
                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

      </main>
    </div>
  );
}