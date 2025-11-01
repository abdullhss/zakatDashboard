import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

// أيقونات
import { FiHome, FiMapPin, FiCreditCard, FiUsers } from "react-icons/fi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { RiShieldKeyholeLine, RiHandCoinLine, RiHandHeartLine, RiServiceLine } from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { GiSheep } from "react-icons/gi";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { AiOutlineCalculator } from "react-icons/ai";

import { getSession } from "../../../session";
import { useGetGroupRightFeature } from "../Privelges/hooks/useGetGroupRightFeature";

const NavList = chakra("nav", {
  baseStyle: { display: "flex", flexDirection: "column", mt: 4, fontSize: "18px", fontWeight: "bold", lineHeight: "120%" }
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
      _before: { content: `""`, position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", bg: "#17343B", borderRadius: "4px 0 0 4px" }
    },
  },
});

export default function MainNavBar() {
  const { groupRightId } = getSession();
  const { data: featuresQuery } = useGetGroupRightFeature("M", groupRightId);

  // FeaturesData parsed
  const featuresData = featuresQuery?.rows || [];

  const isFeatureEnabled = (featureName: string) => {
    if (groupRightId === 0) return true; // admin كل حاجة مفتوحة
    return featuresData.some(f => f.FeatureName === featureName && f.IsActive);
  };

  const renderLink = (to: string, name: string, IconComp: any) => (
    <LinkItem
      to={to}
      pointerEvents={isFeatureEnabled(name) ? "auto" : "none"}
      opacity={isFeatureEnabled(name) ? 1 : 0.5}
    >
      <Icon as={IconComp} boxSize={5} />
      {name}
    </LinkItem>
  );

  return (
    <NavList>
      {renderLink(".", "الصفحة الرئيسية", FiHome)}
      {renderLink("cities", "المدن", FiMapPin)}
      {renderLink("banks", "البنوك", FiCreditCard)}
      {renderLink("offices", "المكاتب", HiOutlineBuildingOffice)}
      {renderLink("subventionTypes", "تصنيف الإعانات", TbCategory2)}
      {renderLink("kafara", "الكفارة", RiHandHeartLine)}
      {renderLink("zakah", "أصناف الزكاة", RiHandCoinLine)}
      {renderLink("privelges", "الصلاحيات", RiShieldKeyholeLine)}
      {renderLink("users", "المستخدمين", FiUsers)}
      {renderLink("zakatGold", "حاسبة الزكاة", AiOutlineCalculator)}
      {renderLink("sacirificeTypes", "أنواع الأضحيات", GiSheep)}
      {renderLink("assistanceData", "مراجعة طلب الإعانة", MdOutlineAssignmentTurnedIn)}
      {renderLink("campaign", "الخدمات", RiServiceLine)}
      {renderLink("sacrificeDataMain", "الأضحيات", RiServiceLine)}
      {renderLink("laws", "اللوائح", RiServiceLine)}
      {renderLink("contactus", "اتصل بنا", RiServiceLine)}
      {renderLink("conditions", "الشروط", RiServiceLine)}
      {renderLink("whoarewe", "من نحن؟", RiServiceLine)}
    </NavList>
  );
}
