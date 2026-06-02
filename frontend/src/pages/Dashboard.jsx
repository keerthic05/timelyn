import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="page">
            <div className="dashboard-header">
                <h1>Welcome back 👋</h1>
                <p className="subtitle">{user?.email}</p>
            </div>
            <div className="dashboard-grid">
                <Link to="/tasks" className="dashboard-card">
                    <div className="card-icon">📋</div>
                    <h3>Tasks</h3>
                    <p>Add and manage your pending tasks with deadlines and priorities</p>
                </Link>
                <Link to="/calendar" className="dashboard-card">
                    <div className="card-icon">📅</div>
                    <h3>Calendar Events</h3>
                    <p>Add your fixed commitments - classes, meetings, gym</p>
                </Link>
                <Link to="/schedule" className="dashboard-card">
                    <div className="card-icon">⚡</div>
                    <h3>Generate Schedule</h3>
                    <p>Let Timelyn optimize your week around your commitments</p>
                </Link>
            </div>
        </div>
    );
}