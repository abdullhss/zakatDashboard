// src/features/OfficeDashboard/Projects/AddProjectForm.tsx
import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  Box, Grid, GridItem, FormControl, FormLabel, Input, Select, Textarea,
  Checkbox, AspectRatio, Icon, Image, VStack, HStack, Text, useToast,
  Spinner, Alert, AlertIcon, Button, Flex
} from "@chakra-ui/react";
import { MdImage } from "react-icons/md";
import SharedButton from "../../../Components/SharedButton/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAddProject } from "./hooks/useAddProject";
import { useUpdateProject } from "./hooks/useUpdateProject";
import { useGetSubventionTypes } from "../../MainDepartment/Subvention/hooks/useGetubventionTypes";
import { HandelFile } from "../../../HandleFile.js";
import { getSession } from "../../../session";

// 🔗 نفس الدومين اللي بتعرض منه الصور
const ZAKAT_IMAGES_BASE = "https://framework.md-license.com:8093/ZakatImages";
const buildPhotoUrl = (id?: string | number, ext = ".jpg") =>
  id ? `${ZAKAT_IMAGES_BASE}/${id}${ext}` : "";

type FormShape = {
  id?: number;               // موجود في التعديل فقط
  name: string;
  category: string;
  initialValue: string;
  remainingValue: string;
  requestedValue: string;
  acceptZakah: boolean;
  isActive: boolean;
  description: string;
};

export default function AddProjectForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any; // location.state?.project لو رايح من الجدول
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const hf = useMemo(() => new HandelFile(), []);

  // --- هل احنا تعديل ولا إضافة؟ ---
  const incoming = location?.state?.project ?? null; // توقعنا من الجدول: navigate('/.../add', { state: { project: row } })
  const isEdit = !!incoming;

  // صورة المشروع الحالية بالـ ID
  const [currentPhotoId, setCurrentPhotoId] = useState<string>("");

  // فورم موحّد
  const [form, setForm] = useState<FormShape>({
    id: undefined,
    name: "",
    category: "",
    initialValue: "",
    remainingValue: "",
    requestedValue: "",
    acceptZakah: true,
    isActive: true,
    description: "",
  });

  // صورة مرفوعة جديد (اختيارية)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lastPhotoId, setLastPhotoId] = useState<string>(""); // debug
  const [lastPhotoName, setLastPhotoName] = useState<string>("");
  const [lastPhotoExt, setLastPhotoExt] = useState<string>("");

  const inputFileRef = useRef<HTMLInputElement>(null);
  const onChooseImage = () => inputFileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setImageFile(e.target.files?.[0] || null);

  const update = (k: keyof FormShape, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  // جلب التصنيفات
  const { data, isLoading, isError, error } = useGetSubventionTypes(0, 50);
  const subventionRows = data?.rows ?? [];

  // helper: تفكيك الاسم والامتداد
  const splitName = (f: File | null) => {
    if (!f?.name) return { base: "", ext: "" };
    const i = f.name.lastIndexOf(".");
    if (i === -1) return { base: f.name, ext: "" };
    return { base: f.name.slice(0, i), ext: f.name.slice(i) }; // ext with dot: ".jpg"
  };

  // ✅ عند الدخول في وضع تعديل: نعبي الفورم + نقرأ Photo ID من الصف
  useEffect(() => {
    if (!incoming) return;
    setForm({
      id: Number(incoming.Id ?? incoming.ProjectId ?? incoming.id),
      name: incoming.Name ?? incoming.ProjectName ?? "",
      category: String(incoming.SubventionType_Id ?? ""),
      initialValue: String(incoming.OpeningBalance ?? incoming.ProjectOpeningBalance ?? ""),
      remainingValue: String(incoming.RemainingAmount ?? incoming.ProjectRemainingAmount ?? ""),
      requestedValue: String(incoming.WantedAmount ?? incoming.ProjectWantedAmount ?? ""),
      acceptZakah: !!(incoming.AllowZakat ?? true),
      isActive: !!(incoming.IsActive ?? true),
      description: incoming.Description ?? incoming.ProjectDesc ?? "",
    });

    const pid = String(incoming.PhotoName ?? incoming.ProjectPhotoName ?? "");
    setCurrentPhotoId(pid && pid !== "undefined" ? pid : "");
  }, [incoming]);

  const onSubmit = async () => {
    // فحص أساسي
    if (!form.name.trim() || !form.category || !form.requestedValue.trim()) {
      toast({
        status: "warning",
        title: "بيانات ناقصة",
        description: "برجاء إدخال الاسم، التصنيف، والقيمة المطلوبة.",
      });
      return;
    }

    let photoId = currentPhotoId;
    try {
      const session = getSession();
      const sessionId =
        (session as any)?.SessionID ||
        (session as any)?.sessionId ||
        (session as any)?.token ||
        "";

      if (imageFile) {
        const { base, ext } = splitName(imageFile);
        setLastPhotoName(base);
        setLastPhotoExt(ext || ".jpg");

        const up = await hf.UploadFileWebSite({
          action: "Add",          // نفس الأخبار
          file: imageFile,
          fileId: "",
          SessionID: sessionId,
          onProgress: (p: number) => console.log(`Project photo progress: ${p}%`),
        });

        console.log("Upload project photo response:", up);
        if (!up?.id || up.id === "0") {
          throw new Error(up?.error || "فشل رفع الصورة");
        }

        photoId = String(up.id);
        setLastPhotoId(photoId);
        setCurrentPhotoId(photoId);
      }

      if (!isEdit) {
        // ----- إضافة -----
        const payload = {
          projectName: form.name,
          projectDesc: form.description,
          subventionTypeId: Number(form.category) || 0,
          wantedAmount: form.requestedValue,
          openingBalance: form.initialValue,
          remainingAmount: form.remainingValue,
          allowZakat: !!form.acceptZakah,
          importanceId: 0,
          isActive: !!form.isActive,
          projectPhotoName: photoId, // ← نخزن ID الصورة (لو فيه)
        };
        await addProject.mutateAsync(payload);
        toast({
          status: "success",
          title: "تم الحفظ",
          description: photoId
            ? `تم رفع الصورة (ID: ${photoId}) وحفظ المشروع.`
            : "تم حفظ المشروع.",
        });
      } else {
        // ----- تعديل -----
        const payload = {
          id: Number(form.id),
          projectName: form.name,
          projectDesc: form.description,
          subventionTypeId: Number(form.category) || 0,
          wantedAmount: form.requestedValue,
          openingBalance: form.initialValue,
          remainingAmount: form.remainingValue,
          allowZakat: !!form.acceptZakah,
          importanceId: 0,
          isActive: !!form.isActive,
          photoName: photoId, // ← مهم: ده اسم الحقل في خدمة التحديث
        };
        const res = await updateProject.mutateAsync(payload);
        if ((res as any)?.success === false) {
          throw new Error((res as any)?.error || "فشل التعديل");
        }
        toast({
          status: "success",
          title: "تم تعديل المشروع بنجاح.",
          description: photoId ? `Image ID: ${photoId}` : undefined,
        });
      }

      // navigate("/officedashboard/projects");
    } catch (e: any) {
      console.error(isEdit ? "Update project failed:" : "Add project failed:", e);
      toast({
        status: "error",
        title: isEdit ? "فشل التعديل" : "فشل الإضافة",
        description: e?.message || "حدث خطأ غير متوقع",
      });
    }
  };

  if (isLoading) return <Spinner size="xl" />;

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
        <HStack justify="space-between" mb={4}>
          <Text fontSize="lg" fontWeight="700">
            {isEdit ? "تعديل مشروع" : "بيانات المشروع"}
          </Text>

          {/* زرّ اختياري للرجوع */}
          <Button variant="ghost" onClick={() => navigate(-1)}>
            رجوع
          </Button>
        </HStack>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 300px" }} gap={4}>
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
                isDisabled={subventionRows.length === 0}
              >
                {subventionRows.map((row: any) => (
                  <option key={row.Id} value={row.Id}>
                    {row.SubventionTypeName}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>

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
                  // لو راجع من السيرفر مش صفر نقفله (اختياري)
                  disabled={
                    isEdit &&
                    Number(
                      (incoming?.RemainingAmount ?? incoming?.ProjectRemainingAmount ?? 0)
                    ) !== 0
                  }
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

              <Checkbox
                isChecked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
              >
                نشط
              </Checkbox>
            </HStack>
          </GridItem>

          {/* عمود الصورة */}
          <GridItem>
            <FormLabel>صورة المشروع</FormLabel>
            <VStack align="start">
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
                  ) : currentPhotoId ? (
                    <Image
                      src={buildPhotoUrl(currentPhotoId, ".jpg")}
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

              {/* Debug label اختياري */}
              {(lastPhotoId || currentPhotoId) && (
                <Text fontSize="xs" color="gray.500">
                  Image ID: {lastPhotoId || currentPhotoId}
                  {lastPhotoName && ` | name: ${lastPhotoName}${lastPhotoExt}`}
                </Text>
              )}
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
            isLoading={addProject.isPending || updateProject.isPending}
          >
            {isEdit ? "حفظ التعديلات" : "إضافة"}
          </SharedButton>
          <SharedButton variant="dangerOutline" onClick={() => navigate(-1)}>
            إلغاء
          </SharedButton>
        </HStack>
      </Box>
    </Box>
  );
}
