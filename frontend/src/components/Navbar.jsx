import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// NavLink is like Link but adds an "active" class automatically
// when its href matches the current URL — perfect for sidebar highlighting
export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Only render the sidebar when the user is logged in
  // On the login page there's no sidebar
  if (!user) return null;

  // Get first letter of email for the avatar circle
  const initial = user?.email?.[0]?.toUpperCase() || "U";

  return (
    <aside className="sidebar">
      {/* Brand section at top */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⏱</div>
          Timelyn
        </div>
        <div className="sidebar-tagline">Schedule optimizer</div>
      </div>

      {/* Navigation links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>

        {/* NavLink automatically adds className="active" when route matches */}
        <NavLink to="/dashboard" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }>
          <span className="sidebar-link-icon">⊞</span>
          Dashboard
        </NavLink>

        <NavLink to="/tasks" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }>
          <span className="sidebar-link-icon">✓</span>
          Tasks
        </NavLink>

        <NavLink to="/calendar" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }>
          <span className="sidebar-link-icon">◷</span>
          Calendar
        </NavLink>

        <NavLink to="/schedule" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }>
          <span className="sidebar-link-icon">⚡</span>
          Schedule
        </NavLink>
      </nav>

      {/* User info and logout at bottom */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Out
        </button>
      </div>
    </aside>
  );
}