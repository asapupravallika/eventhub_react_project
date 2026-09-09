import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

export default function Reviews() {
  const { eventId } = useParams();
  const user = getUser();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isOrganizerForEvent = useMemo(
    () =>
      user?.role === "ORGANIZER" &&
      event &&
      (String(event.organizerId) === String(user.id) || event.organizerEmail === user.email),
    [event, user]
  );

  async function load() {
    const [eventResponse, reviewsResponse] = await Promise.all([
      api.get(`/events/${eventId}`),
      api.get(`/reviews?eventId=${eventId}`)
    ]);
    setEvent(eventResponse.data);
    setReviews(reviewsResponse.data);
  }

  useEffect(() => {
    load().catch(() => setError("Unable to load reviews."));
  }, [eventId]);

  async function updateEventRating(nextReviews) {
    if (!nextReviews.length) return;
    const average = nextReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / nextReviews.length;
    await api.patch(`/events/${eventId}`, { rating: Number(average.toFixed(1)) });
  }

  async function submitReview(e) {
    e.preventDefault();
    if (user?.role !== "CUSTOMER" || !comment.trim()) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await api.post("/reviews", {
        eventId: Number(eventId),
        userId: user.id,
        userName: user.name,
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        reply: null
      });
      const nextReviews = [...reviews, response.data];
      setReviews(nextReviews);
      setComment("");
      setRating(5);
      await updateEventRating(nextReviews);
      setMessage("Review added and saved! ⭐");
    } catch (err) {
      console.error(err);
      setError("Unable to save the review. Please make sure the server is running.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleLike(review) {
    if (!user) return;
    const likedBy = Array.isArray(review.likedBy) ? review.likedBy.map(String) : [];
    const userId = String(user.id);
    const alreadyLiked = likedBy.includes(userId);
    const nextLikedBy = alreadyLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId];
    const updated = { ...review, likedBy: nextLikedBy, likes: nextLikedBy.length, updatedAt: new Date().toISOString() };
    try {
      await api.put(`/reviews/${review.id}`, updated);
      setReviews(prev => prev.map(item => String(item.id) === String(review.id) ? updated : item));
    } catch (err) {
      console.error(err);
      setError("Unable to save your like.");
    }
  }

  async function replyToReview(review) {
    const text = (replyText[review.id] || "").trim();
    if (!isOrganizerForEvent || !text) return;
    try {
      const updated = {
        ...review,
        reply: {
          text,
          organizerId: user.id,
          organizerName: user.name,
          createdAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };
      await api.put(`/reviews/${review.id}`, updated);
      setReviews(prev => prev.map(item => String(item.id) === String(review.id) ? updated : item));
      setReplyText(prev => ({ ...prev, [review.id]: "" }));
      setMessage("Organizer reply saved! 💬");
    } catch (err) {
      console.error(err);
      setError("Unable to save the organizer reply.");
    }
  }

  return (
    <div className="reviews-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">COMMUNITY VOICE</span>
          <h1>{event?.name || "Event"} ⭐</h1>
          <p className="page-subtitle">Reviews are shared with customers, organizers and admins. Likes and organizer replies are saved.</p>
        </div>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="reviews-layout">
        {user?.role === "CUSTOMER" ? (
          <form className="review-form" onSubmit={submitReview}>
            <h2>Leave a review</h2>
            <label>
              Rating
              <select value={rating} onChange={e => setRating(e.target.value)}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{"⭐".repeat(n)} {n}/5</option>)}
              </select>
            </label>
            <label>
              Your review
              <textarea required rows="6" placeholder="Tell us what you loved..." value={comment} onChange={e => setComment(e.target.value)} />
            </label>
            <button className="submit-btn" disabled={saving}>{saving ? "Saving..." : "Post Review →"}</button>
          </form>
        ) : (
          <aside className="review-info-card">
            <span className="section-kicker">REVIEWS</span>
            <h2>{user?.role === "ORGANIZER" ? "Manage your event feedback" : "Platform review view"}</h2>
            <p>
              {user?.role === "ORGANIZER"
                ? "You can reply to reviews posted for your own event."
                : "You can view every review and like helpful feedback."}
            </p>
          </aside>
        )}

        <div className="review-list">
          <div className="section-head">
            <div><h2>What attendees say</h2><span>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span></div>
            <strong>⭐ {event?.rating ?? "—"}</strong>
          </div>

          {reviews.length ? reviews.slice().reverse().map(review => {
            const likedBy = Array.isArray(review.likedBy) ? review.likedBy.map(String) : [];
            const liked = user && likedBy.includes(String(user.id));
            const canReply = isOrganizerForEvent;
            return (
              <article className="review-item" key={review.id}>
                <div className="review-avatar">{review.userName?.[0]?.toUpperCase() || "U"}</div>
                <div className="review-body">
                  <strong>{review.userName}</strong>
                  <div className="stars">{"⭐".repeat(Number(review.rating || 0))}</div>
                  <p>{review.comment}</p>
                  <div className="review-meta">
                    <small>{new Date(review.createdAt).toLocaleDateString("en-IN")}</small>
                    {user && <button className={`like-btn ${liked ? "liked" : ""}`} onClick={() => toggleLike(review)}>👍 {review.likes || 0} {liked ? "Liked" : "Like"}</button>}
                  </div>

                  {review.reply?.text && (
                    <div className="organizer-reply">
                      <strong>💬 {review.reply.organizerName || event?.organizer} · Organizer</strong>
                      <p>{review.reply.text}</p>
                      <small>{new Date(review.reply.createdAt).toLocaleDateString("en-IN")}</small>
                    </div>
                  )}

                  {canReply && (
                    <div className="reply-box">
                      <textarea
                        rows="2"
                        placeholder="Reply to this review..."
                        value={replyText[review.id] || ""}
                        onChange={e => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                      />
                      <button className="reply-btn" onClick={() => replyToReview(review)}>Reply & Save</button>
                    </div>
                  )}
                </div>
              </article>
            );
          }) : (
            <div className="empty-state"><div>💬</div><h2>Be the first to review</h2><p>Customer reviews will appear here for everyone with access to this event.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
