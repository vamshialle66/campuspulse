import { Navigate } from "react-router-dom";

export default function RequireRole({ children, role }: any) {
  const userRole = localStorage.getItem("role");

  if (userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
}