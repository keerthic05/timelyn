import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTasks, getEvents } from "../api/client";

export default function Dashboard() {
  const { user } = useAuth();
  // Track task and event counts for the stat cards
  const [taskCount, setTaskCount] = useState("—");
  const [eventCount, setEventCount] = useState("—");

  // Fetch counts on mount so stat cards show real numbers
  useEffect(() => {
    getTasks().then(r => setTaskCount(r.data.length)).catch(() => {});
    getEvents().then(r => setEventCount(r.data.length)).catch(() => {});
  }, []);

  // Format today's date for display
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <>
      {/* Topbar — thin header showing current section */}
      <div className="topbar">
        <span className="topbar-title">Timelyn</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-page">Dashboard</span>
      </div>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Good to see you</h1>
          <p className="page-subtitle">{today}</p>
        </div>

        {/* Stat cards row — show live counts from the API */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Pending tasks</div>
            <div className="stat-value">{taskCount}</div>
            <div className="stat-sub">awaiting scheduling</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Calendar events</div>
            <div className="stat-value">{eventCount}</div>
            <div className="stat-sub">fixed commitments</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Account</div>
            {/* Show just the username part of the email */}
            <div className="stat-value" style={{ fontSize: "1.1rem", paddingTop: "0.4rem" }}>
              {user?.email?.split("@")[0]}
            </div>
            <div className="stat-sub">{user?.email}</div>
          </div>
        </div>

        {/* Quick action cards */}
        <div style={{ marginBottom: "1rem" }}>
          <div className="card-title" style={{ marginBottom: "0.75rem" }}>Quick actions</div>
        </div>
        <div className="action-grid">
          <Link to="/tasks" className="action-card">
            <div className="action-card-icon">✓</div>
            <div className="action-card-title">Manage Tasks</div>
            <div className="action-card-desc">Add tasks with deadlines, priorities, and preferred time windows</div>
          </Link>
          <Link to="/calendar" className="action-card">
            <div className="action-card-icon">◷</div>
            <div className="action-card-title">Calendar Events</div>
            <div className="action-card-desc">Block off classes, meetings, and other fixed commitments</div>
          </Link>
          <Link to="/schedule" className="action-card">
            <div className="action-card-icon">⚡</div>
            <div className="action-card-title">Generate Schedule</div>
            <div className="action-card-desc">Let Timelyn build an optimized plan for your week</div>
          </Link>
        </div>
      </div>
    </>
  );
}