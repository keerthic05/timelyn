import { useState, useEffect } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "../api/client";

const WINDOWS = ["any", "morning", "afternoon", "evening"];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    estimated_duration: 30,
    deadline: "",
    priority: 2,
    preferred_window: "any",
    splittable: false,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...form,
        estimated_duration: parseInt(form.estimated_duration),
        priority: parseInt(form.priority),
      });
      setForm({
        title: "",
        estimated_duration: 30,
        deadline: "",
        priority: 2,
        preferred_window: "any",
        splittable: false,
      });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete task");
    }
  };

  const handleComplete = async (task) => {
    try {
      await updateTask(task.id, { completed: true });
      setTasks(tasks.filter((t) => t.id !== task.id));
    } catch {
      setError("Failed to update task");
    }
  };

  const priorityLabel = (p) =>
    ["", "Low", "Medium", "High", "Urgent", "Critical"][p];

  return (
    <div className="page">
      <h1>Tasks</h1>
      <div className="two-col">
        <div className="card">
          <h2>Add Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Finish CS389 homework"
              />
            </div>
            <div className="form-group">
              <label>Estimated Duration (minutes)</label>
              <input
                type="number"
                min="5"
                value={form.estimated_duration}
                onChange={(e) =>
                  setForm({ ...form, estimated_duration: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Priority (1–5): {priorityLabel(parseInt(form.priority))}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Preferred Time Window</label>
              <select
                value={form.preferred_window}
                onChange={(e) =>
                  setForm({ ...form, preferred_window: e.target.value })
                }
              >
                {WINDOWS.map((w) => (
                  <option key={w} value={w}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.splittable}
                  onChange={(e) =>
                    setForm({ ...form, splittable: e.target.checked })
                  }
                />
                {" "}Splittable (can be broken into multiple sessions)
              </label>
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">
              Add Task
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Pending Tasks ({tasks.length})</h2>
          {loading ? (
            <p>Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="empty">No tasks yet. Add one to get started!</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="task-info">
                    <strong>{task.title}</strong>
                    <span className="task-meta">
                      {task.estimated_duration} min ·{" "}
                      {priorityLabel(task.priority)} priority ·{" "}
                      {task.preferred_window}
                    </span>
                    <span className="task-deadline">
                      Due: {new Date(task.deadline).toLocaleString()}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn-success"
                      onClick={() => handleComplete(task)}
                    >
                      ✓
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(task.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}