// src/auth/requireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
type Role = "M" | "O";

export function RequireAuth({ allow }: { allow: Role[] }) {
  const location = useLocation();
  const auth = localStorage.getItem("auth") === "true";
  const role = (localStorage.getItem("role") as Role | null) || null;

  if (!auth || !role) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allow.includes(role)) return <Navigate to="/login" replace />;

  return <Outlet />;
}
