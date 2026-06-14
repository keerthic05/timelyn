import { useState, useEffect } from "react";
import { generateSchedule, getLatestSchedule } from "../api/client";

export default function Schedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useState({ days: 7, work_start: 9, work_end: 22 });

  useEffect(() => {
    getLatestSchedule()
      .then(res => setSchedule(res.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await generateSchedule(params);
      setSchedule(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  // Groups flat block array into { "Thursday, Jun 5": [block, ...], ... }
  const groupByDay = (blocks) => {
    const groups = {};
    blocks.forEach(block => {
      const day = new Date(block.start).toLocaleDateString("en-US", {
        weekday: "long", month: "short", day: "numeric"
      });
      if (!groups[day]) groups[day] = [];
      groups[day].push(block);
    });
    return groups;
  };

  // Format "09:00 – 10:30" from two ISO strings
  const timeRange = (start, end) =>
    `${new Date(start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Timelyn</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-page">Schedule</span>
      </div>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">Generate an optimized plan from your tasks and calendar events</p>
        </div>

        {/* Generate controls card */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-title">Generate new schedule</div>
          <div className="schedule-toolbar">
            <div className="form-group">
              <label className="form-label">Days ahead</label>
              <input type="number" min="1" max="14" value={params.days}
                onChange={e => setParams({ ...params, days: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Day starts (hour)</label>
              <input type="number" min="0" max="23" value={params.work_start}
                onChange={e => setParams({ ...params, work_start: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Day ends (hour)</label>
              <input type="number" min="0" max="23" value={params.work_end}
                onChange={e => setParams({ ...params, work_end: parseInt(e.target.value) })} />
            </div>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "⚡ Generate"}
            </button>
          </div>
          {error && <div className="error-msg" style={{ marginTop: "0.75rem" }}>{error}</div>}
        </div>

        {/* Schedule output */}
        {fetching ? (
          <div className="loading-text">Loading...</div>
        ) : !schedule ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">⚡</div>
              <div className="empty-state-text">
                No schedule yet.<br />Add tasks and events, then hit Generate.
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Timestamp */}
            <div className="schedule-meta">
              ◷ Generated {new Date(schedule.generated_at).toLocaleString()}
            </div>

            {/* Explanation notes from the algorithm */}
            {schedule.explanation?.length > 0 && (
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div className="card-title">Scheduling notes</div>
                <div className="notes-list">
                  {schedule.explanation.map((note, i) => (
                    <div key={i} className={`note-item ${note.startsWith("⚠") ? "warning" : ""}`}>
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-day blocks */}
            {Object.entries(groupByDay(schedule.blocks)).map(([day, blocks]) => (
              <div key={day} className="day-section">
                <div className="day-label">{day}</div>
                <div className="block-list">
                  {blocks.map((block, i) => (
                    <div key={i} className={`sched-block ${block.block_type === "fixed" ? "sched-block-fixed" : "sched-block-task"}`}>
                      {/* Time column — monospace numbers stay aligned */}
                      <div className="sched-time">{timeRange(block.start, block.end)}</div>
                      <div className="sched-info">
                        <div className="sched-title">{block.title}</div>
                        {/* Only task blocks have a reason field */}
                        {block.reason && <div className="sched-reason">{block.reason}</div>}
                      </div>
                      {/* Small badge indicating block type */}
                      <span className={`badge ${block.block_type === "fixed" ? "badge-green" : "badge-blue"}`}>
                        {block.block_type === "fixed" ? "event" : "task"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}