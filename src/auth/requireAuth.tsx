import { Navigate, Outlet, useLocation } from "react-router-dom";

type Role = "M" | "O";

export function RequireAuth({ allow }: { allow: Role[] }) {
  const location = useLocation();
  const isDemo = import.meta.env.VITE_DEMO === "true"
              || new URLSearchParams(location.search).has("demo"); // كمان لو حطيت ?demo=1
  if (isDemo) return <Outlet />; // افتح كل الصفحات

  const role = (localStorage.getItem("role") as Role | null) || null;
  const auth = localStorage.getItem("auth") === "true";
  

  if (!auth || !role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!allow.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
