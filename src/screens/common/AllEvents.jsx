// src/screens/events/AllEvents.jsx
import React, { useEffect, useState } from "react";
import "./AllEvents.css";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import {
  FaThumbsUp,
  FaComment,
  FaShare,
  FaBookmark,
  FaEye,
} from "react-icons/fa";

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [commentsVisible, setCommentsVisible] = useState({});
  const [sharePopup, setSharePopup] = useState({ visible: false, eventTitle: "" });
  const [shareEmail, setShareEmail] = useState("");

  const userId = auth.currentUser?.uid;
  const role = localStorage.getItem("userRole");

  // --------------------------
  // Fetch events from Firestore
  // --------------------------
  useEffect(() => {
    const fetchEvents = async () => {
      const eventsCollection = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          organizer: data.organizer,
          image: data.image,
          description: data.description,
          likes: data.likes?.length || 0,
          likedByUser: data.likes?.includes(userId) || false,
          views: data.views?.includes(userId) ? 1 : 0,
          comments: data.comments || [],
          date: data.date || null,
        };
      });
      setEvents(eventsList);
    };
    fetchEvents();
  }, [userId]);

  // --------------------------
  // Handlers
  // --------------------------
  const handleLike = async (eventId, likedByUser) => {
    const eventRef = doc(db, "events", eventId);
    if (!likedByUser) await updateDoc(eventRef, { likes: arrayUnion(userId) });

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              likes: likedByUser ? ev.likes - 1 : ev.likes + 1,
              likedByUser: !likedByUser,
            }
          : ev
      )
    );
  };

  const handleCommentToggle = (eventId) =>
    setCommentsVisible((prev) => ({ ...prev, [eventId]: !prev[eventId] }));

  const handleAddComment = async (eventId, comment) => {
    if (!comment.trim()) return;
    const eventRef = doc(db, "events", eventId);
    const commentData = { text: comment, userId, timestamp: new Date() };
    await updateDoc(eventRef, { comments: arrayUnion(commentData) });

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, comments: [...ev.comments, commentData] } : ev
      )
    );
  };

  const handleShare = (title) => setSharePopup({ visible: true, eventTitle: title });
  const handleSendShare = () => {
    if (!shareEmail.trim()) return alert("Enter valid email!");
    window.location.href = `mailto:${shareEmail}?subject=Check this event: ${sharePopup.eventTitle}&body=${sharePopup.eventTitle}`;
    setSharePopup({ visible: false, eventTitle: "" });
    setShareEmail("");
  };

  const handleView = async (eventId) => {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { views: arrayUnion(userId) });
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId && ev.views === 0 ? { ...ev, views: 1 } : ev))
    );
  };

  // --------------------------
  // Save event to student's My Events
  // --------------------------
  const handleSave = async (eventId) => {
    if (role !== "student") return alert("Only students can save events!");
    if (!userId) return alert("Please login first.");

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { savedEvents: arrayUnion(eventId) });
      alert("Event saved to My Events!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save event. Try again.");
    }
  };

  // --------------------------
  // Upcoming Events for sidebar
  // --------------------------
  const upcomingEvents = events.filter((ev) => ev.date);

  return (
    <div className="events-wrapper">
      <div className="container" style={{ display: "flex", gap: "20px" }}>
        {/* Main Feed */}
        <main className="main-content" style={{ flex: 3 }}>
          {events.map((event) => (
            <div key={event.id} className="event-post">
              <div className="event-header">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/014/194/215/original/avatar-icon-human-a-person-s-badge-social-media-profile-symbol-the-symbol-of-a-person-vector.jpg"
                  alt="Organizer"
                />
                <div>
                  <h3>{event.title}</h3>
                  <small>Organized by {event.organizer}</small>
                </div>
              </div>

              <img className="event-image" src={event.image} alt={event.title} />

              <p className="event-description">{event.description}</p>

              <div className="event-buttons">
                <button
                  onClick={() => {
                    handleLike(event.id, event.likedByUser);
                    handleView(event.id);
                  }}
                  className={event.likedByUser ? "clicked" : ""}
                >
                  <FaThumbsUp /> {event.likes}
                </button>
                <button onClick={() => handleCommentToggle(event.id)}>
                  <FaComment />
                </button>
                <button onClick={() => handleShare(event.title)}>
                  <FaShare />
                </button>
                <button onClick={() => handleSave(event.id)}>
                  <FaBookmark />
                </button>
                <button onClick={() => handleView(event.id)}>
                  <FaEye /> {event.views}
                </button>
              </div>

              {commentsVisible[event.id] && (
                <div className="comments-section">
                  {(event.comments || []).map((cmt, index) => (
                    <div key={index} className="comment">
                      {cmt.text || cmt}
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment(event.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </main>

        {/* Right Sidebar */}
        <aside
          className="right-sidebar"
          style={{
            flex: 1,
            backgroundColor: "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <h3>Upcoming Events</h3>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                style={{
                  marginBottom: "15px",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "10px",
                }}
              >
                <strong>{ev.title}</strong>
                <br />
                <small>{ev.date}</small>
                <br />
                <button style={{ marginTop: "5px" }}>View Details</button>
              </div>
            ))
          ) : (
            <p>No upcoming events</p>
          )}
        </aside>
      </div>

      {/* Share Popup */}
      {sharePopup.visible && (
        <div className="share-popup-overlay">
          <div className="share-popup">
            <h3>Share Event: {sharePopup.eventTitle}</h3>
            <input
              type="email"
              placeholder="Enter recipient email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
            />
            <div className="share-popup-buttons">
              <button onClick={handleSendShare}>Send</button>
              <button
                onClick={() => setSharePopup({ visible: false, eventTitle: "" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;
