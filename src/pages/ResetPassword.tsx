import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../utils/supabase";

export default function ResetPassword() {
  const { loading: authLoading, session } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-white sm:bg-gray-50 flex items-center justify-center p-4">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-dvh bg-white sm:bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10 sm:p-4">
      <div className="w-full max-w-sm bg-white sm:rounded-lg sm:border sm:border-gray-200 sm:shadow-sm sm:p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors min-h-12"
          >
            {loading ? "Saving..." : "Save Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
