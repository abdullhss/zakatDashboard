// src/components/Shared/FieldControl.tsx
import { chakra, Input, Select } from "@chakra-ui/react";

export const FieldInput = chakra(Input, {
  baseStyle: {
    h: "65px",
    w: "full",
    rounded: "10px",
    bg: "white",
    border: "none",                 // بلا حدود
    px: 4,
    textAlign: "right",
    _focusVisible: { boxShadow: "none" },
    _placeholder: { color: "gray.500" },
  },
});

export const FieldSelect = chakra(Select, {
  baseStyle: {
    h: "65px",
    w: "full",
    rounded: "10px",
    bg: "white",
    border: "none",                 // بلا حدود
    px: 4,
    textAlign: "right",
    _focusVisible: { boxShadow: "none" },
    pe: "10",
    sx: {
      ".chakra-select__icon": {
        insetInlineEnd: "3",
        top: "50%",
        transform: "translateY(-50%)",
      },
    },
  },
});
