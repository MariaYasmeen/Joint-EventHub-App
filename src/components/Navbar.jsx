// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole"); // student or manager

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userRole");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <>
      {/* ---------------------- NAVBAR ---------------------- */}
      <header className="navbar fixed-navbar">
        
        {/* Hamburger menu */}
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

        {/* Right Icons */}
        <div className="nav-right">
          <div className="nav-icons">

            {/* HOME */}
            {role === "student" && (
              <Link to="/events">
                <span className="material-icons">home</span>
              </Link>
            )}
            {role === "manager" && (
              <Link to="/create-event">
                <span className="material-icons">home</span>
              </Link>
            )}

            {/* SETTINGS */}
            <Link to={role === "student" ? "/settings" : "/manager/settings"}>
              <span className="material-icons">settings</span>
            </Link>

            {/* NOTIFICATIONS */}
            <span className="material-icons">notifications</span>

            {/* LOGOUT */}
            <button className="logout-btn" onClick={handleLogout}>
              <span className="material-icons">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------- SIDEBAR ---------------------- */}
      <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <h2 className="sidebar-logo">EVENT UI</h2>

        <ul className="menu">

          {/* ---------------- COMMON PAGES ---------------- */}
          <li className={location.pathname === "/events" ? "active" : ""}>
            <Link to="/events">All Events</Link>
          </li>

          <li className={location.pathname === "/search" ? "active" : ""}>
            <Link to="/search">Search</Link>
          </li>

          {/* ---------------- STUDENT PANEL ---------------- */}
          {role === "student" && (
            <>
              <li className={location.pathname === "/my-events" ? "active" : ""}>
                <Link to="/my-events">My Events</Link>
              </li>

              <li className={location.pathname === "/my-registrations" ? "active" : ""}>
                <Link to="/my-registrations">My Registrations</Link>
              </li>

              <li className={location.pathname === "/profile" ? "active" : ""}>
                <Link to="/profile">Profile</Link>
              </li>

              <li className={location.pathname === "/settings" ? "active" : ""}>
                <Link to="/settings">Settings</Link>
              </li>
            </>
          )}

          {/* ---------------- MANAGER PANEL ---------------- */}
          {role === "manager" && (
            <>
              <li className={location.pathname === "/create-event" ? "active" : ""}>
                <Link to="/create-event">Create Event</Link>
              </li>

              <li className={location.pathname === "/analytics" ? "active" : ""}>
                <Link to="/analytics">Analytics</Link>
              </li>

              <li className={location.pathname === "/manager/profile" ? "active" : ""}>
                <Link to="/manager/profile">Profile</Link>
              </li>

              <li className={location.pathname === "/manager/settings" ? "active" : ""}>
                <Link to="/manager/settings">Settings</Link>
              </li>
            </>
          )}

          {/* LOGOUT */}
          <li>
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Overlay */}
      {sidebarActive && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Navbar;
