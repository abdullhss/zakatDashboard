import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

// أيقونات من مكتبات متنوعة
import {
  FiHome,
  FiCreditCard,
  FiUsers,
  FiSend,
  FiFileText,
  FiSearch,
} from "react-icons/fi";
import {
  RiShieldKeyholeLine,
  RiHandCoinLine,
  RiServiceLine,
  RiNewspaperLine,
} from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { GiChecklist, GiFoodChain, GiSheep } from "react-icons/gi";
import { MdOutlineWork, MdPayments, MdReport } from "react-icons/md";
import { BsCashCoin } from "react-icons/bs";

import { getSession } from "../../../session";
import { useGetGroupRightFeature } from "../../MainDepartment/Privelges/hooks/useGetGroupRightFeature";
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
    {/* {renderLink(".", "الصفحة الرئيسية", FiHome)} */}

    <SidebarDropdown title="إدارة المستخدمين" icon={FiUsers}>
      {renderLink("privelgesOffice", "الصلاحيات", RiShieldKeyholeLine)}
      {renderLink("usersOffice", "المستخدمين", FiUsers)}
      {renderLink("searcher", "الباحثين", FiSearch)}
    </SidebarDropdown>
    
    <SidebarDropdown title="ادارة المنصة" icon={GiChecklist}>
      {renderLink("projects", "المشاريع", MdOutlineWork)}
      {renderLink("newsdata", "الأخبار", RiNewspaperLine)}
      {renderLink("sacrificesDashData", "طلبات الاضاحي", GiSheep)}
      {renderLink("assistanceData", "طلبات الاعانة", GiChecklist)}
      {renderLink("fitrZakat", "زكاة الفطر", GiFoodChain)}
    </SidebarDropdown>

    {renderLink("paymentData", "المدفوعات", BsCashCoin)}
    <SidebarDropdown title="الحسابات" icon={BsCashCoin}>
      {renderLink("transferdata", "التحويلات البنكية", FiSend)}
      {renderLink("dashpayment", "المصروفات", RiHandCoinLine)}
      {renderLink("statement", "كشف الحسابات المصرفية", FiFileText)}
    </SidebarDropdown>

    {/* <SidebarDropdown title="التقارير" icon={GiChecklist}>

    </SidebarDropdown> */}

    <SidebarDropdown title="التقارير" icon={MdReport}>
      {renderLink("Payments", "المدفوعات", MdPayments)}
      {renderLink("Receipts", "المصروفات", MdPayments)}
      {renderLink("ZakatReport", "الزكاة", MdPayments)}
      {renderLink("SadakaReport", "الصدقة", MdPayments)}
      {renderLink("KafaraReport", "الكفارة", MdPayments)}
      {renderLink("FedyaReport", "الفدية", MdPayments)}
      {renderLink("SacirificeReport", "الاضاحي", MdPayments)}
      {renderLink("FitrZakatReport", "زكاة الفطر", MdPayments)}
      {/* {renderLink("ZemmaReport", "ابراء الذمة", MdPayments)} */}
      {renderLink("NazrReport", "النذور", MdPayments)}
      {renderLink("LoverDonationReport", "تبرع لمن تحب", MdPayments)}
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