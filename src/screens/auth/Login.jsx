import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../../firebase/auth";

const Login = () => {
  const [role, setRole] = useState(""); // Selected role
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔐 Prevent logged-in users from viewing login again
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole === "student") navigate("/events", { replace: true });
    if (savedRole === "manager") navigate("/create-event", { replace: true });
  }, [navigate]);

  // ------------------ LOGIN HANDLER ------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) return setError("Please select a login role.");

    // -------- ROLE-BASED EMAIL VALIDATION --------
    if (role === "manager" && email !== "manager@fjwu.edu.pk") {
      return setError("Manager email must be: manager@fjwu.edu.pk");
    }

    // Allow all FJWU department emails
    if (role === "student" && !email.includes("fjwu.edu.pk")) {
      return setError("Students must use an official FJWU email.");
    }

    setLoading(true);

    try {
      const result = await loginUser(email, password);
      setLoading(false);

      if (result.success) {
        localStorage.setItem("userRole", role);

        if (role === "student") navigate("/events", { replace: true });
        if (role === "manager") navigate("/create-event", { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">

          {/* LEFT SIDE IMAGE/STYLING */}
          <div className="login-image">
            <h2>Welcome Back</h2>
            <p>Select your role and login</p>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="login-form">
            <h2 className="form-title">Login</h2>

            {error && <p className="error-message">{error}</p>}

            {/* -------- SLIDING ROLE SELECTION -------- */}
            <div className="role-toggle">
              <input
                type="radio"
                id="student"
                name="role"
                checked={role === "student"}
                onChange={() => setRole("student")}
              />
              <label htmlFor="student">Student</label>

              <input
                type="radio"
                id="manager"
                name="role"
                checked={role === "manager"}
                onChange={() => setRole("manager")}
              />
              <label htmlFor="manager">Manager</label>

              <div className="slider"></div>
            </div>

            {/* -------- LOGIN FORM -------- */}
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "Logging in..." : `Login as ${role || "..."}`}
              </button>
            </form>

            <p className="register-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
