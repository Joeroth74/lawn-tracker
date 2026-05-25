import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-4">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
