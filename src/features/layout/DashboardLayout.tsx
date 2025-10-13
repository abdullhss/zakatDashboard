import { Outlet } from "react-router-dom";
import { chakra } from "@chakra-ui/react";
import PageHeader from "../../Components/HomePageHeader/MainDepartmentPageHeader";
import SideBarMainDepartment from "../MainDepartment/MainDashboardUi/SideBarMainDepartment";
import SideBarOfficeDepartment from "../OfficeDashboard/OfficeDashboardUI/SideBarOfficeDepartment";

const StyledAppLayout = chakra("div", {
  baseStyle: {
    display: "grid",
    minHeight: "100vh",
    gridTemplateColumns: "314px 1fr",
    gridTemplateRows: "72px 1fr",
    gridTemplateAreas: `
      "sidebar header"
      "sidebar main"
    `,
    bg: "background.app",
  },
});

const Main = chakra("main", {
  baseStyle: {
    gridArea: "main",
    p: 4,
    overflowY: "auto",
  },
});

const HeaderWrap = chakra(PageHeader, {
  baseStyle: { gridArea: "header" },
});

function getRole(): "M" | "O" {
  const r = (localStorage.getItem("role") || "").toUpperCase();
  return r === "O" ? "O" : "M";
}

export default function DashboardLayout() {
  const role = getRole();
  const Sidebar = role === "O" ? SideBarOfficeDepartment : SideBarMainDepartment;

  return (
    <StyledAppLayout>
      <HeaderWrap />
      <Sidebar />
      <Main>
        <Outlet />
      </Main>
    </StyledAppLayout>
  );
}
