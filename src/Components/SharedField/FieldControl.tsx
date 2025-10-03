// src/features/Offices/components/fields.ts
import { chakra, Input, Select } from "@chakra-ui/react";

export const FieldInput = chakra(Input, {
  baseStyle: {
    h: "full",
    w: "full",
    border: "none",            // إحنا موصلين الـ border على الـ ControlBox
    _focusVisible: { boxShadow: "none" },
    _placeholder: { color: "gray.500" },
  },
});

export const FieldSelect = chakra(Select, {
  baseStyle: {
    h: "full",
    w: "full",
    border: "none",
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
