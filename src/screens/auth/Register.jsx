import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { registerUser } from "../../firebase/auth";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "student") navigate("/events", { replace: true });
    else if (role === "manager") navigate("/create-event", { replace: true });
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (email.trim().toLowerCase() === "manager@fjwu.edu.pk") {
      setError("You cannot register as manager. Manager account is fixed.");
      return;
    }

    // Allow all department emails: xyz@cs.fjwu.edu.pk, xyz@ai.fjwu.edu.pk, etc.
    const studentEmailRegex = /^[a-zA-Z0-9.-]+@[a-z]{2,10}\.fjwu\.edu\.pk$/;
    if (!studentEmailRegex.test(email.trim().toLowerCase())) {
      setError("Only FJWU student emails (like xyz@cs.fjwu.edu.pk) are allowed.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(name, email.trim(), password);
      setLoading(false);

      if (result.success) {
        alert("Registration Successful!");
        localStorage.setItem("userRole", "student");
        navigate("/events", { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="register-card">
        <div className="register-image">
          <h2>Join EventHub</h2>
          <p>Create your account to explore & manage events</p>
        </div>

        <div className="register-form">
          <h2 className="form-title">Register</h2>
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="University Email (like xyz@cs.fjwu.edu.pk)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (minimum 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register Now"}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
