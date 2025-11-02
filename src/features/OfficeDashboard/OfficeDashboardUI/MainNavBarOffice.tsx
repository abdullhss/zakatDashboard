import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

// أيقونات من مكتبات متنوعة
import {
  FiHome,
  FiCreditCard,
  FiUsers,
  FiSend,
  FiFileText,
} from "react-icons/fi";
import {
  RiShieldKeyholeLine,
  RiHandCoinLine,
  RiServiceLine,
  RiNewspaperLine,
} from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { GiSheep } from "react-icons/gi";
import { MdOutlineWork } from "react-icons/md";
import { BsCashCoin } from "react-icons/bs";

import { getSession } from "../../../session";
import { useGetGroupRightFeature } from "../../MainDepartment/Privelges/hooks/useGetGroupRightFeature";

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
  const { groupRightId } = getSession();
  const { data: featuresQuery } = useGetGroupRightFeature("O", groupRightId); // O للمكاتب

  const featuresData = featuresQuery?.rows || [];

  const isFeatureEnabled = (featureName: string) => {
    if (groupRightId === 0) return true; // admin كل حاجة مفتوحة
    return featuresData.some(
      (f) => f.FeatureName === featureName && f.IsActive
    );
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
      {/* الرئيسية */}
      {renderLink(".", "الصفحة الرئيسية", FiHome)}

      {/* المستخدمين */}
      {renderLink("usersOffice", "المستخدمين", FiUsers)}

      {/* الصلاحيات */}
      {renderLink("privelgesOffice", "الصلاحيات", RiShieldKeyholeLine)}

      {/* الخدمات */}
      {renderLink("campaignOffice", "الخدمات", RiServiceLine)}

      {/* الأخبار */}
      {renderLink("newsdata", "الأخبار", RiNewspaperLine)}

      {/* المشاريع */}
      {renderLink("projects", "المشاريع", MdOutlineWork)}

      {/* الأضحيات */}
      {renderLink("sacrificesDashData", "الأضحيات", GiSheep)}

      {/* المدفوعات */}
      {renderLink("paymentData", "المدفوعات", BsCashCoin)}

      {/* التحويلات البنكية */}
      {renderLink("transferdata", "التحويلات البنكية", FiSend)}

      {/* المصروفات */}
      {renderLink("dashpayment", "المصروفات", RiHandCoinLine)}

      {/* الإيصالات */}
      {renderLink("statement", "كشف الحسابات المصرفية", FiFileText)}
    </NavList>
  );
}
