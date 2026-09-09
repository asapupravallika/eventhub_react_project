import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const user = JSON.parse(localStorage.getItem("user") || "null");

const initialForm = {
  name: "",
  category: "",
  location: "",
  date: "",
  time: "",
  duration: "",
  image: "",
  description: "",
  organizer: "",
  venue: "",
  capacity: "",
  availableSeats: "",
  price: "",
  rating: "",
  contact: "",
  highlights: []
};

function AddEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [highlightsText, setHighlightsText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.post("/events", {
        ...formData,
        organizerId: user?.id,
        organizerEmail: user?.email,
        capacity: Number(formData.capacity),
        availableSeats: Number(formData.availableSeats),
        price: Number(formData.price),
        rating: Number(formData.rating),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        highlights: highlightsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      navigate("/events");
    } catch (err) {
      console.error(err);
      setError("Unable to add the event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-container">
      <h2>Add Event</h2>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input required type="text" name="name" placeholder="Event Name" value={formData.name} onChange={handleChange} />
        <input required type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
        <input required type="text" name="location" placeholder="Location / City" value={formData.location} onChange={handleChange} />
        <input required type="date" name="date" value={formData.date} onChange={handleChange} />
        <input required type="text" name="time" placeholder="Time" value={formData.time} onChange={handleChange} />
        <input required type="text" name="duration" placeholder="Duration" value={formData.duration} onChange={handleChange} />
        <input required type="text" name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} />
        <textarea required name="description" placeholder="Event Description" value={formData.description} onChange={handleChange} />
        <input required type="text" name="organizer" placeholder="Organizer" value={formData.organizer} onChange={handleChange} />
        <input required type="text" name="venue" placeholder="Venue" value={formData.venue} onChange={handleChange} />
        <input required type="number" name="capacity" min="1" placeholder="Capacity" value={formData.capacity} onChange={handleChange} />
        <input required type="number" name="availableSeats" min="0" placeholder="Available Seats" value={formData.availableSeats} onChange={handleChange} />
        <input required type="number" name="price" min="0" placeholder="Ticket Price" value={formData.price} onChange={handleChange} />
        <input required type="number" name="rating" min="0" max="5" step="0.1" placeholder="Rating" value={formData.rating} onChange={handleChange} />
        <input required type="email" name="contact" placeholder="Organizer Email" value={formData.contact} onChange={handleChange} />
        <input type="text" placeholder="Highlights (comma separated)" value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} />

        <button className="submit-btn" disabled={saving}>
          {saving ? "Adding..." : "Add Event"}
        </button>
      </form>
    </div>
  );
}

export default AddEvent;
