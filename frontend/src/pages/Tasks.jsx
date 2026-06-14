import { useState, useEffect } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "../api/client";

const WINDOWS = ["any", "morning", "afternoon", "evening"];
const PRIORITY_LABELS = ["", "Low", "Medium", "High", "Urgent", "Critical"];
const PRIORITY_BADGE = ["", "badge-gray", "badge-gray", "badge-blue", "badge-orange", "badge-orange"];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", estimated_duration: 30, deadline: "",
    priority: 2, preferred_window: "any", splittable: false,
  });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch { setError("Failed to load tasks"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createTask({
        ...form,
        estimated_duration: parseInt(form.estimated_duration),
        priority: parseInt(form.priority),
        deadline: form.deadline,
      });
      setForm({ title: "", estimated_duration: 30, deadline: "", priority: 2, preferred_window: "any", splittable: false });
      fetchTasks();
    } catch (err) { setError(err.response?.data?.detail || "Failed to create task"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch { setError("Failed to delete task"); }
  };

  const handleComplete = async (task) => {
    try {
      await updateTask(task.id, { completed: true });
      setTasks(tasks.filter(t => t.id !== task.id));
    } catch { setError("Failed to update task"); }
  };

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Timelyn</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-page">Tasks</span>
      </div>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Add tasks with deadlines and priorities for the scheduler to place</p>
        </div>

        <div className="two-col">
          {/* Add task form */}
          <div className="card">
            <div className="card-title">New task</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required placeholder="e.g. Finish CS389 homework" />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" min="5" value={form.estimated_duration}
                  onChange={e => setForm({ ...form, estimated_duration: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input type="datetime-local" value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Priority
                  {/* Live badge showing current priority label */}
                  <span className={`badge ${PRIORITY_BADGE[parseInt(form.priority)]}`} style={{ marginLeft: "0.5rem" }}>
                    {PRIORITY_LABELS[parseInt(form.priority)]}
                  </span>
                </label>
                <input type="range" min="1" max="5" value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred window</label>
                <select value={form.preferred_window}
                  onChange={e => setForm({ ...form, preferred_window: e.target.value })}>
                  {WINDOWS.map(w => (
                    <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.splittable}
                    onChange={e => setForm({ ...form, splittable: e.target.checked })} />
                  Splittable into multiple sessions
                </label>
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div style={{ marginTop: "1.25rem" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Add task
                </button>
              </div>
            </form>
          </div>

          {/* Task list */}
          <div className="card">
            <div className="card-title">Pending — {tasks.length} task{tasks.length !== 1 ? "s" : ""}</div>
            {loading ? (
              <div className="loading-text">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✓</div>
                <div className="empty-state-text">No pending tasks.<br />Add one to get started.</div>
              </div>
            ) : (
              <div className="item-list">
                {tasks.map(task => (
                  <div key={task.id} className="item-row">
                    <div className="item-main">
                      <div className="item-title">{task.title}</div>
                      <div className="item-meta">
                        {/* Duration badge */}
                        <span className="badge badge-gray">{task.estimated_duration}m</span>
                        {/* Priority badge — color varies by level */}
                        <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                        {/* Window badge */}
                        <span className="badge badge-gray">{task.preferred_window}</span>
                        {/* Deadline in warning orange */}
                        <span className="badge badge-orange">
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      {/* Green check = mark complete */}
                      <button className="btn-icon btn-icon-success" onClick={() => handleComplete(task)} title="Mark complete">✓</button>
                      {/* Red x = delete */}
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(task.id)} title="Delete">✕</button>
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