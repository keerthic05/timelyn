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
          if (isRegister) {
            await register(email, password);
          }
      
          const res = await login(email, password);
          const token = res.data.access_token;
      
          // Save token to localStorage FIRST before making any authenticated requests
          // The axios interceptor in client.js reads from localStorage,
          // so this must happen before the getMe() call below
          localStorage.setItem("token", token);
      
          // Now the interceptor will find the token and attach it to this request
          const meRes = await getMe();
      
          // Pass both token and user to context
          loginUser(token, meRes.data);
          navigate("/dashboard");
      
        } catch (err) {
          // If anything failed, clear the token so we don't leave a partial state
          localStorage.removeItem("token");
          setError(err.response?.data?.detail || "Something went wrong");
        } finally {
          setLoading(false);
        }
      };
    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>⏱ Timelyn</h1>
                <p className="auth-subtitle">Your AI-powered schedule optimizer</p>
                <h2>{isRegister ? "Create account" : "Sign in"}</h2>
                <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
                </button>
                </form>
                <p className="auth-toggle">
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                    className="btn-link"
                    onClick={() => { setIsRegister(!isRegister); setError(""); }}
                >
                    {isRegister ? "Sign in" : "Register"}
                </button>
                </p>
            </div>
        </div>
    );
}