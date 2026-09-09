import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function Ticket(){
  const {id}=useParams(); const [booking,setBooking]=useState(null); const [event,setEvent]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{api.get(`/bookings/${id}`).then(async r=>{setBooking(r.data); const e=await api.get(`/events/${r.data.eventId}`); setEvent(e.data);}).catch(()=>setError("Ticket not found."));},[id]);
  if(error)return <div className="empty-state"><h2>{error}</h2></div>; if(!booking||!event)return <div className="loading-state">Preparing your ticket...</div>;
  const qr=`https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(booking.bookingCode)}`;
  return <div className="ticket-page"><div className="page-heading"><div><span className="section-kicker">YOUR DIGITAL PASS</span><h1>Booking confirmed 🎉</h1><p className="page-subtitle">Show this QR code at the venue.</p></div><Link to={`/reviews/${event.id}`} className="add-btn">⭐ Review Event</Link></div>
    <div className="ticket-shell"><div className="ticket-main"><img className="ticket-image" src={event.image} alt={event.name}/><div className="ticket-info"><span className="date-chip">CONFIRMED</span><h2>{event.name}</h2><p>📅 {event.date} · ⏰ {event.time}</p><p>📍 {event.venue}, {event.location}</p><div className="ticket-grid"><div><small>BOOKING ID</small><strong>{booking.bookingCode}</strong></div><div><small>TICKETS</small><strong>{booking.tickets}</strong></div><div><small>TOTAL PAID</small><strong>₹{booking.totalAmount}</strong></div><div><small>STATUS</small><strong>✓ Confirmed</strong></div></div></div></div><aside className="qr-panel"><img src={qr} alt="Booking QR code"/><strong>Scan to verify</strong><span>{booking.bookingCode}</span></aside></div>
    <div className="ticket-actions"><button className="submit-btn" onClick={()=>window.print()}>🖨️ Print / Save PDF</button><Link className="secondary-btn" to="/dashboard">← My Dashboard</Link></div></div>;
}
