// src/features/MainDepartment/Layout/AppLayoutMainDepartment.tsx

import { Outlet } from "react-router-dom";
import { chakra, Spinner, Flex } from "@chakra-ui/react";
import PageHeader from "../../Components/HomePageHeader/MainDepartmentPageHeader";
import SideBarMainDepartment from "../MainDepartment/MainDashboardUi/SideBarMainDepartment";
import SideBarOfficeDepartment from "../OfficeDashboard/OfficeDashboardUI/SideBarOfficeDepartment";
import { getSession } from "../../session"; 
// 💡 تأكد من مسار Hook جلب الصلاحيات
import { useGetGroupRightFeature } from '../MainDepartment/Privelges/hooks/useGetGroupRightFeature'; 

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
    
    // 1. قراءة الصلاحيات من الجلسة
    const { groupRightId } = getSession(); 
    // المدير العام هو الذي له صلاحية 0
    const isAdmin = groupRightId === 0;

    // 2. استخدام الـ Hook: يتم تفعيله فقط للمستخدمين غير المديرين (groupRightId > 0)
    const { data, isLoading, isError } = useGetGroupRightFeature(
        role, 
        groupRightId
    );

    let allowedFeatureCodes: string[] = [];

    // 3. منطق تحديد الصلاحيات:
    if (isAdmin) {
        // ⭐⭐ الحل: المدير العام له كل الصلاحيات دون الحاجة لـ API ⭐⭐
        allowedFeatureCodes = ['all']; 
    } else if (data?.rows) {
        // 4. المستخدم العادي: فلترة الميزات النشطة
        allowedFeatureCodes = data.rows
            .filter(r => r.GroupRightValue === 1) // فقط الميزات المفعَّلة
            .map(r => r.FeatureCode)
            .filter(code => !!code); 
    }

    // 5. شاشة التحميل
    if (isLoading && !isAdmin) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }
    
    // 6. في حالة الخطأ
    if (isError) {
        allowedFeatureCodes = ['home']; 
    }

    // نحدد أي Sidebar سنعرض
    const Sidebar = role === "O" 
        ? SideBarOfficeDepartment 
        : SideBarMainDepartment;

    return (
        <StyledAppLayout>
          <HeaderWrap />
          {/* 7. تمرير قائمة الأكواد المسموح بها إلى الـ Sidebar */}
          <Sidebar allowedFeatures={allowedFeatureCodes} /> 
          <Main>
            <Outlet />
          </Main>
        </StyledAppLayout>
    );
}