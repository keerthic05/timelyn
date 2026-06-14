import { useState, useEffect } from "react";
import { getEvents, createEvent, deleteEvent } from "../api/client";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", start_time: "", end_time: "" });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch { setError("Failed to load events"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createEvent({
        title: form.title,
        start_time: form.start_time,
        end_time: form.end_time,
      });
      setForm({ title: "", start_time: "", end_time: "" });
      fetchEvents();
    } catch (err) { setError(err.response?.data?.detail || "Failed to create event"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter(ev => ev.id !== id));
    } catch { setError("Failed to delete event"); }
  };

  // Format a datetime string as "Thu, Jun 5 · 10:00 AM"
  const formatRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Timelyn</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-page">Calendar</span>
      </div>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Calendar Events</h1>
          <p className="page-subtitle">Fixed commitments the scheduler will work around</p>
        </div>

        <div className="two-col">
          {/* Add event form */}
          <div className="card">
            <div className="card-title">New event</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required placeholder="e.g. CS389 Lecture" />
              </div>
              <div className="form-group">
                <label className="form-label">Start time</label>
                <input type="datetime-local" value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">End time</label>
                <input type="datetime-local" value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })} required />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div style={{ marginTop: "1.25rem" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Add event
                </button>
              </div>
            </form>
          </div>

          {/* Events list */}
          <div className="card">
            <div className="card-title">Scheduled — {events.length} event{events.length !== 1 ? "s" : ""}</div>
            {loading ? (
              <div className="loading-text">Loading...</div>
            ) : events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◷</div>
                <div className="empty-state-text">No events yet.<br />Add your classes and meetings.</div>
              </div>
            ) : (
              <div className="item-list">
                {events
                  .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                  .map(ev => (
                    <div key={ev.id} className="item-row">
                      <div className="item-main">
                        <div className="item-title">{ev.title}</div>
                        <div className="item-meta">
                          {/* Green badge for calendar events to distinguish from tasks */}
                          <span className="badge badge-green">{formatRange(ev.start_time, ev.end_time)}</span>
                        </div>
                      </div>
                      <div className="item-actions">
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(ev.id)} title="Delete">✕</button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}