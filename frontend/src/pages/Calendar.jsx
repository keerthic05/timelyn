import { useState, useEffect } from "react";
import { getEvents, createEvent, deleteEvent } from "../api/client";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", start_time: "", end_time: "" });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(form);
      setForm({ title: "", start_time: "", end_time: "" });
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create event");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter((ev) => ev.id !== id));
    } catch {
      setError("Failed to delete event");
    }
  };

  return (
    <div className="page">
      <h1>Calendar Events</h1>
      <p className="subtitle">
        Add your fixed commitments so Timelyn can schedule around them.
      </p>
      <div className="two-col">
        <div className="card">
          <h2>Add Event</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. CS389 Lecture"
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">
              Add Event
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Your Events ({events.length})</h2>
          {loading ? (
            <p>Loading...</p>
          ) : events.length === 0 ? (
            <p className="empty">No events yet.</p>
          ) : (
            <ul className="task-list">
              {events
                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                .map((ev) => (
                  <li key={ev.id} className="task-item">
                    <div className="task-info">
                      <strong>{ev.title}</strong>
                      <span className="task-meta">
                        {new Date(ev.start_time).toLocaleString()} →{" "}
                        {new Date(ev.end_time).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(ev.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}