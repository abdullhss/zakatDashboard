
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  HStack,
} from "@chakra-ui/react";

export default function DeleteDialog(props: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  message?: string;
}) {
  const {
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    title = "حذف",
    message = "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
  } = props;
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader fontWeight="700">{title}</AlertDialogHeader>
        <AlertDialogBody>{message}</AlertDialogBody>
        <AlertDialogFooter>
          <HStack w="100%" spacing={4} justify="space-around">
            <Button onClick={onClose} variant="outline">
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={onConfirm} isLoading={isLoading}>
              حذف
            </Button>
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
