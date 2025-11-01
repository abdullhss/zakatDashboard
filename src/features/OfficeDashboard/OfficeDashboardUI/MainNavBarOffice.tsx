import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

// أيقونات
import { FiHome, FiMapPin, FiCreditCard, FiUsers } from "react-icons/fi";
import { RiShieldKeyholeLine, RiServiceLine } from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { GiSheep } from "react-icons/gi";

import { getSession } from "../../../session";
import { useGetGroupRightFeature } from "../../MainDepartment/Privelges/hooks/useGetGroupRightFeature";

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

export default function MainNavBarOfficeDepartment() {
  const { groupRightId } = getSession();
  const { data: featuresQuery } = useGetGroupRightFeature("O", groupRightId); // featureType O للمكاتب

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
      {renderLink("usersOffice", "المستخدمين", FiUsers)}
      {renderLink("privelgesOffice", "الصلاحيات", RiShieldKeyholeLine)}
      {renderLink("campaignOffice", "الخدمات", RiServiceLine)}
      {renderLink("newsdata", "الأخبار", TbCategory2)}
      {renderLink("projects", "المشاريع", TbCategory2)}
      {renderLink("sacrificesDashData", "الأضحيات", GiSheep)}
      {renderLink("paymentData", "المدفوعات", FiCreditCard)}
      {renderLink("transferdata", "التحويلات البنكية", FiCreditCard)}
      {renderLink("dashpayment", "المصروفات", FiCreditCard)}
      {renderLink("statement", "الايصالات", FiCreditCard)}
    </NavList>
  );
}
