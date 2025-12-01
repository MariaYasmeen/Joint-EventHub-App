// src/screens/student/MyEvents.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import "./MyEvents.css"; // create CSS for styling cards

const MyEvents = () => {
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchSavedEvents = async () => {
      if (!userId) return;

      try {
        // Get student's saved events array
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        const savedEventIds = userSnap.data()?.savedEvents || [];

        if (savedEventIds.length === 0) {
          setSavedEvents([]);
          setLoading(false);
          return;
        }

        // Fetch event details for each saved event
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((event) => savedEventIds.includes(event.id));

        setSavedEvents(eventsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching saved events:", err);
        setLoading(false);
      }
    };

    fetchSavedEvents();
  }, [userId]);

  if (loading) {
    return <div style={{ padding: "2rem", fontSize: "18px" }}>Loading My Events...</div>;
  }

  if (savedEvents.length === 0) {
    return (
      <div className="page">
        <h2>My Events</h2>
        <p>You have not saved any events yet.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>My Events</h2>
      <div className="events-grid">
        {savedEvents.map((event) => (
          <div key={event.id} className="event-card">
            <img src={event.image} alt={event.title} className="event-image" />
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            {event.date && <p><strong>Date:</strong> {event.date}</p>}
            <p><strong>Organizer:</strong> {event.organizer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyEvents;
