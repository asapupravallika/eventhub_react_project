import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    try {
      const response = await api.get(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      if (response.data.length) { localStorage.setItem("user", JSON.stringify(response.data[0])); window.dispatchEvent(new Event("authChanged")); navigate("/"); }
      else setError("Invalid email or password.");
    } catch { setError("Unable to sign in. Make sure JSON Server is running."); }
  }
  return <div className="auth-page">
    <div className="auth-visual login-visual"><span className="auth-badge">EVENTHUB</span><h1>Your next great event starts here.</h1><p>Discover, create, book and manage events with one polished experience.</p><div className="floating-event-card"><span>ROLES</span><strong>Customer · Organizer · Admin</strong><small>🎟️ Book · ✨ Create · 📊 Manage</small></div></div>
    <div className="auth-card"><div className="auth-heading"><span className="eyebrow">WELCOME BACK</span><h2>Sign in</h2><p>Access your EventHub dashboard.</p></div>{error && <p className="form-error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form"><label>Email address<input required type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input required type="password" placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)} /></label><button className="submit-btn">Sign in →</button></form>
      <div className="demo-hint"><strong>Demo accounts</strong><br/>Admin: pravallika@gmail.com / admin123<br/>Customer: appu@gmail.com / appu123<br/>Organizer: siddu@gmail.com / siddu123</div>
      <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p></div>
  </div>;
}
export default Login;
