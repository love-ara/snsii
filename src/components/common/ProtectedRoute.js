import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirects = { LEARNER: "/learner/lessons", PARENT: "/parent/progress", ADMIN: "/admin/dashboard" };
    return <Navigate to={redirects[user.role] || "/login"} replace />;
  }

  return children;
}
