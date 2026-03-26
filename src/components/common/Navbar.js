import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  const navLinks = {
    LEARNER: [{ to: "/learner/lessons", label: "My Lessons" }],
    PARENT:  [{ to: "/parent/progress", label: "Progress" }],
    ADMIN:   [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/admin/exports",   label: "Exports" },
    ],
  };

  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-brand-600 font-semibold text-lg tracking-tight">
          SNSI
        </Link>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {user.role}
              </span>
              <button onClick={handleSignOut} className="btn-secondary text-xs px-3 py-1.5">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
