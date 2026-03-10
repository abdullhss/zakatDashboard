import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");

    // 🔁 رجّع المستخدم لصفحة تسجيل الدخول
    navigate("/login", { replace: true });
  };

  return (
    <Button
      onClick={handleLogout}
      colorScheme="red"
      size="sm"
      variant="solid"
      width="100%"
    >
      تسجيل الخروج
    </Button>
  );
}
