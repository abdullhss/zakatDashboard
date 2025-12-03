import { chakra, Box, Icon, useToast } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi";
import LogoutButton from "../../../Components/LogoutButton/Logout";
import Logo from "./Logo";
import MainNavBarOfficeDepartment from "./MainNavBarOffice";

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

const ActionButton = chakra("button", {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    height: "56px",
    paddingInline: 6,
    width: "100%",
    borderRadius: "0.375rem",
    color: "gray.600",
    bg: "transparent",
    _hover: { bg: "gray.100", color: "gray.800" },
  },
});

export default function SideBarOfficeDepartment() {
  const navigate = useNavigate();
  const toast = useToast();



  return (
    <StyledSideBar aria-label="Sidebar">
      <Box
        px={5}
        py={4}
        textAlign="right"
        borderBottom="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
        position="sticky"
        top={0}
        bg="background.sidebar"
        zIndex={1}
      >
      <Logo />
      </Box>


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
        <MainNavBarOfficeDepartment />
      </Box>

      <Box mt={4} borderTop="1px solid" borderColor="gray.100" p={4}>
        {/* <ActionButton as={NavLink} to="settings">
          الإعدادات
          <Icon as={FiSettings} boxSize={5} />
        </ActionButton> */}

        {/* <ActionButton onClick={handleLogout} color="red.500" _hover={{ bg: "red.50", color: "red.600" }}>
          تسجيل الخروج
          <Icon as={FiLogOut} boxSize={5} />
        </ActionButton> */}
        <LogoutButton />
      </Box>
    </StyledSideBar>
  );
}
