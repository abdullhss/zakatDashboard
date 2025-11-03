
import { HStack, Button } from "@chakra-ui/react";
import SharedButton from "../../../../Components/SharedButton/Button";

type Props = {
  isEdit: boolean;
  busy: boolean;
  allOk: boolean;
  onReset: () => void;
  onBack: () => void;
};

export default function FormActions({
  isEdit, busy, allOk, onReset, onBack,
}: Props) {
  return (
    <HStack justify="flex-start" spacing={4} pt={2}>
      <Button type="submit" isLoading={busy} isDisabled={busy || !allOk} colorScheme="teal">
        {isEdit ? "تحديث" : "إضافة"}
      </Button>

      <SharedButton variant="dangerOutline" onClick={onReset}>
        إلغاء
      </SharedButton>

      <SharedButton variant="secondary" onClick={onBack}>
        الرجوع للقائمة
      </SharedButton>
    </HStack>
  );
}
