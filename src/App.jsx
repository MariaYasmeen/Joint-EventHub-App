import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./screens/auth/Login.jsx";
import Register from "./screens/auth/Register.jsx";

import AllEvents from "./screens/pages/AllEvents.jsx";
import Analytics from "./screens/pages/Analytics.jsx";
import CreateEvent from "./screens/pages/CreateEvent.jsx";
import EventDescription from "./screens/pages/EventDescription.jsx";
import MyEvents from "./screens/pages/MyEvents.jsx";
import MyRegistrations from "./screens/pages/MyRegistrations.jsx";
import Profile from "./screens/pages/Profile.jsx";
import Search from "./screens/pages/Search.jsx";
import Settings from "./screens/pages/Settings.jsx";

function App() {
  const location = useLocation();

  // Hide navbar on login & register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* DEFAULT ROUTE - ALWAYS OPEN REGISTER FIRST */}
        <Route path="/" element={<Navigate to="/register" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/events" element={<AllEvents />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/event/:id" element={<EventDescription />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
