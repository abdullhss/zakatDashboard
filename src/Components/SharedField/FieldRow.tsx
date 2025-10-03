// src/components/Shared/FieldRow.tsx
import { Box, HStack, Text, chakra } from "@chakra-ui/react";

export const LabelBox = chakra(Box, {
  baseStyle: {
    h: "65px",
    rounded: "10px",
    border: "1px solid",
    borderColor: "#B7B7B7",
    px: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    bg: "white",
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "125%",
    color: "black",
    minW: "316px", // مطابق لفجما
  },
});

export const ControlBox = chakra(Box, {
  baseStyle: {
    h: "65px",
    rounded: "10px",
    border: "1px solid",
    borderColor: "#B7B7B7",
    bg: "white",
    px: 3,
    display: "flex",
    alignItems: "center",
  },
});

type FieldRowProps = {
  label: string;
  children: React.ReactNode;
};

export default function FieldRow({ label, children }: FieldRowProps) {
  return (
    <HStack spacing={4} align="stretch" w="full" dir="rtl">
      <LabelBox><Text>{label}</Text></LabelBox>
      <ControlBox flex="1">{children}</ControlBox>
    </HStack>
  );
}
