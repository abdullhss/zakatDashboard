import { chakra, Box, Icon, useToast } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi";
import LogoutButton from "../../../Components/LogoutButton/Logout";
import Logo from "./Logo";
import MainNavBarOfficeDepartment from "./MainNavBarOffice";

const StyledSideBar = chakra("aside", {
  baseStyle: {
    gridArea: "sidebar",
    width: "314px",
    bg: "white",
    color: "gray.700",
    px: 0,
    py: 4,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid",
    borderColor: "gray.100",
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
      <Box px={5} mb={4} textAlign="right" borderBottom="1px solid" borderColor="gray.100" pb={4} mx={5}>
  
      </Box>
      <Logo />

      <MainNavBarOfficeDepartment />

      <Box flexGrow={1} />

      <Box mt={4} borderTop="1px solid" borderColor="gray.100" pt={4}>
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
