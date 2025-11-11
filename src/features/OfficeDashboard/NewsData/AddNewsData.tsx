import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Grid, GridItem, FormControl, FormLabel, Input, Select, Textarea,
  VStack, HStack, Text, useToast, Spinner, Alert, AlertIcon, AspectRatio, Image, Icon, Button, Flex,
} from "@chakra-ui/react";
import { MdImage, MdAttachFile } from "react-icons/md";
import SharedButton from "../../../Components/SharedButton/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAddNewsData } from "./hooks/useAddNewsData";
import { useGetTypesNewsData } from "./hooks/useGetTypesNewsData";
import { HandelFile } from "../../../HandleFile.js";
import { getSession } from "../../../session";
import { updateNewsData } from "./Services/updateNewsData";

// 🔗 مسار عرض الصور/الملفات
const ZAKAT_IMAGES_BASE = "https://framework.md-license.com:8093/ZakatImages";
const ZAKAT_FILES_BASE  = "https://framework.md-license.com:8093/ZakatFiles";

const buildPhotoUrlByName = (name?: string | number, ext?: string) => {
  if (!name) return "";
  const normalized = ext && ext.startsWith(".") ? ext : ".jpg";
  return `${ZAKAT_IMAGES_BASE}/${name}${normalized}`;
};

const buildAttachmentUrlByName = (name?: string | number, ext?: string) => {
  if (!name) return "";
  const normalized = (ext && ext.startsWith(".")) ? ext.toLowerCase() : "";
  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(normalized);
  const base = isImage ? ZAKAT_IMAGES_BASE : ZAKAT_FILES_BASE;
  const suffix = normalized || ".pdf";
  return `${base}/${name}${suffix}`;
};

type NewsFormState = {
  id?: number | string;
  newsMainTitle: string;
  newsSubTitle?: string;
  newsType: string;
  newsPublishDate: string; // yyyy-MM-dd
  newsContents: string;
  isActive: boolean;
  newsCreateDate: string;
  // للعرض أثناء التعديل
  currentPhotoId?: string;
  currentAttachId?: string;
};

export default function AddNewsForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;  // navigate('/.../add', { state: { row } }) في حالة التعديل
  const hf = useMemo(() => new HandelFile(), []);

  // هل تعديل؟
  const incoming = location?.state?.row ?? null;
  const isEdit = !!incoming;

  const [form, setForm] = useState<NewsFormState>({
    id: undefined,
    newsMainTitle: "",
    newsSubTitle: "",
    newsType: "",
    newsPublishDate: new Date().toISOString().slice(0, 10),
    newsContents: "",
    isActive: true,
    newsCreateDate: new Date().toISOString().slice(0, 10),
    currentPhotoId: "",
    currentAttachId: "",
  });

  // فايلات مختارة حديثًا (اختيارية)
  const [mainPhotoFile, setMainPhotoFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // للتسميات/الدِبَج
  const [lastMainPhotoId, setLastMainPhotoId] = useState<string>("");
  const [lastAttachId, setLastAttachId] = useState<string>("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const choosePhoto = () => photoInputRef.current?.click();
  const chooseAttach = () => attachInputRef.current?.click();

  const { data: typesData, isLoading: loadingTypes, isError: typesError, error: typesErr } =
    useGetTypesNewsData(0, 50);
  const newsTypeRows = typesData?.rows ?? [];

  const update = (k: keyof NewsFormState, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!incoming) return;
    console.log(incoming);
    
    setForm((s) => ({
      ...s,
      id: incoming.Id ?? incoming.NewsId ?? incoming.id,
      newsMainTitle: incoming.NewsMainTitle ?? incoming.MainTitle ?? "",
      newsSubTitle: incoming.NewsSubTitle ?? "",
      newsType: String(incoming.NewsType_Id ?? ""),
      newsPublishDate:
        (incoming.NewsPublishDate || "").toString().slice(0, 10) ||
        new Date().toISOString().slice(0, 10),
      newsContents: incoming.NewsContents ?? "",
      isActive: !!(incoming.IsActive ?? true),
      newsCreateDate:
        (incoming.NewsCreateDate || "").toString().slice(0, 10) ||
        new Date().toISOString().slice(0, 10),

      // مهم: نخزن الـ IDs للعرض
      currentPhotoId: String(incoming.NewsMainPhotoName_Id ) || "",
      currentAttachId: String(incoming.AttachmentFile_Id ?? "") || "",
    }));
  }, [incoming]);

  const addNews = useAddNewsData();

  const onSubmit = async () => {
    const title = form.newsMainTitle.trim();
    const typeId = form.newsType;
    const contents = form.newsContents.trim();

    // ✅ فاليديشن أساسي
    if (!title || !typeId || !contents) {
      toast({
        title: "البيانات الأساسية ناقصة",
        description: "الرجاء ملء العنوان الرئيسي، نوع الخبر، والمحتوى.",
        status: "warning",
      });
      return;
    }

    // ✅ فاليديشن إلزام الصورة:
    const hasPhoto = isEdit ? (Boolean(mainPhotoFile) || Boolean(form.currentPhotoId)) : Boolean(mainPhotoFile);
    if (!hasPhoto) {
      toast({
        title: "الصورة مطلوبة",
        description: isEdit
          ? "لا يمكن حفظ الخبر بدون صورة. اترك الصورة الحالية أو اختر صورة جديدة."
          : "لا يمكن إضافة خبر بدون صورة. برجاء اختيار صورة.",
        status: "warning",
      });
      return;
    }

    // نجيب SessionID لرفع الملفات
    const session = getSession();
    const sessionId =
      (session as any)?.SessionID ||
      (session as any)?.sessionId ||
      (session as any)?.token ||
      "";

    try {
      // IDs النهائية المرسلة
      let photoId = form.currentPhotoId || "";  // هنا نتأكد من حفظ الـ ID القديم إن كان موجودًا
      let attachId = form.currentAttachId || "";
      console.log(form);
      
      // 1) ارفع الصورة لو تم اختيارها
      if (mainPhotoFile) {
        const up = await hf.UploadFileWebSite({
          action: "Add",          // ثابتة زي المشاريع
          file: mainPhotoFile,
          fileId: "",
          SessionID: sessionId,
          onProgress: (p: number) => console.log(`Main photo progress: ${p}%`),
        });
        if (!up?.id || up.id === "0") throw new Error(up?.error || "فشل رفع الصورة");
        
        photoId = String(up.id);  // نُحفظ الـ id المستلم
        setLastMainPhotoId(photoId);  // نحدّث الـ ID هنا
      }

      // 2) ارفع المرفق لو تم اختياره
      if (attachmentFile) {
        const up2 = await hf.UploadFileWebSite({
          action: "Add",
          file: attachmentFile,
          fileId: "",
          SessionID: sessionId,
          onProgress: (p: number) => console.log(`Attachment progress: ${p}%`),
        });
        if (!up2?.id || up2.id === "0") throw new Error(up2?.error || "فشل رفع المرفق");
        console.log(up2);
        
        attachId = String(up2.id);
        setLastAttachId(attachId);
      }

        console.log(photoId);
        console.log(attachId);
        console.log(currentPhotoUrl);
        console.log(currentAttachUrl);
      if (!isEdit) {
        // ===== إضافة =====
        
        
        await addNews.mutateAsync({
          newsMainTitle: title,
          newsSubTitle: form.newsSubTitle?.trim() || "",
          newsContents: contents,
          newsMainPhotoName: photoId,   // ← ID (مطلوب حسب الفاليديشن)
          attachmentFile: attachId,     // ← ID (اختياري)
          newsTypeId: Number(typeId),
          newsPublishDate: form.newsPublishDate,
          isActive: form.isActive,
        } as any);

        toast({
          status: "success",
          title: "تم إضافة الخبر",
          description: `Photo#${photoId || "-"}  |  Attach#${attachId || "-"}`,
        });
        navigate(-1)
      } else {
        // ===== تعديل =====
        const res = await updateNewsData({
          id: form.id!,
          newsMainTitle: title,
          newsSubTitle: form.newsSubTitle?.trim() || "",
          newsContents: contents,
          newsMainPhotoName: photoId,  // ← ID (مطلوب وجوده)
          attachmentFile: attachId,    // ← ID (اختياري)
          newsTypeId: Number(typeId),
          newsCreateDate: form.newsCreateDate,
          newsPublishDate: form.newsPublishDate,
          isActive: form.isActive,
          pointId: 0,
        });

        if ((res as any)?.flags?.FAILURE || (res as any)?.success === false) {
          throw new Error((res as any)?.message || (res as any)?.error || "فشل التعديل");
        }

        toast({
          status: "success",
          title: "تم تعديل الخبر بنجاح",
          description: `Photo#${photoId || "-"}  |  Attach#${attachId || "-"}`,
        });
        navigate(-1)
      }

      // navigate("/officedashboard/newsdata");
    } catch (e: any) {
      console.error("News submit failed:", e);
      toast({ status: "error", title: "فشل العملية", description: e?.message || "خطأ غير متوقع" });
    }
  };

  if (loadingTypes) {
    return (
      <Flex justify="center" p={10}><Spinner size="xl" /></Flex>
    );
  }

  if (typesError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب أنواع الأخبار: {(typesErr as Error)?.message}
      </Alert>
    );
  }

  // عرض الصورة/المرفق الحالية لو موجودة
  const currentPhotoUrl = form.currentPhotoId ? buildPhotoUrlByName(form.currentPhotoId) : "";
  const currentAttachUrl = form.currentAttachId ? buildAttachmentUrlByName(form.currentAttachId) : "";

  return (
    <Box p={6}>
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="700">
            {isEdit ? "تعديل خبر" : "إضافة خبر"}
          </Text>
          {/* <Button variant="ghost" onClick={() => navigate(-1)}>رجوع</Button> */}
        </HStack>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 300px" }} gap={4}>
          <GridItem>
            <FormControl mb={4} isRequired>
              <FormLabel>عنوان الخبر الرئيسي</FormLabel>
              <Input
                placeholder="برجاء كتابة عنوان الخبر الرئيسي"
                value={form.newsMainTitle}
                onChange={e => update("newsMainTitle", e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>العنوان الفرعي (اختياري)</FormLabel>
              <Input
                placeholder="العنوان الفرعي"
                value={form.newsSubTitle}
                onChange={e => update("newsSubTitle", e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>تاريخ النشر</FormLabel>
              <Input
                type="date"
                value={form.newsPublishDate}
                onChange={e => update("newsPublishDate", e.target.value)}
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl mb={4} isRequired>
              <FormLabel>نوع الخبر</FormLabel>
              <Select
                mx={-3} px={3}
                placeholder="اختر نوع الخبر"
                value={form.newsType}
                onChange={e => update("newsType", e.target.value)}
                isDisabled={newsTypeRows.length === 0}
              >
                {newsTypeRows.map((row: any) => (
                  <option key={row.Id} value={row.Id}>
                    {row.NewsTypeName}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>نص الخبر</FormLabel>
              <Textarea
                placeholder="برجاء كتابة نص الخبر"
                rows={5}
                value={form.newsContents}
                onChange={(e) => update("newsContents", e.target.value)}
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormLabel>الصورة الرئيسية <Text as="span" color="red.500">*</Text></FormLabel>
            <VStack align="start" mb={4}>
              <AspectRatio
                ratio={4/3}
                w="full"
                borderWidth="1px"
                borderRadius="md"
                bg="gray.50"
                cursor="pointer"
                onClick={choosePhoto}
              >
                <Box>
                  {mainPhotoFile ? (
                    <Image src={URL.createObjectURL(mainPhotoFile)} alt="news" objectFit="cover" w="100%" h="100%" />
                  ) : form.currentPhotoId ? (
                    <Image src={currentPhotoUrl} alt="news" objectFit="cover" w="100%" h="100%" />
                  ) : (
                    <VStack w="100%" h="100%" align="center" justify="center" spacing={2}>
                      <Icon as={MdImage} boxSize={10} color="gray.400" />
                      <Text color="gray.500">اختر صورة للخبر</Text>
                    </VStack>
                  )}
                </Box>
              </AspectRatio>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setMainPhotoFile(e.target.files?.[0] || null)}
              />
            </VStack>

            <FormLabel>ملف مرفق (اختياري)</FormLabel>
            <VStack align="start">
              <HStack>
                <Button onClick={chooseAttach} leftIcon={<MdAttachFile />}>اختيار ملف</Button>
                <Text>{attachmentFile?.name || "لم يتم اختيار ملف"}</Text>
              </HStack>
              <input
                ref={attachInputRef}
                type="file"
                hidden
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
              />
            </VStack>
          </GridItem>
        </Grid>

        {/* <FormControl mt={4}>
          <FormLabel>نص الخبر الكامل</FormLabel>
          <Textarea
            placeholder="النص"
            rows={6}
            value={form.newsContents}
            onChange={(e) => update("newsContents", e.target.value)}
          />
        </FormControl> */}

        <HStack mt={6} spacing={4}>
          <SharedButton variant="brandGradient" onClick={onSubmit}>
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
