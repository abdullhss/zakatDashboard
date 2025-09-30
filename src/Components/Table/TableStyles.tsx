import { Box, Th, Td, chakra, Flex } from "@chakra-ui/react";

/** قيَم متدرجة حسب المقاس */
const ROW_H_RESP = { base: "44px", md: "48px", lg: "52px" }; // ارتفاع الصف
const CELL_PY_RESP = { base: 2.5, md: 3, lg: 3.5 };          // ~10px, 12px, 14px عموديًا
const CELL_PX_RESP = { base: 3, md: 4, lg: 5 };              // 12px, 16px, 20px أفقيًا

/** حاوية الكارت/الجدول */
export const TableCardContainer = chakra(Box, {
  baseStyle: {
    bg: "background.surface",
    border: "1px solid",
    borderColor: "background.border",
    borderRadius: "lg",
    boxShadow: "sm",
    p: { base: 3, md: 4, lg: 5 },        // responsive padding
    overflowX: "auto",
    mx: "auto",
  },
});

export const TableHeader = chakra(Flex, {
  baseStyle: {
    justifyContent: "space-between",
    alignItems: "center",
    pb: { base: 2, md: 3 },               // responsive spacing
  },
});

/** خلية رأس الجدول */
export const TableHeadCell = chakra(Th, {
  baseStyle: {
    bg: "background.subtle",
    color: "gray.700",
    fontSize: { base: "13px", md: "14px" },
    fontWeight: 700,
    borderBottom: "1px solid",
    borderColor: "background.border",
    py: CELL_PY_RESP,
    px: CELL_PX_RESP,
    h: ROW_H_RESP,
    lineHeight: ROW_H_RESP,
    textAlign: "right",
    _first: { borderTopRightRadius: "md" },
    _last:  { borderTopLeftRadius: "md"  },

    // 👇 مسافة إضافية للعمود الثاني تتدرج حسب المقاس
    "&:nth-child(2)": { ps: { base: 4, md: 6, lg: 8 } }, // 16px / 24px / 32px
  },
});

/** خلية بيانات الجدول */
export const TableDataCell = chakra(Td, {
  baseStyle: {
    py: CELL_PY_RESP,
    px: CELL_PX_RESP,
    fontSize: { base: "14px", md: "15px" },
    borderBottom: "1px solid",
    borderColor: "background.border",
    bg: "white",
    verticalAlign: "middle",
    h: ROW_H_RESP,
    lineHeight: ROW_H_RESP,
    textAlign: "right",

    // أول عمود (#) في النص
    "&:nth-child(1)": { 
      textAlign: "center", 
      w: { base: "44px", md: "48px", lg: "52px" } 
    },

    // 👇 نفس الزيادة للعمود التاني (RTL-aware) بشكل متدرّج
    "&:nth-child(2)": { ps: { base: 4, md: 6, lg: 8 } },
  },
});

// ✅ alias بالاسم القديم عشان DataTable يلاقيه
export const ROW_H = ROW_H_RESP;
