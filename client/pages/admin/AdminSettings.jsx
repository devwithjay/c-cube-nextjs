import {
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router-dom";

import {
  changeAdminEmail,
  changeAdminPassword,
  getCurrentAdmin,
  saveAdminToken
} from "../../services/adminApi.js";

export default function AdminSettings() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [newEmail, setNewEmail] =
    useState("");

  const [emailPassword, setEmailPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadAdmin() {
      try {
        const response = await getCurrentAdmin();
        setEmail(response?.data?.email || "");
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to load account details."
        );
      }
    }

    loadAdmin();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await changeAdminPassword(
        currentPassword,
        newPassword
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "Password changed successfully."
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await changeAdminEmail(
        emailPassword,
        newEmail
      );

      if (response?.data?.token) {
        saveAdminToken(response.data.token);
      }

      setEmail(response?.data?.admin?.email || newEmail);
      setNewEmail("");
      setEmailPassword("");
      setMessage(
        "Email address changed successfully."
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to change email address."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] px-6 py-10">

      <div className="mx-auto max-w-xl">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="mb-6 text-sm font-bold text-slate-600 hover:text-slate-950"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl sm:p-10">

          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
            Account Settings
          </p>

          <h1 className="mt-2 font-display text-3xl font-black text-slate-950">
            Change Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Manage the credentials for your C Cube
            administrator account.
          </p>

          {message && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <div>
              <label
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                required
                minLength={8}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-slate-950"
              />

              <p className="mt-2 text-xs text-slate-400">
                Minimum 8 characters.
              </p>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </form>

          <div className="my-10 border-t border-slate-100" />

          <h2 className="font-display text-2xl font-black text-slate-950">
            Change Email Address
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your new address must be a valid @vit.edu email.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Current email: <strong>{email || "Loading..."}</strong>
          </div>

          <form
            onSubmit={handleEmailSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(event) =>
                  setNewEmail(event.target.value)
                }
                placeholder="name@vit.edu"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Current Password
              </label>
              <input
                type="password"
                value={emailPassword}
                onChange={(event) =>
                  setEmailPassword(event.target.value)
                }
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-black text-slate-950 hover:bg-slate-50 disabled:opacity-60"
            >
              {loading
                ? "Updating Email..."
                : "Change Email Address"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}