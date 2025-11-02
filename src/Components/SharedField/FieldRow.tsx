// src/components/Shared/FieldRow.tsx
import { VStack, Text } from "@chakra-ui/react";

type FieldRowProps = {
  label: string;
  children: React.ReactNode;
};

export default function FieldRow({ label, children }: FieldRowProps) {
  return (
    <VStack align="stretch" spacing={2} w="full" dir="rtl">
      <Text fontWeight="700" fontSize="mx;d" color="gray.700">
        {label}
      </Text>
      {children}
    </VStack>
  );
}
