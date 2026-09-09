import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function Favorites() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [favoritesResponse, eventsResponse] = await Promise.all([
        api.get("/favorites"),
        api.get("/events")
      ]);
      const events = eventsResponse.data || [];
      const userFavorites = (favoritesResponse.data || [])
        .filter(item => String(item.userId) === String(user.id))
        .map(item => ({ ...item, event: events.find(e => String(e.id) === String(item.eventId)) }))
        .filter(item => item.event);
      setFavorites(userFavorites);
    } catch (error) {
      console.error("Unable to load favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
    window.addEventListener("favoritesChanged", loadFavorites);
    return () => window.removeEventListener("favoritesChanged", loadFavorites);
  }, [loadFavorites]);

  async function remove(id) {
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites(current => current.filter(item => String(item.id) !== String(id)));
      window.dispatchEvent(new Event("favoritesChanged"));
    } catch (error) {
      console.error("Unable to remove favorite:", error);
    }
  }

  return <div className="favorites-page"><div className="page-heading"><div><span className="section-kicker">YOUR COLLECTION</span><h1>Favorite Events ❤️</h1><p className="page-subtitle">Your hand-picked plans, saved for later.</p></div><Link to="/events" className="add-btn">Explore More ✨</Link></div>{!user ? <div className="empty-state"><div>🔐</div><h2>Login to save favorites</h2><p>Your favorite events are saved to your account.</p><Link to="/login" className="hero-button">Login →</Link></div> : loading ? <div className="loading-state">Loading your favorites...</div> : favorites.length ? <div className="events">{favorites.map(item => { const e=item.event; return <article className="event-card" key={item.id}><div className="card-image-wrap"><img src={e.image} alt={e.name}/><span className="card-category">{e.category}</span><button className="favorite-btn active" onClick={()=>remove(item.id)}>❤️</button></div><div className="event-content"><div className="date-chip">📅 {e.date}</div><h3>{e.name}</h3><p>📍 {e.location}</p><p>⭐ {e.rating} · ₹{e.price}</p><Link to={`/events/${e.id}`} className="view-btn full-btn">View Event →</Link></div></article>; })}</div> : <div className="empty-state"><div>💖</div><h2>Your favorites are waiting!</h2><p>Tap the heart on any event to save it here.</p><Link to="/events" className="hero-button">Explore Events →</Link></div>}</div>;
}
export default Favorites;
