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
      .then((res) => setSchedule(res.data))
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

  const groupByDay = (blocks) => {
    const groups = {};
    blocks.forEach((block) => {
      const day = new Date(block.start).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (!groups[day]) groups[day] = [];
      groups[day].push(block);
    });
    return groups;
  };

  return (
    <div className="page">
      <h1>Schedule</h1>
      <div className="card schedule-controls">
        <h2>Generate New Schedule</h2>
        <div className="controls-row">
          <div className="form-group">
            <label>Days ahead</label>
            <input
              type="number"
              min="1"
              max="14"
              value={params.days}
              onChange={(e) => setParams({ ...params, days: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>Work day start (hour)</label>
            <input
              type="number"
              min="0"
              max="23"
              value={params.work_start}
              onChange={(e) =>
                setParams({ ...params, work_start: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Work day end (hour)</label>
            <input
              type="number"
              min="0"
              max="23"
              value={params.work_end}
              onChange={(e) =>
                setParams({ ...params, work_end: parseInt(e.target.value) })
              }
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "⚡ Generate"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {fetching ? (
        <p>Loading schedule...</p>
      ) : !schedule ? (
        <div className="card">
          <p className="empty">
            No schedule yet. Add some tasks and calendar events, then hit Generate!
          </p>
        </div>
      ) : (
        <div className="schedule-output">
          <p className="schedule-meta">
            Generated: {new Date(schedule.generated_at).toLocaleString()}
          </p>

          {schedule.explanation?.length > 0 && (
            <div className="card explanation">
              <h3>📋 Scheduling Notes</h3>
              <ul>
                {schedule.explanation.map((note, i) => (
                  <li key={i} className={note.startsWith("⚠") ? "warning" : ""}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.entries(groupByDay(schedule.blocks)).map(([day, blocks]) => (
            <div key={day} className="day-group">
              <h3 className="day-header">{day}</h3>
              <div className="blocks">
                {blocks.map((block, i) => (
                  <div
                    key={i}
                    className={`block ${block.block_type === "fixed" ? "block-fixed" : "block-task"}`}
                  >
                    <div className="block-time">
                      {new Date(block.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {new Date(block.end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="block-title">{block.title}</div>
                    {block.reason && (
                      <div className="block-reason">{block.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}