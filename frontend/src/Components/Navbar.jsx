import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Adjust path based on your structure

function Navbar() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");

    return (
        <nav style={{
            background: "#033452",
            color: "white",
            padding: "15px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 999,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            flexWrap: "wrap",
            gap: "15px"
        }}>
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                {window.location.pathname !== "/dashboard" &&
                    window.location.pathname !== "/search" &&
                    window.location.pathname !== "/my-files" &&
                    window.location.pathname !== "/upload" && (
                        <button onClick={() => navigate(-1)} style={{
                            background: "transparent",
                            border: "1px solid white",
                            color: "white",
                            padding: "5px 15px",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}>← Back</button>
                    )}
                <Link to="/dashboard" style={{ display: "flex", alignItems: "center" }}>
                    <img
                        src={logo}
                        alt="AI Academic System Logo"
                        style={{
                            height: "60px",
                            width: "120px",
                            cursor: "pointer",

                                                    }}
                    />
                </Link>
            </div>
            <div style={{ display: "flex", gap: "25px", alignItems: "center", flexWrap: "wrap" }}>
                <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
                <Link to="/search" style={{ color: "white", textDecoration: "none" }}>Search</Link>
                <Link to="/my-files" style={{ color: "white", textDecoration: "none" }}>My Files</Link>
                <Link to="/upload" style={{ color: "white", textDecoration: "none" }}>Upload</Link>
                {username && <span style={{ color: "#aaa", fontSize: "14px" }}>👤 {username}</span>}
            </div>
        </nav>
    );
}

export default Navbar;