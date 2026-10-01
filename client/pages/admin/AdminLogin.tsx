import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, saveAdminToken } from "../../services/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response: any = await adminLogin(email, password);
      const token = response?.data?.token;

      if (!token) {
        throw new Error("Login succeeded without an authentication token.");
      }

      saveAdminToken(token);
      navigate("/admin/dashboard", { replace: true });
    } catch (requestError: any) {
      setError(requestError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <img src="/assets/ccubelogo.png" alt="C Cube" className="h-16 w-16 mb-4" />
          <h1 className="text-2xl font-bold text-foreground">C Cube Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage assessments.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-foreground">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-foreground">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
