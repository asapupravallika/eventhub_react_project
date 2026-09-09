import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import EventCard from "../components/EventCard";

const categories = ["🎵 Music", "💻 Technology", "💼 Business", "🎨 Arts", "🏃 Sports", "🍴 Food", "🧘 Wellness", "📚 Education"];

function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [events, setEvents] = useState([]);
  useEffect(() => { api.get("/events").then(r => setEvents(r.data)).catch(() => {}); }, []);
  const featured = events.slice(0, 4);
  const deleteEvent = async id => { if (!window.confirm("Delete this event?")) return; await api.delete(`/events/${id}`); setEvents(events.filter(e => e.id !== id)); };

  return <div className="home">
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow light">✨ PLAN · DISCOVER · EXPERIENCE</span>
        <h1>Find your next <em>unforgettable</em> experience.</h1>
        <p>From live concerts and tech summits to food festivals and creative workshops — discover events that make life more exciting.</p>
        <div className="hero-actions"><Link to="/events" className="hero-button">Explore Events <span>→</span></Link><Link to={user ? "/add-event" : "/register"} className="hero-secondary">{user ? "Create an Event ✨" : "Join EventHub 🚀"}</Link></div>
        <div className="hero-trust"><span>🎟️ 100+ experiences</span><span>🌈 Something for everyone</span><span>📍 Across India</span></div>
      </div>
      <div className="hero-art"><div className="hero-glow"></div><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="hero-tile tile-main">🎪<strong>Make plans.<br/>Make memories.</strong><small>Good times are waiting.</small></div><div className="hero-tile tile-small">🎶<strong>Live.<br/>Laugh.<br/>Connect.</strong></div><div className="hero-emoji">✨</div></div>
    </section>

    <section className="quick-categories"><div className="section-kicker">BROWSE BY VIBE</div><h2>What are you in the mood for? 😍</h2><div className="category-pills">{categories.map(c => <Link key={c} to={`/events?category=${encodeURIComponent(c.split(" ").slice(1).join(" "))}`}>{c}</Link>)}</div></section>

    <section className="feature-row"><div><span>01</span><h3>Discover 🌍</h3><p>Explore conferences, concerts, festivals, workshops and experiences.</p></div><div><span>02</span><h3>Save ❤️</h3><p>Keep your favorite events in one place and come back anytime.</p></div><div><span>03</span><h3>Create ✨</h3><p>Publish your own event and share it with your community.</p></div></section>

    <section className="featured-section"><div className="section-head"><div><span className="section-kicker">DON'T MISS OUT</span><h2>Trending events 🔥</h2></div><Link to="/events">See all events →</Link></div><div className="events">{featured.map(event => <EventCard key={event.id} event={event} onDelete={deleteEvent} />)}</div></section>
  </div>;
}
export default Home;
