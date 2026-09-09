import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("eventhub-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("eventhub-theme", theme);
  }, [theme]);

  useEffect(() => {
    const sync = async () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(currentUser);
      if (!currentUser?.id) {
        setFavoriteCount(0);
        return;
      }
      try {
        const response = await api.get("/favorites");
        setFavoriteCount((response.data || []).filter(item => String(item.userId) === String(currentUser.id)).length);
      } catch (error) {
        console.error("Unable to load favorite count:", error);
        setFavoriteCount(0);
      }
    };
    window.addEventListener("favoritesChanged", sync);
    window.addEventListener("authChanged", sync);
    return () => {
      window.removeEventListener("favoritesChanged", sync);
      window.removeEventListener("authChanged", sync);
    };
  }, []);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    if (currentUser?.id) {
      api.get("/favorites").then(response => {
        setFavoriteCount((response.data || []).filter(item => String(item.userId) === String(currentUser.id)).length);
      }).catch(() => setFavoriteCount(0));
    }
  }, [user?.id]);

  function handleLogout() {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  }

  return <header className="site-header">
    <nav className="navbar">
      <Link to="/" className="brand"><span className="brand-mark">🎉</span><span>Event<span>Hub</span></span></Link>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>Explore Events</NavLink>
        {user && <NavLink to="/calendar" className={({ isActive }) => isActive ? "active" : ""}>📅 Calendar</NavLink>}
        <NavLink to="/favorites" className={({ isActive }) => isActive ? "active" : ""}>❤️ Favorites <b className="nav-count">{favoriteCount}</b></NavLink>
        {user?.role === "CUSTOMER" && <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>My Dashboard</NavLink>}
        {user?.role === "ORGANIZER" && <NavLink to="/organizer" className={({ isActive }) => isActive ? "active" : ""}>Organizer</NavLink>}
        {user?.role === "ADMIN" && <><NavLink to="/organizer" className={({ isActive }) => isActive ? "active" : ""}>Organizer</NavLink><NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>Admin</NavLink></>}
        {(user?.role === "ORGANIZER" || user?.role === "ADMIN") && <NavLink to="/add-event" className={({ isActive }) => isActive ? "active" : ""}>✨ Create Event</NavLink>}
      </div>
      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        {user ? <><span className="welcome">Hi, {user.name} · {user.role} 👋</span><button className="logout-btn" onClick={handleLogout}>Logout</button></> : <><Link className="login-link" to="/login">Login</Link><Link className="nav-cta" to="/register">Get Started 🚀</Link></>}
      </div>
    </nav>
  </header>;
}
export default Navbar;
