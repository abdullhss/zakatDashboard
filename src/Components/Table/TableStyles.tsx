import { Box, Th, Td, chakra, Flex } from "@chakra-ui/react";

export const TableCardContainer = chakra(Box, {
  baseStyle: {
    bg: "white",
    borderRadius: "lg",
    boxShadow: "sm",
    p: 6,
    overflowX: "auto",
    margin:"auto",
  },
});

export const TableHeader = chakra(Flex, {
  baseStyle: {
    justifyContent: "space-between",
    alignItems: "center",
    pb: 4,
  },
});

export const TableHeadCell = chakra(Th, {
  baseStyle: {
    color: "gray.600",
    fontSize: "16px", 
    fontWeight: "600", 
    borderBottom: "1px solid",
    borderColor: "gray.200",
    py: 2, 
    px: 3,
    textAlign: "right",
    // استثناء الترقيم (#) ومربع التحديد (Checkbox) للمحاذاة في المنتصف
  },
});

export const TableDataCell = chakra(Td, {
  baseStyle: {
    // تقليل المسافة العمودية لتقريب الصفوف
    py: 2, 
    px: 3,
    fontSize: "16px",
    fontWeight:"normal", // تقليل سُمك الخط
    borderBottom: "1px solid",
    borderColor: "gray.100",
    // محاذاة المحتوى رأسيًا في المنتصف
    verticalAlign: "middle", 
    textAlign: "right",
    // استثناء الترقيم ومربع التحديد للمحاذاة في المنتصف
    "&:nth-child(1), &:nth-child(2)": { textAlign: "center" },
  },
});