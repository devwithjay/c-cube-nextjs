import {
  useNavigate
} from "react-router-dom";

import {
  clearAdminToken
} from "../../services/adminApi.js";

export default function AdminLayout({
  children,
  title = "Admin Panel"
}) {
  const navigate = useNavigate();

  function handleLogout() {
    clearAdminToken();

    navigate(
      "/admin/login",
      {
        replace: true
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#f5efe6]">

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
              C Cube Admin
            </p>

            <h1 className="mt-1 font-display text-2xl font-black text-slate-950">
              {title}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>

        </div>
      </header>

      {children}

    </div>
  );
}