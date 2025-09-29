// src/features/Banks/AddBankModal.tsx
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  HStack,
  useToast,
} from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import { useAddBank } from "./hooks/useAddBank";

type AddBankModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddBankModal: React.FC<AddBankModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");

  // هوك الإضافة
  const { mutate, isPending } = useAddBank();

  const handleAdd = () => {
    if (!bankName.trim()) {
      toast({
        title: "خطأ",
        description: "من فضلك أدخل اسم البنك",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Call API
    mutate(
      { bankName },
      {
        onSuccess: () => {
          toast({
            title: "تمت الإضافة",
            description: "تمت إضافة البنك بنجاح",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setBankName("");
          setBankCode("");
          onClose();
        },
        onError: (err: any) => {
          toast({
            title: "فشل",
            description: err.message || "حدث خطأ أثناء الإضافة",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent rounded="xl" p={2}>
        <ModalHeader fontWeight="700">إضافة بنك</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4} isRequired>
            <FormLabel fontWeight="600">اسم البنك</FormLabel>
            <Input
              placeholder="برجاء كتابة اسم البنك"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontWeight="600">الرمز المصرفي</FormLabel>
            <Input
              placeholder="برجاء كتابة الرمز المصرفي"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={4} w="full" justify="flex-end">
            <SharedButton
              label="إلغاء"
              variant="dangerOutline"
              onClick={onClose}
            />
            <SharedButton
              label="إضافة"
              variant="brandGradient"
              onClick={handleAdd}
              isLoading={isPending}
            />
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddBankModal;
