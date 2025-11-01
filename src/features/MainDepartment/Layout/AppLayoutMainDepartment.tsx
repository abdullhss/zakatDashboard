// src/features/MainDepartment/Layout/AppLayoutMainDepartment.tsx

import { Outlet } from "react-router-dom";
import { chakra, Spinner, Flex } from "@chakra-ui/react";
import PageHeader from "../../../Components/HomePageHeader/MainDepartmentPageHeader";
import SideBarMainDepartment from "../MainDashboardUi/SideBarMainDepartment";
import SideBarOfficeDepartment from "../../OfficeDashboard/OfficeDashboardUI/SideBarOfficeDepartment";
import { getSession } from "../../../session"; 
// 💡 يجب استيراد Hook جلب الصلاحيات هنا (تأكد من المسار الصحيح لديك)
import { useGetGroupRightFeature } from '../Privelges/hooks/useGetGroupRightFeature'; 

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
    const { userType, groupRightId } = getSession(); 
    const isAdmin = groupRightId === 0;

    // 2. استخدام الـ Hook الحقيقي لجلب الميزات
    const { data, isLoading, isError } = useGetGroupRightFeature(role, groupRightId);

    let allowedFeatureCodes: string[] = [];

    if (isAdmin) {
        allowedFeatureCodes = ['all']; // المدير العام لديه صلاحية "الكل"
    } else if (data?.rows) {
        // 3. تحويل مصفوفة الصفوف إلى مصفوفة من أكواد الميزات (FeatureCode)
        allowedFeatureCodes = data.rows
            .filter(r => r.GroupRightValue === 1) // فقط الميزات المفعَّلة (GroupRightValue: 1)
            .map(r => r.FeatureCode)
            .filter(code => !!code); // تصفية أي أكواد فارغة أو غير صحيحة
    }

    // 4. عرض شاشة التحميل
    if (isLoading && !isAdmin) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }
    
    // في حالة الخطأ، نعود إلى أقل الصلاحيات لمنع التعطل
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
        {/* 5. تمرير قائمة الأكواد المسموح بها إلى الـ Sidebar */}
        <Sidebar allowedFeatures={allowedFeatureCodes} /> 
        <Main>
            <Outlet />
        </Main>
        </StyledAppLayout>
    );
}