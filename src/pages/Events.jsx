import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import EventCard from "../components/EventCard";

function Events() {
  const [events, setEvents] = useState([]); const [error, setError] = useState(""); const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(""); const [category, setCategory] = useState(searchParams.get("category") || "All"); const [sort, setSort] = useState("date");
  useEffect(() => { api.get("/events").then(r => setEvents(r.data)).catch(() => setError("Unable to load events. Make sure JSON Server is running.")); }, []);
  const cats = ["All", ...new Set(events.map(e => e.category))];
  const filtered = useMemo(() => events.filter(e => (category === "All" || e.category === category) && `${e.name} ${e.location} ${e.category}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => sort === "price" ? a.price-b.price : sort === "rating" ? b.rating-a.rating : new Date(a.date)-new Date(b.date)), [events, search, category, sort]);
  async function deleteEvent(id) { if (!window.confirm("Are you sure you want to delete this event?")) return; try { await api.delete(`/events/${id}`); setEvents(current => current.filter(e => e.id !== id)); } catch { setError("Unable to delete the event."); } }
  return <div className="events-page"><div className="page-heading"><div><span className="section-kicker">DISCOVER YOUR NEXT PLAN</span><h1>All Events 🎟️</h1><p className="page-subtitle">Find something exciting to do, learn, celebrate or experience.</p></div>{["ORGANIZER","ADMIN"].includes(JSON.parse(localStorage.getItem("user") || "null")?.role) && <Link to="/add-event" className="add-btn">＋ Create Event</Link>}</div>
    <div className="event-toolbar"><div className="search-box">🔎<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events, cities, categories..." /></div><select value={category} onChange={e=>setCategory(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="date">Soonest</option><option value="rating">Top rated</option><option value="price">Lowest price</option></select></div>
    {error && <p className="form-error">{error}</p>}<p className="result-count">Showing <strong>{filtered.length}</strong> exciting event{filtered.length !== 1 ? "s" : ""} ✨</p>
    <div className="events">{filtered.map(event=><EventCard key={event.id} event={event} onDelete={deleteEvent}/>)}</div>{!filtered.length && <div className="empty-state"><div>🎈</div><h2>No events found</h2><p>Try another search or category.</p></div>}
  </div>;
}
export default Events;
