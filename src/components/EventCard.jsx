import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function EventCard({ event, onDelete }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canManage = user && (user.role === "ADMIN" || ((user.role === "ORGANIZER") && (String(event.organizerId) === String(user.id) || event.organizerEmail === user.email)));
  const [favorite, setFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorite() {
      if (!user?.id) {
        setFavorite(false);
        setFavoriteId(null);
        return;
      }
      try {
        const response = await api.get("/favorites");
        const record = (response.data || []).find(
          item => String(item.userId) === String(user.id) && String(item.eventId) === String(event.id)
        );
        if (!cancelled) {
          setFavorite(Boolean(record));
          setFavoriteId(record?.id ?? null);
        }
      } catch (error) {
        console.error("Unable to load favorite:", error);
      }
    }

    loadFavorite();
    return () => { cancelled = true; };
  }, [event.id, user?.id]);

  async function toggleFavorite() {
    if (!user?.id) {
      alert("Please login to save favorite events.");
      return;
    }

    setFavoriteLoading(true);
    try {
      if (favorite && favoriteId != null) {
        await api.delete(`/favorites/${favoriteId}`);
        setFavorite(false);
        setFavoriteId(null);
      } else {
        const response = await api.post("/favorites", {
          userId: String(user.id),
          eventId: String(event.id),
          createdAt: new Date().toISOString()
        });
        setFavorite(true);
        setFavoriteId(response.data.id);
      }
      window.dispatchEvent(new Event("favoritesChanged"));
    } catch (error) {
      console.error("Unable to update favorite:", error);
      alert("Could not update favorite. Please make sure JSON Server is running.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <article className="event-card">
      <div className="card-image-wrap">
        <img src={event.image} alt={event.name} />
        <span className="card-category">{event.category}</span>
        <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={toggleFavorite} disabled={favoriteLoading} aria-label="Toggle favorite">
          {favorite ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="event-content">
        <div className="date-chip">📅 {new Date(event.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
        <h3>{event.name}</h3>
        <p>📍 {event.location} · {event.venue}</p>
        <p>⏰ {event.time} · ⭐ {event.rating}</p>
        <div className="price-row"><strong>{event.price === 0 ? "Free" : `₹${event.price}`}</strong><span>{event.availableSeats} seats left</span></div>
        <div className="card-actions">
          <Link to={`/events/${event.id}`} className="view-btn">View Event →</Link>
          {canManage && <><Link to={`/edit-event/${event.id}`} className="edit-btn">Edit</Link><button className="delete-btn" onClick={() => onDelete(event.id)}>Delete</button></>}
        </div>
      </div>
    </article>
  );
}
export default EventCard;
