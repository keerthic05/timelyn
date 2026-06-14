import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, getMe } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) await register(email, password);
      const res = await login(email, password);
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      const meRes = await getMe();
      loginUser(token, meRes.data);
      navigate("/dashboard");
    } catch (err) {
      localStorage.removeItem("token");
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Two-panel layout: decorative left + form right */
    <div className="auth-page">

      {/* Left decorative panel */}
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">⏱</div>
          Timelyn
        </div>

        <div className="auth-hero">
          <div className="auth-hero-title">
            Your week,<br />optimized.
          </div>
          <div className="auth-hero-sub">
            Add your tasks and commitments. Timelyn's scheduling engine
            builds the most effective plan for your week — automatically.
          </div>
        </div>

        {/* Feature highlights at bottom of left panel */}
        <div className="auth-features">
          {["Deadline-aware scheduling", "Priority-based task ordering",
            "Respects your calendar events", "Explains every decision"].map(f => (
            <div key={f} className="auth-feature">
              <div className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div className="auth-form-title">
            {isRegister ? "Create account" : "Welcome back"}
          </div>
          <div className="auth-form-sub">
            {isRegister
              ? "Start optimizing your schedule today"
              : "Sign in to your Timelyn account"}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div style={{ marginTop: "1.25rem" }}>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
              </button>
            </div>
          </form>

          <div className="auth-divider" />

          <div className="auth-toggle-text">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button className="auth-toggle-btn" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
              {isRegister ? "Sign in" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}