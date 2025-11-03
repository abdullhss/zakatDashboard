// ConfirmDeleteDialog.tsx
import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay, Button, HStack
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ isOpen, onClose, onConfirm }: Props) {
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={undefined as any} onClose={onClose} isCentered>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader fontWeight="700">حذف الحساب البنكي</AlertDialogHeader>
        <AlertDialogBody>هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogBody>
        <AlertDialogFooter>
          <HStack spacing={3}>
            <Button onClick={onClose}>إلغاء</Button>
            <Button colorScheme="red" onClick={onConfirm}>حذف</Button>
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
