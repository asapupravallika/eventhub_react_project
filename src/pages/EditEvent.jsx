import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [highlightsText, setHighlightsText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEvent();
  }, [id]);

  async function getEvent() {
    try {
      const response = await api.get(`/events/${id}`);
      setFormData(response.data);
      setHighlightsText((response.data.highlights || []).join(", "));
    } catch (err) {
      console.error(err);
      setError("Unable to load the event.");
    }
  }

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
      await api.put(`/events/${id}`, {
        ...formData,
        capacity: Number(formData.capacity),
        availableSeats: Number(formData.availableSeats),
        price: Number(formData.price),
        rating: Number(formData.rating),
        updatedAt: new Date().toISOString(),
        highlights: highlightsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });

      navigate("/events");
    } catch (err) {
      console.error(err);
      setError("Unable to update the event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !formData) {
    return <h2>{error}</h2>;
  }

  if (!formData) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="form-container">
      <h2>Edit Event</h2>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input required type="text" name="name" value={formData.name} onChange={handleChange} />
        <input required type="text" name="category" value={formData.category} onChange={handleChange} />
        <input required type="text" name="location" value={formData.location} onChange={handleChange} />
        <input required type="date" name="date" value={formData.date} onChange={handleChange} />
        <input required type="text" name="time" value={formData.time} onChange={handleChange} />
        <input required type="text" name="duration" value={formData.duration} onChange={handleChange} />
        <input required type="text" name="image" value={formData.image} onChange={handleChange} />
        <textarea required name="description" value={formData.description} onChange={handleChange} />
        <input required type="text" name="organizer" value={formData.organizer} onChange={handleChange} />
        <input required type="text" name="venue" value={formData.venue} onChange={handleChange} />
        <input required type="number" name="capacity" min="1" value={formData.capacity} onChange={handleChange} />
        <input required type="number" name="availableSeats" min="0" value={formData.availableSeats} onChange={handleChange} />
        <input required type="number" name="price" min="0" value={formData.price} onChange={handleChange} />
        <input required type="number" name="rating" min="0" max="5" step="0.1" value={formData.rating} onChange={handleChange} />
        <input required type="email" name="contact" value={formData.contact} onChange={handleChange} />
        <input type="text" placeholder="Highlights (comma separated)" value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} />

        <button className="submit-btn" disabled={saving}>
          {saving ? "Updating..." : "Update Event"}
        </button>
      </form>
    </div>
  );
}

export default EditEvent;
