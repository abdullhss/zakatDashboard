// src/features/Laws/AddLaw.tsx

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { 
    Box, Grid, GridItem, FormControl, FormLabel, Input, Textarea,
    VStack, HStack, Text, useToast, Spinner, Alert, AlertIcon, Flex, Icon, Link, Button
} from '@chakra-ui/react';
import { FiUploadCloud } from "react-icons/fi"; 
import SharedButton from "../../../Components/SharedButton/Button";
import { useNavigate, useLocation } from "react-router-dom"; 

import { useAddLaw } from "./hooks/useAddLaw"; 
import { useUpdateLaw } from "./hooks/useUpdateLaw"; 
import { HandelFile } from "../../../HandleFile";
import { getSession } from "../../../session"; 
import { useImagesPathContext } from "../../../Context/ImagesPathContext";

// تحديد شكل الحالة للقوانين
interface FormShape {
  id?: number | string;
  lawTitle: string;
  lawText: string; 
  lawDate: string; // YYYY-MM-DD
  lawAttachFileId?: string; // ✅ سنخزن ID الملف هنا
  currentFileName?: string; // ✅ اسم الملف للعرض
}


export default function AddLawForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { imagesPath } = useImagesPathContext();
  const lawRow = location?.state?.lawRow ?? null;
console.log(lawRow);

  const isEdit = !!lawRow; 
  
  const addLawMutation = useAddLaw(); 
  const updateLawMutation = useUpdateLaw(); 
  const hf = useMemo(() => new HandelFile(), []); 
  const currentMutation = isEdit ? updateLawMutation : addLawMutation;

  // === تهيئة النموذج بقيم الإدخال أو قيم القانون الحالي ===
  const [form, setForm] = useState<FormShape>({
    // نستخدم LawAttachFileId و LawAttachFileName التي تأتي من API
    id: lawRow?.Id, 
    lawTitle: lawRow?.LawTitle ?? "",
    lawText: lawRow?.LawText ?? "", 
    lawDate: lawRow?.LawDate ? new Date(lawRow.LawDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10), 
    lawAttachFileId: lawRow?.LawAttachFileId ?? "", // ✅ ID الملف المخزن في DB
    currentFileName: lawRow?.LawAttachFileName ?? "", // ✅ اسم الملف للعرض
  });

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);  

  const update = (k: keyof FormShape, v: any) => setForm(s => ({ ...s, [k]: v }));
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setAttachmentFile(e.target.files?.[0] || null);

const buildAttachmentUrlByName = (fileId?: string | number) => {
    if (!fileId || fileId === "0") return "";
    return `${imagesPath}/${fileId}.pdf`; 
  };

  
  const onSubmit = async () => {
    const title = form.lawTitle.trim();
    const text = form.lawText.trim();
    
    if (!title || !text || !form.lawDate) {
      toast({ title: "البيانات الأساسية ناقصة", description: "يرجى ملء العنوان والنص والتاريخ.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    
    const sessionId = getSession().userId || "TEMP_SESSION"; 

    try {
      // نستخدم ID الملف الموجود مسبقًا، أو نُنشئ جديدًا
      let lawAttachFileId = form.lawAttachFileId || ""; 

      // 1. رفع الملف الجديد إذا تم اختياره
      if (attachmentFile) {
        const result = await hf.UploadFileWebSite({ 
          file: attachmentFile, 
          SessionID: sessionId, 
          action: "Add" 
        });
        if (result.error && result.error.trim() && result.error !== "200") throw new Error(result.error);
        lawAttachFileId = result.id; // تحديث الـ ID
      }

      // تجهيز الحمولة النهائية (تشمل ID للتعديل)
      const payload = {
        id: form.id || 0, // ID للتعديل
        lawTitle: title,
        lawText: text, 
        lawDate: form.lawDate, 
        lawAttachFile: lawAttachFileId, // ✅ إرسال الـ ID المحدث
      };

      if (isEdit) {
        // ----- التعديل -----
        await updateLawMutation.mutateAsync(payload);
        toast({ status: "success", title: "تم التعديل", description: "تم تحديث القانون بنجاح." });
      } else {
        // ----- الإضافة -----
        await addLawMutation.mutateAsync(payload);
        toast({ status: "success", title: "تم الإضافة", description: "تم إضافة قانون جديد." });
      }

      navigate("/maindashboard/laws"); // العودة لصفحة القوانين
    } catch (e: any) {
      console.error(isEdit ? "Update failed:" : "Add failed:", e);
      toast({ status: "error", title: isEdit ? "فشل التعديل" : "فشل الإضافة", description: e?.message || "حدث خطأ غير متوقع" });
    }
  };


  if (currentMutation.isPending) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }

  return (
    <Box p={6}>
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
        <Text fontSize="lg" fontWeight="700" mb={4}>{isEdit ? "تعديل قانون/لائحة" : "إضافة قانون/لائحة"}</Text>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          
          <GridItem>
            <FormControl mb={4} isRequired>
              <FormLabel>عنوان القانون/اللائحة</FormLabel>
              <Input placeholder="مثال: لائحة الزكاة والصدقات" value={form.lawTitle} onChange={e => update("lawTitle", e.target.value)} />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>تاريخ الإصدار</FormLabel>
              <Input type="date" value={form.lawDate} onChange={e => update("lawDate", e.target.value)} />
            </FormControl>
          </GridItem>

          {/* رفع الملف المرفق */}
          <GridItem>
            <FormControl>
              <FormLabel>ملف مرفق (PDF/Doc)</FormLabel>
              <HStack spacing={3}>
                {/* زر اختيار الملف */}
                <Button onClick={() => fileInputRef.current?.click()} leftIcon={<Icon as={FiUploadCloud} />} size="sm">
                    اختر ملف
                </Button>
                <Text fontSize="sm" color="gray.600">
                    {attachmentFile?.name || form.lawAttachFileId || "لا يوجد ملف مُختار"}
                </Text>
                {/* حقل الإدخال المخفي */}
                <Input type="file" ref={fileInputRef} onChange={onFileChange} hidden />
              </HStack>
              {/* عرض رابط الملف الحالي */}
              {isEdit && form.lawAttachFileId && !attachmentFile &&  (
                  <Link href={buildAttachmentUrlByName(lawRow.LawAttachFileName)} isExternal fontSize="xs" color="blue.500" mt={1} display="block">
                    {`الملف الحالي (ID: ${form.lawAttachFileId})`}
                  </Link>
              )}
            </FormControl>
          </GridItem>
            
            {/* نص القانون */}
            <GridItem colSpan={2}>
                <FormControl mt={4} isRequired>
                    <FormLabel>نص القانون/اللائحة</FormLabel>
                    <Textarea
                        placeholder="برجاء كتابة نص القانون كاملاً"
                        rows={8}
                        value={form.lawText}
                        onChange={(e) => update("lawText", e.target.value)}
                    />
                </FormControl>
            </GridItem>
        </Grid>

        <HStack mt={6} spacing={4} justify="flex-start">
          <SharedButton
            variant="brandGradient"
            onClick={onSubmit}
            isLoading={currentMutation.isPending}
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