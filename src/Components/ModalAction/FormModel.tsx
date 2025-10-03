// src/Components/ModalAction/FormModel.tsx
import React from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  FormControl, FormLabel, FormErrorMessage,
  Input, Textarea, Switch, Checkbox,
  HStack, Box, useToast, useColorModeValue,
  SimpleGrid, IconButton, Flex, Text,
} from "@chakra-ui/react";
import { AiFillCloseSquare } from "react-icons/ai";
import SharedButton from "../SharedButton/Button";

export type FieldType = "input" | "textarea" | "switch" | "checkbox";

export type FieldConfig = {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  type?: FieldType; // default: "input"
  inputProps?: React.ComponentProps<typeof Input> & { dir?: "rtl" | "ltr" };
  colSpan?: number; // 2 = يمتد العرض كله
  error?: string;   // اختياري لرسالة خطأ مخصصة
};

type Mode = "form" | "confirm";

export type FormModalProps<TValues extends Record<string, any> = Record<string, any>> = {
  isOpen: boolean;
  onClose: () => void;
  title: string;

  mode?: Mode;

  // form
  fields?: FieldConfig[];
  initialValues?: TValues;
  validate?: (values: TValues) => string | null;
  onSubmit?: (values: TValues) => void | Promise<void>;

  // confirm
  description?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmType?: "danger" | "primary";

  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  maxW?: string;
};

export default function FormModal<TValues extends Record<string, any> = Record<string, any>>({
  isOpen, onClose, title,
  mode = "form",
  fields = [],
  initialValues,
  validate,
  onSubmit,
  description,
  onConfirm,
  confirmType = "danger",
  submitLabel = mode === "confirm" ? "تأكيد" : "إضافة",
  cancelLabel = "إلغاء",
  isSubmitting = false,
  maxW = "820px",
}: FormModalProps<TValues>) {
  const toast = useToast();
  const bodyBg = useColorModeValue("white", "gray.800");

  const [values, setValues] = React.useState<TValues>((initialValues || {}) as TValues);

  React.useEffect(() => {
    setValues((initialValues || {}) as TValues);
  }, [initialValues, isOpen]);

  const update = (name: string, v: any) =>
    setValues((prev) => ({ ...(prev as any), [name]: v }));

  const handleSubmitForm = async () => {
    for (const f of fields) {
      if (!f.required) continue;
      const v = (values as any)[f.name];
      const empty = typeof v === "string" ? !v.trim() : v == null;
      if (empty) {
        toast({
          status: "error",
          title: "حقول مطلوبة",
          description: `من فضلك أدخل ${f.label || f.name}`,
        });
        return;
      }
    }
    if (validate) {
      const msg = validate(values);
      if (msg) {
        toast({ status: "error", title: "تحقق", description: msg });
        return;
      }
    }
    await onSubmit?.(values);
  };

  const handleConfirm = async () => {
    await onConfirm?.();
  };

  const renderFormBody = () => (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {fields.map((f) => {
        const type: FieldType = f.type ?? "input";
        const span = f.colSpan ?? 2;

        const textCommon =
          type === "switch" || type === "checkbox"
            ? undefined
            : {
                placeholder: f.placeholder,
                value: (values as any)[f.name] ?? "",
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  update(f.name, e.target.value),
                dir: f.inputProps?.dir,
                ...f.inputProps,
              };

        return (
          <Box key={f.name} gridColumn={span === 2 ? "1 / -1" : undefined}>
            <FormControl isRequired={f.required} isInvalid={!!f.error}>
              {f.label && <FormLabel fontWeight="600">{f.label}</FormLabel>}

              {type === "textarea" ? (
                <Textarea {...(textCommon as any)} />
              ) : type === "switch" ? (
                <HStack borderWidth="1px" borderRadius="md" p={3} justify="space-between">
                  <Box as="span">{f.label || f.placeholder || f.name}</Box>
                  <Switch
                    isChecked={!!(values as any)[f.name]}
                    onChange={(e) => update(f.name, e.target.checked)}
                    colorScheme="teal"
                  />
                </HStack>
              ) : type === "checkbox" ? (
                <HStack borderWidth="1px" borderRadius="md" p={3} justify="space-between">
                  <Box as="span">{f.label || f.placeholder || f.name}</Box>
                  <Checkbox
                    isChecked={!!(values as any)[f.name]}
                    onChange={(e) => update(f.name, e.target.checked)}
                    colorScheme="teal"
                  />
                </HStack>
              ) : (
                <Input {...(textCommon as any)} />
              )}
              {!!f.error && <FormErrorMessage>{f.error}</FormErrorMessage>}
            </FormControl>
          </Box>
        );
      })}
    </SimpleGrid>
  );

  const renderConfirmBody = () => (
    <Box>{typeof description === "string" ? <Text color="gray.700">{description}</Text> : description}</Box>
  );

  const primaryVariant =
    mode === "confirm" && confirmType === "danger" ? "brandGradient" : "brandGradient";

  const renderFooterButtons = () => (
    <HStack spacing={4} w="100%" justify="space-around">
      <SharedButton variant="dangerOutline" onClick={onClose} label={cancelLabel} fullWidth />
      <SharedButton
        variant={primaryVariant as any}
        onClick={mode === "confirm" ? handleConfirm : handleSubmitForm}
        isLoading={isSubmitting}
        label={submitLabel}
        fullWidth
      />
    </HStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent rounded="xl" p={4} maxW={maxW} pos="relative">
        <ModalHeader p={0}>
          <Flex align="center" justify="space-between" px={4} pt={4}>
            <Box as="h3" fontWeight="700" fontSize="lg">{title}</Box>
            <IconButton
              aria-label="إغلاق"
              icon={<AiFillCloseSquare size={22} />}
              onClick={onClose}
              w="30px" h="30px" minW="30px"
              borderRadius="md"
              bg="brand.900" color="white"
              _hover={{ bg: "brand.800" }} _active={{ bg: "brand.700" }}
              variant="solid"
            />
          </Flex>
        </ModalHeader>

        <ModalBody bg={bodyBg}>
          {mode === "confirm" ? renderConfirmBody() : renderFormBody()}
        </ModalBody>

        <ModalFooter>{renderFooterButtons()}</ModalFooter>
      </ModalContent>
    </Modal>
  );
}
