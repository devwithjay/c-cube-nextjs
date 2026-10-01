import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
	adminLogin,
	saveAdminToken
} from "../../services/adminApi";

export default function AdminLogin() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await adminLogin(email, password);
			const token = response?.data?.token;

			if (!token) {
				throw new Error("Login succeeded without an authentication token.");
			}

			saveAdminToken(token);
			navigate("/admin/dashboard", { replace: true });
		} catch (requestError) {
			setError(requestError.message || "Unable to sign in.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
			>
				<h1 className="text-3xl font-bold text-gray-900">C Cube Admin</h1>
				<p className="mt-2 text-gray-500">Sign in to manage assessments.</p>

				{error && (
					<div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				)}

				<label className="mt-6 block text-sm font-medium text-gray-700">
					Email
					<input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						autoComplete="email"
						required
						className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
					/>
				</label>

				<label className="mt-4 block text-sm font-medium text-gray-700">
					Password
					<input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						autoComplete="current-password"
						required
						className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
					/>
				</label>

				<button
					type="submit"
					disabled={loading}
					className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{loading ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</div>
	);
}
