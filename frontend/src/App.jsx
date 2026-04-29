import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import MyFiles from "./pages/Myfiles";

// ✅ FIX: Added ProtectedRoute guard so unauthenticated users can't access
// dashboard/upload/my-files/search pages.
// Guest users (token = "guest-token") can only access Search.
function ProtectedRoute({ children, guestAllowed = false }) {
  const token = localStorage.getItem("token");
  const isGuest = token === "guest-token";
  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  // If the route requires a real user (not guest), redirect guest to search
  if (isGuest && !guestAllowed) {
    return <Navigate to="/search" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Guest + authenticated */}
        <Route
          path="/search"
          element={
            <ProtectedRoute guestAllowed={true}>
              <Search />
            </ProtectedRoute>
          }
        />

        {/* Authenticated only */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-files"
          element={
            <ProtectedRoute>
              <MyFiles />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
