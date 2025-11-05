// src/components/Shared/FieldControl.tsx (الإصلاح النهائي للـ Placeholder)

import { chakra, Input, Select } from "@chakra-ui/react";

export const FieldInput = chakra(Input, {
  baseStyle: {
    w: "full",
    rounded: "10px",
    bg: "white",
    border: "none",
    px: 4,
    textAlign: "left", 
    dir: "rtl", // ✅ FIX: فرض الاتجاه
    _focusVisible: { boxShadow: "none" },
    _placeholder: {
  // marginLeft:"200px",
    
      color: "gray.500",
      textAlign: "left", // فرض المحاذاة لليمين
    },
  },
});

export const FieldSelect = chakra(Select, {
  baseStyle: {
    w: "full",
    rounded: "10px",
    bg: "white",
    border: "none",
    px: 10,
    textAlign: "left", 
    dir: "rtl", // ✅ FIX: فرض الاتجاه
    _focusVisible: { boxShadow: "none" },
    pe: "10",
    _placeholder: {

      color: "gray.500", 
      textAlign: "left", // فرض المحاذاة لليمين
// marginLeft:"200px"
    },
    sx: {
      ".chakra-select__icon": {
        insetInlineEnd: "3",
        top: "50%",
left:"50%",
        transform: "translateY(-50%)",
      },
      "& > option": {
          direction: "ltr",
          textAlign: "ltr",
      }
    },
  },
});