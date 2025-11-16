import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import {
  FiHome,
  FiMapPin,
  FiCreditCard,
  FiUsers,
  FiPhoneCall,
  FiInfo,
  FiFileText,
} from "react-icons/fi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import {
  RiShieldKeyholeLine,
  RiHandCoinLine,
  RiHandHeartLine,
  RiServiceLine,  
  RiGovernmentLine,
} from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { GiSheep } from "react-icons/gi";
import { MdOutlineAssignmentTurnedIn, MdOutlineRule } from "react-icons/md";
import { AiOutlineCalculator } from "react-icons/ai";
import { BsFillClipboardCheckFill } from "react-icons/bs";

import { getSession } from "../../../session";
import { useGetGroupRightFeature } from "../Privelges/hooks/useGetGroupRightFeature";

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
  const { groupRightId } = getSession();
  const { data: featuresQuery } = useGetGroupRightFeature("M", groupRightId);

  // بيانات الصلاحيات
  const featuresData = featuresQuery?.rows || [];

  const isFeatureEnabled = (featureName: string) => {
    if (groupRightId === 0) return true; // admin كل حاجة مفتوحة
    return featuresData.some((f) => f.FeatureName === featureName && f.IsActive);
  };

  const renderLink = (to: string, name: string, IconComp: any, end: boolean = false) => (
    <LinkItem
      to={to}
      end={end} // ✅ هنا الإضافة
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
      {renderLink(".", "الصفحة الرئيسية", FiHome, true)}

      {/* المدن */}
      {renderLink("cities", "المدن", FiMapPin)}

      {/* البنوك */}
      {renderLink("banks", "البنوك", FiCreditCard)}

      {/* المكاتب */}
      {renderLink("offices", "المكاتب", HiOutlineBuildingOffice)}

      {/* تصنيفات الإعانات */}
      {renderLink("subventionTypes", "تصنيف الإعانات", TbCategory2)}

      {/* الكفارة */}
      {renderLink("kafara", "الكفارة والفدية", RiHandHeartLine)}

      {/* الزكاة */}
      {renderLink("zakah", "أصناف الزكاة", RiHandCoinLine)}

      {/* الصلاحيات */}
      {renderLink("privelges", "الصلاحيات", RiShieldKeyholeLine)}

      {/* المستخدمين */}
      {renderLink("users", "المستخدمين", FiUsers)}

      {/* حاسبة الزكاة */}
      {renderLink("zakatGold", "حاسبة الزكاة", AiOutlineCalculator)}

      {/* أنواع الأضحيات */}
      {renderLink("sacirificeTypes", "أنواع الأضاحي", GiSheep)}

      {/* مراجعة طلب الإعانة */}
      {renderLink("assistanceData", "مراجعة طلب الإعانة", BsFillClipboardCheckFill)}

      {/* الخدمات والحملات */}
      {renderLink("campaign", "الحملات", RiServiceLine)}

      {/* بيانات الأضحيات */}
      {renderLink("sacrificeDataMain", "طلبات الأضاحي", GiSheep)}

      {/* اللوائح */}
      {renderLink("laws", "اللوائح", MdOutlineRule)}

      {/* اتصل بنا */}
      {renderLink("ContactUs", "اتصل بنا", FiPhoneCall)}

      {/* الشروط */}
      {renderLink("conditions", "الشروط", RiGovernmentLine)}

      {/* من نحن */}
      {renderLink("whoarewe", "من نحن؟", FiInfo)}

      {renderLink("privarypolicy", "سياسة الخصوصية", FiInfo)}

      {renderLink("UrgentProjects", "المشاريع العاجلة", MdOutlineAssignmentTurnedIn)}

      {renderLink("CommonQuestions", "الاسئلة الشائعة", MdOutlineAssignmentTurnedIn)}
      
      {renderLink("UsersQuestions", "اسئلة المستخدمين", MdOutlineAssignmentTurnedIn)}

    </NavList>
  );
}
