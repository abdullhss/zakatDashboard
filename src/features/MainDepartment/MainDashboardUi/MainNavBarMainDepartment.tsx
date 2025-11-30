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
import { GiBowlOfRice, GiFoodChain, GiSheep } from "react-icons/gi";
import { MdOutlineAssignmentTurnedIn, MdOutlineRule } from "react-icons/md";
import { AiOutlineCalculator } from "react-icons/ai";
import { BsFillClipboardCheckFill } from "react-icons/bs";

import { getSession } from "../../../session";
import { useGetGroupRightFeature } from "../Privelges/hooks/useGetGroupRightFeature";
import { Collapse } from "@chakra-ui/react";
import { useState } from "react";
import { ChevronDownIcon , ChevronUpIcon } from "@chakra-ui/icons";
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

      {renderLink("statement", "الحسابات", FiCreditCard)}

      {/* الإعانات */}
      <SidebarDropdown title="الإعانات" icon={RiHandHeartLine}>
        {renderLink("subventionTypes", "تصنيف الإعانات", TbCategory2)}
        {renderLink("kafara", "الكفارة والفدية", RiHandHeartLine)}
      </SidebarDropdown>

      {/* الزكاة */}
      <SidebarDropdown title="الزكاة" icon={RiHandCoinLine}>
        {renderLink("zakah", "أصناف الزكاة", RiHandCoinLine)}
        {renderLink("zakatGold", "حاسبة الزكاة", AiOutlineCalculator)}
        {renderLink("FitrZakat", "زكاة الفطر", GiBowlOfRice)}
      </SidebarDropdown>

      {/* الأضاحي */}
      <SidebarDropdown title="الأضاحي" icon={GiSheep}>
        {renderLink("sacirificeTypes", "أنواع الأضاحي", GiSheep)}
        {renderLink("sacrificeDataMain", "طلبات الأضاحي", GiSheep)}
      </SidebarDropdown>

      {/* الحملات */}
      {renderLink("campaign", "الحملات", RiServiceLine)}

      {/* الصلاحيات */}
      <SidebarDropdown title="الصلاحيات" icon={RiShieldKeyholeLine}>
        {renderLink("privelges", "الصلاحيات", RiShieldKeyholeLine)}
        {renderLink("users", "المستخدمين", FiUsers)}
      </SidebarDropdown>

      {/* الصفحات */}
      <SidebarDropdown title="الصفحات" icon={FiInfo}>
        {renderLink("whoarewe", "من نحن؟", FiInfo)}
        {renderLink("conditions", "الشروط", RiGovernmentLine)}
        {renderLink("privarypolicy", "سياسة الخصوصية", FiInfo)}
        {renderLink("ContactUs", "اتصل بنا", FiPhoneCall)}
        {renderLink("CommonQuestions", "الأسئلة الشائعة", MdOutlineAssignmentTurnedIn)}
        {renderLink("UsersQuestions", "أسئلة المستخدمين", MdOutlineAssignmentTurnedIn)}
      </SidebarDropdown>

    </NavList>
  );
}



const DropdownContainer = chakra("div", {
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
});

const DropdownHeader = chakra("button", {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    h: "56px",
    px: 6,
    fontWeight: 800,
    color: "gray.600",
    _hover: { bg: "gray.200", color: "gray.700" },
  },
});

const DropdownItem = chakra("div", {
  baseStyle: {
    pl: 10,
  },
});

function SidebarDropdown({ title, icon: IconComp, children }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownContainer>
      <DropdownHeader onClick={() => setOpen(!open)}>
        <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Icon as={IconComp} boxSize={5} />
          {title}
        </span>
        <Icon as={open ? ChevronUpIcon : ChevronDownIcon } boxSize={5} />
      </DropdownHeader>

      <Collapse in={open} animateOpacity>
        <DropdownItem>{children}</DropdownItem>
      </Collapse>
    </DropdownContainer>
  );
}