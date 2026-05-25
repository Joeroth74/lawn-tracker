import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useAuth } from "../auth/AuthContext";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function Login() {
  const { loading: authLoading, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const redirectPath = state?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-white sm:bg-gray-50 flex items-center justify-center p-4">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (session) {
    return <Navigate to={redirectPath} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setMessage("Signed in successfully.");
    setLoading(false);
    navigate(redirectPath, { replace: true });
  }

  async function handlePasswordReset() {
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Enter your email first, then request a password reset.");
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Password reset email sent.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-white sm:bg-gray-50 flex items-start sm:items-center justify-center px-4 py-10 sm:p-4">
      <div className="w-full max-w-sm bg-white sm:rounded-lg sm:border sm:border-gray-200 sm:shadow-sm sm:p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LawnTracker</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors min-h-12"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={loading}
          className="text-sm font-medium text-green-700 hover:text-green-800 disabled:text-gray-400 min-h-11"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
}
