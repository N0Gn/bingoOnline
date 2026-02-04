import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // ou um loading bonito
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
