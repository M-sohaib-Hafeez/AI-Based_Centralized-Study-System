import "./LoginPage.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const clearFields = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/login", { username, password });

      localStorage.setItem("token", res.data.jwtToken);
      localStorage.setItem("username", res.data.username);

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const usernameRegex = /^[A-Za-z0-9_]+$/;
    if (!usernameRegex.test(username) || username.length < 5) {
      setError("Username must be at least 5 characters and contain only letters, numbers, and underscores");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/register", { username, password });

      localStorage.setItem("token", res.data.jwtToken);
      localStorage.setItem("username", res.data.username);

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed. Username may already exist.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("token", "guest-token");
    localStorage.setItem("username", "Guest User");
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-toggle">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(true);
              clearFields();
            }}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(false);
              clearFields();
            }}
          >
            Signup
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {isLogin ? (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <h2>Login</h2>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="guest-link"
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </button>

            <p>
              Not a member?
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  clearFields();
                }}
              >
                Signup now
              </button>
            </p>
          </form>
        ) : (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            <h2>Signup</h2>

            <input
              type="text"
              placeholder="Username (min 5 chars, letters/numbers/_)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Signup"}
            </button>

            <p>
              Already a member?
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  clearFields();
                }}
              >
                Login now
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;