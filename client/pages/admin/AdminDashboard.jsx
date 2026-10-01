import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  getAdminTests,
  clearAdminToken,
  createAdminTest,
  deleteAdminTest
} from "../../services/adminApi.js";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    durationSeconds: 1800
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

  async function handleCreateTest(event) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      const response = await createAdminTest({
        ...createForm,
        durationSeconds: Number(createForm.durationSeconds)
      });
      navigate(`/admin/tests/${response?.data?.id}`);
    } catch (requestError) {
      setError(requestError?.message || "Unable to create assessment.");
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
    <div className="min-h-screen bg-[#f5efe6]">

      {/* =====================================================
          HEADER
         ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Brand */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
              C Cube Admin
            </p>

            <h1 className="mt-1 font-display text-2xl font-black tracking-[-0.03em] text-slate-950">
              Assessment Management
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">

            {/* Settings */}
            <button
              type="button"
              onClick={openSettings}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Settings
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
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

          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Dashboard
          </p>

          <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.04em] text-slate-950">
            3Q Assessments
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Manage assessment versions, sections,
            questions, and publication status.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateForm((current) => !current)}
            className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            {showCreateForm ? "Cancel" : "Create assessment"}
          </button>

        </div>

        {showCreateForm && (
          <form
            onSubmit={handleCreateTest}
            className="mb-8 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-black text-slate-950">
              New assessment
            </h3>
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_220px]">
              <label className="text-sm font-bold text-slate-700">
                Title
                <input
                  required
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      title: event.target.value
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Duration (seconds)
                <input
                  required
                  min="1"
                  type="number"
                  value={createForm.durationSeconds}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      durationSeconds: event.target.value
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                />
              </label>
            </div>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              Description
              <textarea
                rows="3"
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    description: event.target.value
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </label>
            <button
              disabled={creating}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create draft"}
            </button>
          </form>
        )}

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
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

            <p className="text-sm font-semibold text-slate-500">
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
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">

              <h3 className="text-xl font-black text-slate-950">
                No assessments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
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
                    className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                              ? "bg-slate-200 text-slate-600"
                              : "bg-slate-100 text-slate-600"
                          }
                        `}
                      >
                        {test.status}
                      </span>

                    </div>

                    {/* Title */}
                    <h3 className="mt-5 font-display text-2xl font-black tracking-[-0.03em] text-slate-950">
                      {test.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                      {test.description ||
                        "No description provided."}
                    </p>

                    {/* Metadata */}
                    <div className="mt-6 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-[#f5efe6] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Duration
                        </p>

                        <p className="mt-1 text-lg font-black text-slate-950">
                          {durationMinutes} min
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f5efe6] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Version
                        </p>

                        <p className="mt-1 text-lg font-black text-slate-950">
                          v{test.version}
                        </p>
                      </div>

                    </div>

                    {/* Assessment Actions */}
                    {isDraft && (
                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openAssessment(test.id)
                          }
                          className="flex-1 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                        >
                          Manage Assessment
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => openResults(test.id)}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
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
                      <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-700">
                        Published assessment
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
                      <div className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-center text-xs font-bold text-slate-600">
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