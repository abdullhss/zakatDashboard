import { chakra, Box, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi"; // أيقونات جديدة للإعدادات والخروج

import Logo from "./Logo"; // افترض أن هذا هو المكون الذي يعرض "وصل النبيهة"
import MainNavBar from "./MainNavBar";

// 1. حاوية الشريط الجانبي الرئيسية
const StyledSideBar = chakra("aside", {
 baseStyle: {
    gridArea: "sidebar",
    width: "314px",
    bg: "white",
    color: "gray.700",
    px: 0,
    py: 4,
    // ⬅️ إزالة الخواص المسببة للمشكلة
    // position: "sticky",
    // top: 0,
    // minHeight: "100vh", 
    
    // ⬅️ استخدام ارتفاع 100% لملء منطقة Grid المتاحة له
    height: "100%", 
    
    alignSelf: "stretch", 
    // ⬅️ إذا لم يكن هناك تمرير ضروري، اجعلها "hidden"
    overflowY: "hidden", 
    display: "flex",
    flexDirection: "column",
margin:"auto"
  },
});

// 2. ستايل الأزرار/الروابط السفلية (الإعدادات وتسجيل الخروج)
const ActionButton = chakra("button", {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    height: "56px",
    paddingInline: 6, // مسافة داخلية أصغر
    width: "100%",
    borderRadius: "0.375rem",
    color: "gray.500", // لون نص افتراضي للروابط السفلية
    textAlign: "right",
    bg: "transparent",
    _hover: { bg: "gray.500", color: "gray.700" },
  },
});

export default function SideBar() {
  return (
    <StyledSideBar role="navigation" aria-label="Sidebar">
      <Box px={5} mb={4} textAlign="right" borderBottom="1px solid" borderColor="gray.100" pb={4} mx={5}>
        <Logo /> 
      </Box>

      <MainNavBar />

      <Box flexGrow={1} />

      <Box mt={4} borderTop="1px solid" borderColor="gray.100" pt={4}>
        
        {/* رابط الإعدادات */}
        <ActionButton as={NavLink} to="/settings" _hover={{ bg: "gray.100", color: "black" }}>
            الإعدادات
            <Icon as={FiSettings} boxSize={5} /> 
        </ActionButton>
        
        {/* زر تسجيل الخروج */}
        <ActionButton onClick={() => console.log("Logout clicked")} color="red.500" _hover={{ bg: "grey.50", color: "red.600" }}>
           تسجيل الخروج
           <Icon as={FiLogOut} boxSize={5} />
        </ActionButton>
        
      </Box>
    </StyledSideBar>
  );
}