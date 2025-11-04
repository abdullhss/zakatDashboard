import { chakra, Box, Icon, useToast } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import Logo from "./Logo";
import MainNavBar from "./MainNavBarMainDepartment";
import LogoutButton from "../../../Components/LogoutButton/Logout";

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

const StyledSideBar = chakra("aside", {
  baseStyle: {
    width: "282.63px",
    bg: "background.sidebar",
    color: "gray.700",
    px: 0,
    py: 0,
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
  },
});

export default function SideBarMainDepartment() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
    toast({
      title: "تم تسجيل الخروج",
      status: "success",
      duration: 1200,
      isClosable: true,
    });
  };

  return (
    <StyledSideBar role="navigation" aria-label="Sidebar">
      {/* ✅ اللوجو ثابت بأعلى السايدبار ومعاه ظل */}
      <Box
        px={5}
        py={4}
        textAlign="right"
        borderBottom="1px solid"
        borderColor="gray.100"
        boxShadow="sm" // ✅ ظل خفيف
        position="sticky"
        top={0}
        bg="background.sidebar"
        zIndex={1}
      >
        <Logo />
      </Box>

      {/* ✅ المحتوى اللي بيعمل scroll */}
      <Box
        flex="1"
        overflowY="auto"
        px={0}
        py={4}
        scrollbarWidth="thin"
        sx={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: "3px",
          },
        }}
      >
        <MainNavBar />
      </Box>

      {/* ✅ الجزء السفلي */}
      <Box mt={4} borderTop="1px solid" borderColor="gray.100" py={4} px={2}>
        <ActionButton as={NavLink} to="settings">
          الإعدادات
          <Icon as={FiSettings} boxSize={5} />
        </ActionButton>
        <LogoutButton />
      </Box>
    </StyledSideBar>
  );
}
