import { Outlet } from "react-router-dom";
import { chakra } from "@chakra-ui/react";
import PageHeader from "../../Components/HomePageHeader/PageHeader";
import SideBarOfficeDepartment from "../../features/OfficeDashboardUI/SideBarOfficeDepartment";

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
    bg: "gray.50",
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
const SidebarWrap = chakra(SideBarOfficeDepartment, {
  baseStyle: { gridArea: "sidebar" },
});

export default function OfficeDashboardLayout() {
  return (
    <StyledAppLayout>
      <HeaderWrap />
      <SidebarWrap />
      <Main>
        <Outlet />
      </Main>
    </StyledAppLayout>
  );
}
