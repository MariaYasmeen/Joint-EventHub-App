import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        {/* Hamburger menu button */}
        <div className="menu-btn" onClick={toggleSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        {/* Logo */}
        <div className="logo">
          <img
            src="https://pakobserver.net/wp-content/uploads/2022/08/FJWU.jpg"
            alt="FJWU Logo"
          />
          <h1>FJWU Event Manager</h1>
        </div>

        {/* Right nav icons ONLY (Login/Register removed) */}
        <div className="nav-right">
          <div className="nav-icons">
            <span className="material-icons">home</span>
            <span className="material-icons">event</span>
            <span className="material-icons">settings</span>
            <span className="material-icons">notifications</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <h2 className="sidebar-logo">EVENT UI</h2>
        <ul className="menu">

          {/* ❌ Login Removed
          <li className={location.pathname === "/login" ? "active" : ""}>
            <Link to="/login">Login</Link>
          </li>
          */}

          {/* ❌ Register Removed
          <li className={location.pathname === "/register" ? "active" : ""}>
            <Link to="/register">Register</Link>
          </li>
          */}

          <li className={location.pathname === "/events" ? "active" : ""}>
            <Link to="/events">All Events</Link>
          </li>

          <li className={location.pathname === "/create-event" ? "active" : ""}>
            <Link to="/create-event">Create Event</Link>
          </li>

          <li className={location.pathname === "/analytics" ? "active" : ""}>
            <Link to="/analytics">Analytics</Link>
          </li>

          <li className={location.pathname.startsWith("/event/") ? "active" : ""}>
            <Link to="/event/1">Event Description</Link>
          </li>

          <li className={location.pathname === "/my-events" ? "active" : ""}>
            <Link to="/my-events">My Events</Link>
          </li>

          <li className={location.pathname === "/my-registrations" ? "active" : ""}>
            <Link to="/my-registrations">My Registrations</Link>
          </li>

          <li className={location.pathname === "/profile" ? "active" : ""}>
            <Link to="/profile">Profile</Link>
          </li>

          <li className={location.pathname === "/search" ? "active" : ""}>
            <Link to="/search">Search</Link>
          </li>

          <li className={location.pathname === "/settings" ? "active" : ""}>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </aside>

      {/* Overlay */}
      {sidebarActive && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Navbar;
