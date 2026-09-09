import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Booking() {
  const { id } = useParams(); const navigate = useNavigate(); const user = JSON.parse(localStorage.getItem("user") || "null");
  const [event,setEvent]=useState(null); const [tickets,setTickets]=useState(1); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{api.get(`/events/${id}`).then(r=>setEvent(r.data)).catch(()=>setError("Unable to load event.")).finally(()=>setLoading(false));},[id]);
  async function confirmBooking(){
    if(!event || tickets<1 || tickets>event.availableSeats) return setError("Please choose a valid number of seats.");
    setError("");
    try {
      const bookingCode=`EVT-${Date.now().toString().slice(-7)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      const booking={userId:user.id,eventId:event.id,eventName:event.name,tickets,totalAmount:Number(event.price)*tickets,status:"CONFIRMED",paymentStatus:"DEMO_PAID",bookingCode,createdAt:new Date().toISOString()};
      const saved=await api.post("/bookings",booking);
      await api.patch(`/events/${event.id}`,{availableSeats:event.availableSeats-tickets});
      window.dispatchEvent(new Event("bookingsChanged")); navigate(`/ticket/${saved.data.id}`);
    } catch(e){setError("Booking failed. Please make sure JSON Server is running.");}
  }
  if(loading) return <div className="loading-state">Loading booking...</div>; if(!event) return <div className="empty-state"><h2>{error || "Event not found"}</h2></div>;
  return <div className="booking-page"><div className="page-heading"><div><span className="section-kicker">SECURE YOUR SPOT</span><h1>Book your tickets 🎟️</h1><p className="page-subtitle">Reserve seats for {event.name}.</p></div></div>
    {error&&<p className="form-error">{error}</p>}<div className="booking-layout"><div className="booking-event"><img src={event.image} alt={event.name}/><div><span className="date-chip">📅 {event.date}</span><h2>{event.name}</h2><p>📍 {event.venue}, {event.location}</p><p>{event.description}</p></div></div>
    <div className="booking-card"><h2>Order summary</h2><div className="ticket-stepper"><button onClick={()=>setTickets(Math.max(1,tickets-1))}>−</button><strong>{tickets}</strong><button onClick={()=>setTickets(Math.min(event.availableSeats,tickets+1))}>＋</button></div><p className="muted">Ticket quantity · {event.availableSeats} seats available</p><div className="summary-line"><span>Ticket price</span><strong>₹{event.price}</strong></div><div className="summary-line total"><span>Total</span><strong>₹{Number(event.price)*tickets}</strong></div><button className="submit-btn" onClick={confirmBooking}>Confirm Booking →</button><small className="demo-note">Demo payment: booking is marked as paid locally; no real payment is processed.</small></div></div></div>;
}
export default Booking;
