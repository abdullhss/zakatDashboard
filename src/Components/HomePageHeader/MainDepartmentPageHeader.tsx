// src/features/DashboardUi/PageHeader.tsx
import { chakra, Flex, Text, Button, Menu, MenuButton } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { getSession } from "../../session";

const getPageTitle = (pathname: string) => {
  switch (true) {
    case /^\/officedashboard/.test(pathname):
      return "الصفحة الرئيسية";
    default:
      return "لوحة التحكم";
  }
};

const StyledHeader = chakra(Flex, {
  baseStyle: {
    gridArea: "header",
    bg: "white",
    h: "72px",
    alignItems: "center",
    justifyContent: "space-between",
    px: 6,
    borderBottom: "1px solid",
    borderColor: "gray.200",
    flexShrink: 0,
  },
});

export default function PageHeader() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const { officeName } = getSession();
  const isOffice = localStorage.getItem("role") == "O";
  
  return (
    <StyledHeader dir="rtl">
      <Text fontSize="xl" fontWeight="bold" color="gray.800" mr="auto">
        {title}
      </Text>

      <Menu placement="bottom-start">
        {isOffice && 
          <MenuButton
            as={Button}
            rightIcon={<FiChevronDown />}
            size="sm"
            bg="gray.100"
            color="gray.600"
            _hover={{ bg: "gray.200" }}
            _active={{ bg: "gray.200" }}
            borderRadius="full"
          >
            {officeName}
          </MenuButton>
        }
      </Menu>
    </StyledHeader>
  );
}
