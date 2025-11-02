// src/components/Shared/FieldControl.tsx (الإصلاح النهائي للـ Placeholder)

import { chakra, Input, Select } from "@chakra-ui/react";

export const FieldInput = chakra(Input, {
  baseStyle: {
    h: "65px",
    w: "full",
    rounded: "10px",
    bg: "white",
    border: "none",
    px: 4,
    textAlign: "right", 
    dir: "rtl", // ✅ FIX: فرض الاتجاه
    _focusVisible: { boxShadow: "none" },
    _placeholder: {
  marginLeft:"200px",
      color: "gray.500",
      textAlign: "right", // فرض المحاذاة لليمين
    },
  },
});

export const FieldSelect = chakra(Select, {
  baseStyle: {
    h: "65px",
    w: "full",
    rounded: "10px",
    bg: "white",
    border: "none",
    px: 4,
    textAlign: "right", 
    dir: "rtl", // ✅ FIX: فرض الاتجاه
    _focusVisible: { boxShadow: "none" },
    pe: "10",
    _placeholder: {

      color: "gray.500", 
      textAlign: "right", // فرض المحاذاة لليمين
// marginLeft:"200px"
    },
    sx: {
      ".chakra-select__icon": {
        insetInlineEnd: "3",
        top: "50%",
left:"50%",
        transform: "translateY(-50%)",
      },
      // 💡 إضافة محاذاة للخيارات والقيمة المحددة
      "& > option": {
          direction: "ltr",
          textAlign: "ltr",
      }
    },
  },
});