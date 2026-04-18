import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function LoginOverlay() {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setUser({
        email: localStorage.getItem("email"),
        role: localStorage.getItem("role"),
      });
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ❌ hide on login page
  if (location.pathname === "/login") return null;

  // ❌ if not logged in
  if (!user) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        zIndex: 9999,
      }}
    >
      {/* USER INFO */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "12px", color: "#555" }}>
          {user.role}
        </div>
        <div style={{ fontWeight: "bold" }}>
          {user.email}
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        style={{
          background: "red",
          color: "white",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "none",
        }}
      >
        Logout
      </button>
    </div>
  );
}