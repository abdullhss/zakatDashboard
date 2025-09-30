import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
// استيراد الأيقونات
import { 
  FiHome, FiMapPin, FiCreditCard, FiCpu, 
  FiPercent, FiSettings, FiUsers, FiBookOpen 
} from "react-icons/fi"; 
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";  // لمراجعة طلب الإعانة
import { AiOutlineCalculator } from "react-icons/ai";         // حاسبة الزكاة
import { RiServiceLine } from "react-icons/ri";               // الخدمات

// ✅ قائمة الناف بار
const NavList = chakra("nav", { 
  baseStyle: { 
    display: "flex", 
    flexDirection: "column", 
    mt: 4,
    fontSize: "18px", 
    fontWeight: "bold", 
    lineHeight: "120%" 
  },
});

const LinkItem = chakra(NavLink, {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    h: "56px",
    paddingInline: 6,
    width: "100%",
    color: "gray.500",
    fontWeight: 800,
    transition: "all .2s ease",
    _hover: { bg: "gray.200", color: "gray.700" },

    "&.active, &[aria-current='page']": {
      color: "black",
      bg: "gray.100",
      fontWeight: 600,
      position: "relative",
      _before: {
        content: `""`,
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "4px",
        bg: "#17343B",
        borderRadius: "4px 0 0 4px",
      }
    },
  },
});

export default function MainNavBar() {
  return (
    <NavList>
      {/* الرئيسية */}
      <LinkItem to="." end>
        <Icon as={FiHome} boxSize={5} />
        الصفحة الرئيسية
      </LinkItem>

      {/* المدن */}
      <LinkItem to="cities">
        <Icon as={FiMapPin} boxSize={5} />
        المدن
      </LinkItem>

      {/* البنوك */}
      <LinkItem to="banks">
        <Icon as={FiCreditCard} boxSize={5} />
        البنوك
      </LinkItem>

      {/* المكاتب */}
      <LinkItem to="loan-requests">
        <Icon as={FiUsers} boxSize={5} />
        المكاتب
      </LinkItem>

      {/* أصناف الذكاء */}
      <LinkItem to="ai-categories">
        <Icon as={FiCpu} boxSize={5} />
        أصناف الزكاة
      </LinkItem>

      {/* حاسبة الزكاة */}
      <LinkItem to="zakat-calculator">
        <Icon as={AiOutlineCalculator} boxSize={5} />
        حاسبة الزكاة
      </LinkItem>

      {/* مراجعة طلب الإعانة */}
      <LinkItem to="aid-requests">
        <Icon as={MdOutlineAssignmentTurnedIn} boxSize={5} />
        مراجعة طلب الإعانة
      </LinkItem>

      {/* الخدمات */}
      <LinkItem to="services">
        <Icon as={RiServiceLine} boxSize={5} />
        الخدمات
      </LinkItem>

    </NavList>
  );
}
