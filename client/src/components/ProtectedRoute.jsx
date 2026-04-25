import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!user.role) {
      // User exists but role not set; redirect to signup to select role
      navigate("/auth?tab=signup", { replace: true });
      return;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate, allowedRoles]);

  if (!user) return null;
  if (!user.role) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return null;

  return children;
}
