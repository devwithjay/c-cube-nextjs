import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  adminLogin,
  getSavedAdminToken,
  saveAdminToken
} from "../../services/adminApi.js";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existingToken = getSavedAdminToken();

    if (existingToken) {
      navigate("/admin/dashboard", {
        replace: true
      });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminLogin(
        trimmedEmail,
        password
      );

      const token = response?.data?.token;

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned."
        );
      }

      saveAdminToken(token);

      navigate("/admin/dashboard", {
        replace: true
      });
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-black/5 bg-white p-8 shadow-xl sm:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-white shadow-lg">
              C
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
              C Cube
            </p>

            <h1 className="mt-3 font-display text-4xl font-black tracking-[-0.04em] text-slate-950">
              Admin Portal
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in to manage the 3Q assessment.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@vit.edu"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in to Admin"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-xs leading-5 text-slate-400">
              C Cube • Character • Competence • Culture
              <br />
              VIT Pune • AY 2026–27
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}