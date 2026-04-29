import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import "./Dashboard.css";
import React, { useState, useEffect } from "react";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    try {
      const response = await API.get("/my-files");
      setUserFiles(response.data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setUserFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
        
        <h1 className="dashboard-title">Welcome, {username || "User"}! 👋</h1>

        <div className="cards-grid">
          <div onClick={() => navigate("/my-files")} className="card">
            <h2>📁 My Files</h2>
            <p className="card-number">{userFiles.length}</p>
            <p className="card-label">Total files uploaded</p>
          </div>

          <div onClick={() => navigate("/search")} className="card">
            <h2>🔍 Search</h2>
            <p className="card-number">Explore</p>
            <p className="card-label">Find academic resources</p>
          </div>

          <div onClick={() => navigate("/upload")} className="card">
            <h2>📤 Upload</h2>
            <p className="card-number">Share</p>
            <p className="card-label">Upload new documents</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;