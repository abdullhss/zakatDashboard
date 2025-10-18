import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

// أيقونات متنوعة لكل قسم
import { FiHome, FiMapPin, FiCreditCard, FiUsers } from "react-icons/fi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { RiShieldKeyholeLine, RiHandCoinLine, RiHandHeartLine, RiServiceLine } from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { GiSheep } from "react-icons/gi";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { AiOutlineCalculator } from "react-icons/ai";

// ✅ قائمة الناف بار
const NavList = chakra("nav", {
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    mt: 4,
    fontSize: "18px",
    fontWeight: "bold",
    lineHeight: "120%",
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
      },
    },
  },
});

export default function MainNavBarOfficeDepartment() {
  return (
    <NavList>
      {/* الرئيسية */}
      <LinkItem to="." end>
        <Icon as={FiHome} boxSize={5} />
        الصفحة الرئيسية
      </LinkItem>

      {/* المستخدمين */}
      <LinkItem to="usersOffice">
        <Icon as={FiUsers} boxSize={5} />
        المستخدمين
      </LinkItem>

      {/* الصلاحيات */}
      <LinkItem to="privelgesOffice">
        <Icon as={RiShieldKeyholeLine} boxSize={5} />
        الصلاحيات
      </LinkItem>

      {/* الخدمات */}
      <LinkItem to="campaignOffice">
        <Icon as={RiServiceLine} boxSize={5} />
        الخدمات
      </LinkItem>

      {/* المشاريع */}
      <LinkItem to="newsdata">
        <Icon as={TbCategory2} boxSize={5} />
        الاخبار
      </LinkItem>
      {/* المشاريع */}
      <LinkItem to="projects">
        <Icon as={TbCategory2} boxSize={5} />
        المشاريع
      </LinkItem>

      {/* الأضحيات */}
      <LinkItem to="sacrificesDashData">
        <Icon as={GiSheep} boxSize={5} />
        الأضحيات
      </LinkItem>

      {/* المدفوعات */}
      <LinkItem to="paymentData">
        <Icon as={FiCreditCard} boxSize={5} />
        المدفوعات
      </LinkItem>
    </NavList>
    
  );
}
