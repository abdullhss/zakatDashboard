// src/features/DashboardUi/PageHeader.jsx
import {
  chakra,
  Flex,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { useLocation } from "react-router-dom";

// عنوان الصفحة حسب المسار
const getPageTitle = (pathname : any) => {
  switch (pathname) {
    case "/officedashboard":
      return "الصفحة الرئيسية";
    case "/maindashboard":
    case "/maindashboard/home":
      return "لوحة التحكم";
    default:
      return "لوحة التحكم";
  }
};

// يقرأ كائن المستخدم من localStorage بشكل آمن
function readMainUser() {
  const keys = ["mainUser", "MainUser", "user", "authUser"];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") return obj;
    } catch {}
  }
  return null;
}

// يحدد النص المعروض على زر القائمة (اسم المكتب أو "الإدارة الرئيسية")
function resolveHeaderLabel() {
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const u = readMainUser();

  // محاولات لاستخراج اسم المكتب من كذا حقل محتمل
  const officeName =
    u?.OfficeName ??
    u?.officeName ??
    u?.CompanyName ??
    u?.companyName ??
    null;

  const officeId = Number(u?.Office_Id ?? u?.OfficeId ?? 0);

  if (role === "O" || officeId > 0) {
    return officeName && String(officeName).trim()
      ? String(officeName)
      : "مكتب";
  }
  // مستخدم إدارة
  return "الإدارة الرئيسية";
}

// مكوّن الهيدر
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

export default function OfficeDepartmentPageHeader() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const headerLabel = resolveHeaderLabel();

  return (
    <StyledHeader dir="rtl">
      {/* عنوان الصفحة */}
      <Text fontSize="xl" fontWeight="bold" color="gray.800" mr="auto">
        {title}
      </Text>

      {/* زر باسم المكتب (أو الإدارة) */}
      <Menu placement="bottom-start">
        <MenuButton
          as={Button}
          size="sm"
          bg="gray.100"
          color="gray.700"
          _hover={{ bg: "gray.200" }}
          _active={{ bg: "gray.200" }}
          borderRadius="full"
        >
          {headerLabel}
        </MenuButton>
      </Menu>
    </StyledHeader>
  );
}
