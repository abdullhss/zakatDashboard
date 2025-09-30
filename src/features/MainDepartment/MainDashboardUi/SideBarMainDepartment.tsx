import { chakra, Box, Icon, useToast } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi";

import Logo from "./Logo";
import MainNavBar from "./MainNavBarMainDepartment";

// زر فعل في الأسفل
const ActionButton = chakra("button", {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    height: "56px",
    paddingInline: 6,
    width: "100%",
    borderRadius: "0.375rem",
    color: "gray.600",
    textAlign: "right",
    bg: "transparent",
    transition: "all .2s ease",
    _hover: { bg: "gray.100", color: "gray.800" },
  },
});

// الحاوية
const StyledSideBar = chakra("aside", {
  baseStyle: {
    gridArea: "sidebar",
    width: "282.6300048828125px",
    bg: "background.sidebar", // ✅ بدل الأبيض بخلفية رمادية
    color: "gray.700",
    px: 0,
    py: 4,
    height: "100%",
    alignSelf: "stretch",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
    margin: "auto",
  },
});

// دالة الخروج (ممكن تعيد استخدامها في أي مكان)
export function logout(navigate?: (path: string, opts?: any) => void) {
  localStorage.removeItem("auth");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
  if (navigate) navigate("/login", { replace: true });
}

export default function SideBarMainDepartment() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout(navigate);
    toast({
      title: "تم تسجيل الخروج",
      status: "success",
      duration: 1200,
      isClosable: true,
    });
  };

  return (
    <StyledSideBar role="navigation" aria-label="Sidebar">
      {/* العنوان/اللوجو */}
      <Box
        px={5}
        mb={4}
        textAlign="right"
        borderBottom="1px solid"
        borderColor="gray.100"
        pb={4}
        mx={5}
      >
        <Logo />
      </Box>

      {/* روابط القسم */}
      <MainNavBar />

      <Box flexGrow={1} />

      {/* أزرار أسفل السايدبار */}
      <Box mt={4} borderTop="1px solid" borderColor="gray.100" pt={4}>
        {/* الإعدادات – رابط نسبي داخل maindashboard */}
        <ActionButton as={NavLink} to="settings">
          الإعدادات
          <Icon as={FiSettings} boxSize={5} />
        </ActionButton>

        {/* تسجيل الخروج */}
        <ActionButton
          onClick={handleLogout}
          color="red.600"
          _hover={{ bg: "red.50", color: "red.700" }}
        >
          تسجيل الخروج
          <Icon as={FiLogOut} boxSize={5} />
        </ActionButton>
      </Box>
    </StyledSideBar>
  );
}
