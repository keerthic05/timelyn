import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">⏱ Timelyn</div>
            {user && (
                <div className="navbar-links">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/tasks">Tasks</Link>
                    <Link to="/calendar">Calendar</Link>
                    <Link to="/schedule">Schedule</Link>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}