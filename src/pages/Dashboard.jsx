import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!user?.id) {
      setBookings([]);
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all bookings and filter locally.
      // This is more reliable with different JSON Server versions
      // and also handles numeric/string user IDs consistently.
      const [bookingsResponse, eventsResponse] = await Promise.all([
        api.get("/bookings"),
        api.get("/events")
      ]);

      const currentUserId = String(user.id);
      const userBookings = (bookingsResponse.data || []).filter(
        (booking) => String(booking.userId) === currentUserId
      );

      setBookings(userBookings);
      setEvents(eventsResponse.data || []);
    } catch (error) {
      console.error("Unable to load dashboard data:", error);
      setBookings([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard();

    // Refresh the dashboard whenever a booking is created/changed.
    window.addEventListener("bookingsChanged", loadDashboard);

    return () => {
      window.removeEventListener("bookingsChanged", loadDashboard);
    };
  }, [loadDashboard]);

  const getEvent = (id) =>
    events.find((event) => String(event.id) === String(id));

  const totalTickets = bookings.reduce(
    (sum, booking) => sum + Number(booking.tickets || 0),
    0
  );

  const totalSpent = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0
  );

  const upcomingBookings = bookings.filter((booking) => {
    const event = getEvent(booking.eventId);
    return event && new Date(event.date) >= new Date();
  }).length;

  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setFavoriteCount(0);
      return;
    }
    const loadFavoriteCount = async () => {
      try {
        const response = await api.get("/favorites");
        setFavoriteCount((response.data || []).filter(item => String(item.userId) === String(user.id)).length);
      } catch (error) {
        console.error("Unable to load favorite count:", error);
        setFavoriteCount(0);
      }
    };
    loadFavoriteCount();
    window.addEventListener("favoritesChanged", loadFavoriteCount);
    return () => window.removeEventListener("favoritesChanged", loadFavoriteCount);
  }, [user?.id]);

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">CUSTOMER SPACE</span>
          <h1>Welcome, {user?.name || "Customer"} 👋</h1>
          <p className="page-subtitle">
            Your bookings, tickets and saved experiences.
          </p>
        </div>
        <Link to="/events" className="add-btn">
          Explore Events ✨
        </Link>
      </div>

      <div className="stats-grid">
        <div>
          <span>🎟️</span>
          <strong>{bookings.length}</strong>
          <small>Total bookings</small>
        </div>

        <div>
          <span>💳</span>
          <strong>₹{totalSpent}</strong>
          <small>Total spent</small>
        </div>

        <div>
          <span>📅</span>
          <strong>{upcomingBookings}</strong>
          <small>Upcoming</small>
        </div>

        <div>
          <span>❤️</span>
          <strong>{favoriteCount}</strong>
          <small>Favorites</small>
        </div>
      </div>

      {/* Helpful when one booking contains multiple members/tickets. */}
      {totalTickets > 0 && (
        <p className="muted" style={{ marginTop: "-12px" }}>
          🎫 You have {totalTickets} ticket{totalTickets === 1 ? "" : "s"} booked
          across {bookings.length} booking{bookings.length === 1 ? "" : "s"}.
        </p>
      )}

      <div className="section-head">
        <div>
          <span className="section-kicker">YOUR PASSES</span>
          <h2>My Bookings 🎫</h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading your bookings...</div>
      ) : bookings.length ? (
        <div className="booking-list">
          {bookings
            .slice()
            .reverse()
            .map((booking) => {
              const event = getEvent(booking.eventId);

              return (
                <div className="booking-row" key={booking.id}>
                  <div className="booking-thumb">
                    {event && <img src={event.image} alt="" />}
                  </div>

                  <div>
                    <h3>{booking.eventName}</h3>
                    <p>
                      📅 {event?.date || ""} · 🎟️ {booking.tickets} ticket(s) · ₹
                      {booking.totalAmount}
                    </p>
                    <small>{booking.bookingCode}</small>
                  </div>

                  <div className="booking-row-actions">
                    <Link to={`/ticket/${booking.id}`}>View Ticket</Link>
                    {event && (
                      <Link to={`/reviews/${event.id}`}>Review</Link>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="empty-state">
          <div>🎟️</div>
          <h2>No bookings yet</h2>
          <p>Find an event and reserve your first experience.</p>
          <Link to="/events" className="hero-button">
            Explore Events →
          </Link>
        </div>
      )}
    </div>
  );
}
