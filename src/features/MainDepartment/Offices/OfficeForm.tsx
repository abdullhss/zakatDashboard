import { Box, VStack } from "@chakra-ui/react";
import OfficeDetailsSection, { type OfficeDetailsValues } from "./OfficeDetailsSection";

export type OfficeFormValues = OfficeDetailsValues;

type Props = {
  defaultValues?: Partial<OfficeFormValues>;
};

export default function OfficeForm({ defaultValues }: Props) {
  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <OfficeDetailsSection defaultValues={defaultValues} />
      </VStack>
    </Box>
  );
}
