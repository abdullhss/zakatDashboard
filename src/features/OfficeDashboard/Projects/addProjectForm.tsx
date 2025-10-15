import React, { useRef, useState } from "react";
import {
  Box, Grid, GridItem, FormControl, FormLabel, Input, Select, Textarea,
  Checkbox, AspectRatio, Icon, Image, VStack, HStack, Text, useToast, Spinner, Alert, AlertIcon
} from "@chakra-ui/react";
import { MdImage } from "react-icons/md";
import SharedButton from "../../../Components/SharedButton/Button";
import { useNavigate } from "react-router-dom";
import { useAddProject } from "./hooks/useAddProject";
// تأكد من المسار الصحيح لهذا الـ hook
import { useGetSubventionTypes } from "../../MainDepartment/Subvention/hooks/useGetubventionTypes"; 

export default function AddProjectForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const addProject = useAddProject();

  // تحديد الحالة للـ form
  const [form, setForm] = useState({
    name: "",
    category: "", // ID الفئة
    initialValue: "",
    remainingValue: "",
    requestedValue: "",
    importance: "", 
    acceptZakah: true, // قبول الزكاة فقط
    isActive: true, // الحالة (نشط/غير نشط)
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);  

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const onChooseImage = () => inputFileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
  };

  // جلب بيانات التصنيفات
  const { data, isLoading, isError, error } = useGetSubventionTypes(0, 50); // زدنا الحد لضمان جلب كل التصنيفات

  // === التعديل هنا لاستخلاص البيانات بشكل صحيح ===
  const subventionRows = data?.rows ?? [];
  // ===============================================

  const onSubmit = async () => {
    try {
      // تجهيز الحمولة للإرسال
      const payload = {
        projectName: form.name,
        projectDesc: form.description,
        subventionTypeId: form.category ? Number(form.category) : 0, // ID من الفئة المختارة
        wantedAmount: form.requestedValue,
        openingBalance: form.initialValue,
        remainingAmount: form.remainingValue,
        allowZakat: !!form.acceptZakah, // قبول الزكاة فقط
        importanceId: 0, 
        isActive: form.isActive, // تحديد الحالة
        photoName: imageFile?.name || "",
      };

      await addProject.mutateAsync(payload);

      toast({ status: "success", title: "تم الحفظ", description: "تم إضافة المشروع بنجاح" });
      // navigate("/officedashboard/projects");   
    } catch (e: any) {
      toast({ status: "error", title: "فشل الإضافة", description: e?.message || "حدث خطأ غير متوقع" });
    }
  };

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب التصنيفات: {(error as Error)?.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" _dark={{ bg: "gray.800" }}>
        <Text fontSize="lg" fontWeight="700" mb={4}>بيانات المشروع</Text>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 300px" }} gap={4}>
          {/* العمود الأيسر - يحتوي على التصنيفات */}
          <GridItem>
            <FormControl mb={4} isRequired>
              <FormLabel>اسم المشروع</FormLabel>
              <Input
                placeholder="برجاء كتابة اسم المشروع"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>تصنيف المشروع</FormLabel>
              <Select
                placeholder="برجاء اختيار تصنيف المشروع"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                isDisabled={subventionRows.length === 0} // تعطيل إذا لم تتوفر بيانات
              >
                {subventionRows.map((row: any) => (
                  <option key={row.Id} value={row.Id}>
                    {row.SubventionTypeName} 
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>

          {/* العمود الأوسط */}
          <GridItem>
            <FormControl mb={4}>
              <FormLabel>القيمة الابتدائية</FormLabel>
              <HStack>
                <Input
                  placeholder="القيمة الابتدائية"
                  value={form.initialValue}
                  onChange={(e) => update("initialValue", e.target.value)}
                />
                <Box minW="60px" textAlign="center" bg="gray.50" borderRadius="md" p={2}>د.ل.</Box>
              </HStack>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>القيمة المتبقية</FormLabel>
              <HStack>
                <Input
                  placeholder="برجاء كتابة القيمة المتبقية"
                  value={form.remainingValue}
                  onChange={(e) => update("remainingValue", e.target.value)}
                />
                <Box minW="60px" textAlign="center" bg="gray.50" borderRadius="md" p={2}>د.ل.</Box>
              </HStack>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>القيمة المطلوبة</FormLabel>
              <HStack>
                <Input
                  placeholder="برجاء كتابة القيمة المطلوبة"
                  value={form.requestedValue}
                  onChange={(e) => update("requestedValue", e.target.value)}
                />
                <Box minW="60px" textAlign="center" bg="gray.50" borderRadius="md" p={2}>د.ل.</Box>
              </HStack>
            </FormControl>

            <HStack spacing={8} mb={4}>
              <Checkbox
                isChecked={form.acceptZakah}
                onChange={(e) => update("acceptZakah", e.target.checked)}
              >
                يقبل الزكاة
              </Checkbox>
            </HStack>

            <FormControl mb={4}>
              <FormLabel>الحالة</FormLabel>
              <Select
                placeholder="برجاء اختيار الحالة"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => update("isActive", e.target.value === "active")}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </Select>
            </FormControl>
          </GridItem>

          {/* عمود الصورة */}
          <GridItem>
            <FormLabel>صورة المشروع</FormLabel>
            <VStack>
              <AspectRatio
                ratio={4 / 3}
                w="full"
                borderWidth="1px"
                borderRadius="md"
                bg="gray.50"
                _dark={{ bg: "gray.700" }}
                cursor="pointer"
                onClick={onChooseImage}
              >
                <Box position="relative">
                  {imageFile ? (
                    <Image
                      src={URL.createObjectURL(imageFile)}
                      alt="Project"
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                  ) : (
                    <VStack w="100%" h="100%" align="center" justify="center" spacing={2}>
                      <Icon as={MdImage} boxSize={10} color="gray.400" />
                      <Text color="gray.500">برجاء اختيار صورة للمشروع</Text>
                    </VStack>
                  )}
                </Box>
              </AspectRatio>

              <input
                ref={inputFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onFile}
              />
            </VStack>
          </GridItem>
        </Grid>

        <FormControl mt={4}>
          <FormLabel>وصف المشروع</FormLabel>
          <Textarea
            placeholder="برجاء كتابة وصف المشروع"
            rows={5}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </FormControl>

        <HStack mt={6} spacing={4} justify="flex-start">
          <SharedButton
            variant="brandGradient"
            onClick={onSubmit}
            isLoading={addProject.isPending}
          >
            إضافة
          </SharedButton>
          <SharedButton variant="dangerOutline" onClick={() => navigate(-1)}>
            إلغاء
          </SharedButton>
        </HStack>
      </Box>
    </Box>
  );
}
