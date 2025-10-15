import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

// أيقونات مناسبة لكل عنصر
import { FiHome, FiMapPin, FiCreditCard, FiUsers } from "react-icons/fi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import {
  RiShieldKeyholeLine,
  RiHandCoinLine,
  RiHandHeartLine,
  RiServiceLine,
} from "react-icons/ri";
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
      <LinkItem to="offices">
        <Icon as={HiOutlineBuildingOffice} boxSize={5} />
        المكاتب
      </LinkItem>

      {/* تصنيف الإعانات */}
      <LinkItem to="subventionTypes">
        <Icon as={TbCategory2} boxSize={5} />
        تصنيف الإعانات
      </LinkItem>

      {/* الكفارة */}
      <LinkItem to="kafara">
        <Icon as={RiHandHeartLine} boxSize={5} />
        الكفارة
      </LinkItem>

      {/* أصناف الزكاة */}
      <LinkItem to="zakah">
        <Icon as={RiHandCoinLine} boxSize={5} />
        أصناف الزكاة
      </LinkItem>

      {/* الصلاحيات */}
      <LinkItem to="privelges">
        <Icon as={RiShieldKeyholeLine} boxSize={5} />
        الصلاحيات
      </LinkItem>

      {/* المستخدمين */}
      <LinkItem to="users">
        <Icon as={FiUsers} boxSize={5} />
        المستخدمين
      </LinkItem>

      {/* حاسبة الزكاة */}
      <LinkItem to="zakatGold">
        <Icon as={AiOutlineCalculator} boxSize={5} />
        حاسبة الزكاة
      </LinkItem>

      {/* أنواع الأضحيات */}
      <LinkItem to="sacirificeTypes">
        <Icon as={GiSheep} boxSize={5} />
        أنواع الأضحيات
      </LinkItem>

      {/* مراجعة طلب الإعانة */}
      <LinkItem to="assistanceData">
        <Icon as={MdOutlineAssignmentTurnedIn} boxSize={5} />
        مراجعة طلب الإعانة
      </LinkItem>

      {/* الخدمات */}
      <LinkItem to="campaign">
        <Icon as={RiServiceLine} boxSize={5} />
        الخدمات
      </LinkItem>
      <LinkItem to="sacrificeDataMain">
        <Icon as={RiServiceLine} boxSize={5} />
        الاضحيات
      </LinkItem>
    </NavList>
  );
}
