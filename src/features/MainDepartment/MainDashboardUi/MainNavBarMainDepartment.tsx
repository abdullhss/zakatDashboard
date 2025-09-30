import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
// استيراد أيقونات إضافية لتطابق التصميم
import { FiHome, FiFolder, FiUsers, FiCalendar, FiBookOpen } from "react-icons/fi"; 

const NavList = chakra("nav", { baseStyle: { display: "flex", flexDirection: "column", mt: 4 , fontsize:"18px", fontWeight:"bold.700" ,lineHeight:"120%" },
});

const LinkItem = chakra(NavLink, {
     baseStyle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    h: "56px", // ارتفاع أصغر
    paddingInline: 6, // مسافة داخلية جانبية أقل
    width: "100%",
    color: "gray.500", 
    fontWeight: 800,

    transition: "all .2s ease",
    _hover: { bg: "gray.200", color: "gray.700" }, // تأثير خفيف عند المرور
    
    

    "&.active, &[aria-current='page']": {
      color: "black", // اللون الأزرق الرئيسي للنص والأيقونة
      bg: "grey.800", // خلفية زرقاء فاتحة
      fontWeight: 600,

      
      // الشريط الأزرق السميك على الجانب الأيمن (RTL)
      position: "relative",
      _before: {
        content: `""`,
        position: "absolute",
        left: 0, // وضعه على اليمين
        top: 0,
        bottom: 0,
        width: "4px", // سُمك الشريط
        bg: "#17343B", // اللون الأزرق
        borderRadius: "4px 0 0 4px", // حواف دائرية على اليمين
      }
    },
  },
});

export default function MainNavBar() {
  return (
    <NavList>
      {/* الرئيسية = index route */}
      <LinkItem to="." end>
        <Icon as={FiHome} boxSize={5} />
        الصفحة الرئيسية
      </LinkItem>

      <LinkItem to="cities">
        <Icon as={FiUsers} boxSize={5} />
        المدن
      </LinkItem>

      <LinkItem to="banks">
        <Icon as={FiCalendar} boxSize={5} />
        البنوك
      </LinkItem>

      <LinkItem to="loan-requests">
        <Icon as={FiBookOpen} boxSize={5} />
        تصنيف الاعانات
      </LinkItem>

      <LinkItem to="bank-transfers">
        <Icon as={FiFolder} boxSize={5} />
        الكفارة
      </LinkItem>
    </NavList>
  );
}
