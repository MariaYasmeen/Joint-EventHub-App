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
import AllEvents from "./screens/common/AllEvents";
import EventDescription from "./screens/common/EventDescription";
import Search from "./screens/common/Search";
import StudentProfile from "./screens/student/Profile";
import StudentSettings from "./screens/student/Settings";

// MANAGER SCREENS
import CreateEvent from "./screens/manager/CreateEvent";
import Analytics from "./screens/manager/Analytics";
import ManagerProfile from "./screens/manager/Profile";
import ManagerSettings from "./screens/manager/Settings";

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

  // ------------------------
  // AUTH LISTENER
  // ------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        let fetchedRole = null;

        // Manager fixed email
        if (currentUser.email === "manager@fjwu.edu.pk") {
          fetchedRole = "manager";
        } else {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            fetchedRole = userSnap.data().role || "student";
          }
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

  // ------------------------
  // LOADING SCREEN
  // ------------------------
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        Loading...
      </div>
    );
  }

  // ------------------------
  // PROTECTED ROUTE COMPONENTS
  // ------------------------
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return children;
  };

  const StudentOnly = ({ children }) => (
    <ProtectedRoute allowedRoles={["student"]}>{children}</ProtectedRoute>
  );

  const ManagerOnly = ({ children }) => (
    <ProtectedRoute allowedRoles={["manager"]}>{children}</ProtectedRoute>
  );

  const BothRoles = ({ children }) => (
    <ProtectedRoute allowedRoles={["student", "manager"]}>{children}</ProtectedRoute>
  );

  // ------------------------
  // AUTH REDIRECT FOR LOGIN/REGISTER
  // ------------------------
  const AuthRedirect = ({ children }) => {
    if (user && role === "student") return <Navigate to="/events" replace />;
    if (user && role === "manager") return <Navigate to="/create-event" replace />;
    return children;
  };

  // ------------------------
  // DEFAULT REDIRECT
  // ------------------------
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

        {/* STUDENT ROUTES */}
        <Route path="/events" element={<StudentOnly><AllEvents /></StudentOnly>} />
        <Route path="/event/:id" element={<StudentOnly><EventDescription /></StudentOnly>} />
        <Route path="/search" element={<StudentOnly><Search /></StudentOnly>} />
        <Route path="/my-events" element={<StudentOnly><MyEvents /></StudentOnly>} />
        <Route path="/my-registrations" element={<StudentOnly><MyRegistrations /></StudentOnly>} />
        <Route path="/profile" element={<StudentOnly><StudentProfile /></StudentOnly>} />
        <Route path="/settings" element={<StudentOnly><StudentSettings /></StudentOnly>} />

        {/* MANAGER ROUTES */}
        <Route path="/create-event" element={<ManagerOnly><CreateEvent /></ManagerOnly>} />
        <Route path="/analytics" element={<ManagerOnly><Analytics /></ManagerOnly>} />
        <Route path="/manager/profile" element={<ManagerOnly><ManagerProfile /></ManagerOnly>} />
        <Route path="/manager/settings" element={<ManagerOnly><ManagerSettings /></ManagerOnly>} />

        {/* FALLBACK ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
