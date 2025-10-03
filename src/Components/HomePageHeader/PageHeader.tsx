// src/features/DashboardUi/PageHeader.jsx (ملف جديد)

import { chakra, Flex, Text, Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { useLocation } from "react-router-dom"; // ⬅️ لاستخراج المسار الحالي

// دالة بسيطة لترجمة مسار الصفحة إلى عنوان
const getPageTitle = (pathname :any) => {
    switch (pathname) {
        case '/maindashboard':
            return 'الصفحة الرئيسية';
        case '/maindashboard/cities':
            return 'المدن';
        case '/maindashboard/banks':
            return 'البنوك';
        case '/maindashboard/offices':
            return 'المكاتب';
        case '/maindashboard/subventionTypes':
            return 'تصنيف الإعانات';
        case '/maindashboard/kafara':
            return 'الكفارة ';
        case '/maindashboard/zakah':
            return 'أصناف الزكاة ';
        default:
            return 'لوحة التحكم';
    }
};

// 1. مُكوّن مخصص لمنطقة الهيدر
const StyledHeader = chakra(Flex, {
    baseStyle: {
        gridArea: "header",
        bg: "white",
        h: "72px",
        alignItems: "center",
        justifyContent: "space-between",
        px: 6, // مسافة داخلية أفقية
        borderBottom: "1px solid",
        borderColor: "gray.200",
        flexShrink: 0, // لضمان عدم تقلص ارتفاعه
    },
});

export default function PageHeader() {
    const location = useLocation();
    const title = getPageTitle(location.pathname);

    return (
        <StyledHeader dir="rtl">
            
            {/* 1. عنوان الصفحة (على اليمين) */}
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mr="auto">
                {title}
            </Text>

            {/* 2. قائمة المكتبة المنسدلة (على اليسار) */}
            <Menu placement="bottom-start">
                <MenuButton 
                    as={Button}
                    rightIcon={<FiChevronDown />}
                    size="sm"
                    bg="gray.100" // لون خلفية خفيف
                    color="gray.600"
                    _hover={{ bg: "gray.200" }}
                    _active={{ bg: "gray.200" }}
                    borderRadius="full" // لجعله دائرياً كما في التصميم
                >
                    الإدارة الرئيسية
                </MenuButton>
     
            </Menu>
            
        </StyledHeader>
    );
}