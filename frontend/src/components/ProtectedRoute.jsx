import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();

  // se o Provider não estiver envolvido, auth fica null
  if (!auth) return <Navigate to="/login" replace />;

  const { isAuthenticated, loading } = auth;

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
