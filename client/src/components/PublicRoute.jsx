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

export default function PublicRoute({ children, redirectPath }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
      const role = user.role;
      if (!role) {
        // No role assigned; redirect to signup to select role
        navigate("/auth?tab=signup", { replace: true });
      } else {
        const targetPath = redirectPath?.replace(':role', role) || `/dashboard/${role}`;
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, navigate, redirectPath]);

  if (user) return null;

  return children;
}
