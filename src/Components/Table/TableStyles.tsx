// src/components/Table/TableStyles.tsx
import { Box, Th, Td, chakra, Flex } from "@chakra-ui/react";

/** قيم متوافقة مع فيجما */
export const ROW_H = "32px";  // ارتفاع الصف
export const CELL_PY = 1;     // 4px عموديًا
export const CELL_PX = 2;     // 8px أفقيًا

/** حاوية الكارت/الجدول */
export const TableCardContainer = chakra(Box, {
  baseStyle: {
    bg: "background.surface",        // سطح رمادي فاتح
    border: "1px solid",
    borderColor: "background.border",
    borderRadius: "lg",
    boxShadow: "sm",
    p: 4,                            // padding للكارت
    overflowX: "auto",
    mx: "auto",
  },
});

/** ترويسة الكارت */
export const TableHeader = chakra(Flex, {
  baseStyle: {
    justifyContent: "space-between",
    alignItems: "center",
    pb: 3,
  },
});

/** خلية رأس الجدول */
export const TableHeadCell = chakra(Th, {
  baseStyle: {
    bg: "background.subtle",         // أغمق سنة من سطح الجدول
    color: "gray.700",
    fontSize: "14px",
    fontWeight: 700,
    borderBottom: "1px solid",
    borderColor: "background.border",
    py: CELL_PY,
    px: CELL_PX,
    h: ROW_H,
    lineHeight: ROW_H,
    textAlign: "right",
    // تحسين بسيط لشكل الحافة اليمنى/اليسرى في أول وآخر رأس
    _first: { borderTopRightRadius: "md" },
    _last:  { borderTopLeftRadius: "md"  },
  },
});

/** خلية بيانات الجدول */
export const TableDataCell = chakra(Td, {
  baseStyle: {
    py: CELL_PY,
    px: CELL_PX,
    fontSize: "14px",
    borderBottom: "1px solid",
    borderColor: "background.border",
    bg: "white",
    verticalAlign: "middle",
    h: ROW_H,
    lineHeight: ROW_H,
    textAlign: "right",
    // عمود الترقيم في المنتصف
    "&:nth-child(1)": { textAlign: "center" },
  },
});
