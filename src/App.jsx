// src/App.jsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

// AUTH SCREENS
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";

// STUDENT SCREENS
import MyRegistrations from "./screens/student/MyRegistrations";
import MyEvents from "./screens/student/MyEvents";
import Profile from "./screens/student/Profile";
import Settings from "./screens/student/Settings";

// MANAGER SCREENS
import CreateEvent from "./screens/manager/CreateEvent";
import Analytics from "./screens/manager/Analytics";

// COMMON SCREENS
import AllEvents from "./screens/common/AllEvents";
import EventDescription from "./screens/common/EventDescription";
import Search from "./screens/common/Search";

// FIREBASE
import { auth, db } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function App() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // AUTH LISTENER — RUNS ONCE
  // -------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch role from Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        let fetchedRole = docSnap.exists() ? docSnap.data().role : null;

        // 🔥 FORCE MANAGER ROLE FOR NEW MANAGER EMAIL
        if (currentUser.email === "manager@fjwu.edu.pk") {
          fetchedRole = "manager";
        }

        setRole(fetchedRole);
        localStorage.setItem("userRole", fetchedRole);
      } else {
        setUser(null);
        setRole(null);
        localStorage.removeItem("userRole");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------
  // LOADING SCREEN (PREVENT UI FLASH)
  // -------------------------------------------------------
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Loading...
      </div>
    );
  }

  // -------------------------------------------------------
  // PROTECTED ROUTE
  // -------------------------------------------------------
  const ProtectedRoute = ({ children, allowed }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!allowed.includes(role)) return <Navigate to="/" replace />;
    return children;
  };

  const StudentRoute = ({ children }) => (
    <ProtectedRoute allowed={["student"]}>{children}</ProtectedRoute>
  );

  const ManagerRoute = ({ children }) => (
    <ProtectedRoute allowed={["manager"]}>{children}</ProtectedRoute>
  );

  const BothRoute = ({ children }) => (
    <ProtectedRoute allowed={["student", "manager"]}>{children}</ProtectedRoute>
  );

  // -------------------------------------------------------
  // AUTH ROUTES (LOGIN/REGISTER REDIRECTION)
  // -------------------------------------------------------
  const AuthRedirect = ({ children }) => {
    if (user && role === "student") return <Navigate to="/events" replace />;
    if (user && role === "manager") return <Navigate to="/create-event" replace />;
    return children;
  };

  // -------------------------------------------------------
  // DEFAULT REDIRECT
  // -------------------------------------------------------
  const defaultRedirect = () => {
    if (role === "manager") return "/create-event";
    if (role === "student") return "/events";
    return "/login";
  };

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to={defaultRedirect()} replace />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />

        {/* COMMON ROUTES */}
        <Route path="/events" element={<BothRoute><AllEvents /></BothRoute>} />
        <Route path="/event/:id" element={<BothRoute><EventDescription /></BothRoute>} />
        <Route path="/search" element={<BothRoute><Search /></BothRoute>} />

        {/* STUDENT ROUTES */}
        <Route path="/my-registrations" element={<StudentRoute><MyRegistrations /></StudentRoute>} />
        <Route path="/profile" element={<StudentRoute><Profile /></StudentRoute>} />
        <Route path="/settings" element={<StudentRoute><Settings /></StudentRoute>} />

        {/* MANAGER ROUTES */}
        <Route path="/create-event" element={<ManagerRoute><CreateEvent /></ManagerRoute>} />
        <Route path="/analytics" element={<ManagerRoute><Analytics /></ManagerRoute>} />
        <Route path="/my-events" element={<ManagerRoute><MyEvents /></ManagerRoute>} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
