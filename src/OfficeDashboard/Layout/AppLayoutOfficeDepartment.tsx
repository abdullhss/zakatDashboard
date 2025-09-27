// src/MainDepartment/Layout/AppLayoutMainDepartment.tsx
import { Outlet } from "react-router-dom"; // ✅ صح
import { chakra } from "@chakra-ui/react";
import SideBar from "../../features/DashboardUi/SideBar";
import PageHeader from "../../Components/HomePageHeader/PageHeader";

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

// ✅ غلّفنا المكوّنات بحيث تاخد gridArea مباشرة
const HeaderWrap = chakra(PageHeader, {
  baseStyle: { gridArea: "header" },
});
const SidebarWrap = chakra(SideBar, {
  baseStyle: { gridArea: "sidebar" },
});

export default function AppLayoutMainDepartment() {
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
