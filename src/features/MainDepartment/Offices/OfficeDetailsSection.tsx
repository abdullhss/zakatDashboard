import {
  Box, Grid, GridItem, VStack, HStack, FormControl, FormLabel, FormErrorMessage,
  Input, Select, Switch, Text, Divider, chakra, useToast, Image,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useMemo, forwardRef, useImperativeHandle, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SectionCard from "./SectionCard";
import { useCitiesQuery } from "../Cities/hooks/useCities";
import MapPicker, { type LatLng as MapLatLng } from "../../../Components/Map/MapPicker";
import { HandelFile } from "../../../HandleFile.js";

const ZAKAT_IMAGES_BASE = "https://framework.md-license.com:8093/ZakatImages";
const buildPhotoUrl = (id?: string | number, ext = ".jpg") =>
  id && id !== "0" && id !== "undefined" ? `${ZAKAT_IMAGES_BASE}/${id}${ext}` : "";

const FieldInput = chakra(Input, { baseStyle: { h: "50px", rounded: "lg", w: "100%" } });
const FieldSelect = chakra(Select, {
  baseStyle: {
    h: "50px",
    rounded: "lg",
    w: "100%",
    pe: "10",
    sx: { ".chakra-select__icon": { insetInlineEnd: "3", top: "50%", transform: "translateY(-50%)" } },
  },
});
const MapPlaceholder = chakra(Box, {
  baseStyle: {
    rounded: "lg",
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: "background.border",
    bg: "white",
    h: { base: "260px", md: "320px" },
    overflow: "hidden",
  },
});

// 👈 التعبير القياسي للرقم الليبي (091/092/094 وتكون 10 أرقام)
const LIBYAN_PHONE_REGEX = /^(091|092|094)\d{7}$/;

const OfficeSchema = z.object({
  officeName: z.string().min(1, "اسم المكتب مطلوب"),
  phoneNum: z.string()
    .trim()
    .regex(LIBYAN_PHONE_REGEX, "يجب أن يكون مكون من 10 أرقام ويبدا ب 09"), // 👈 التعديل
  cityId: z.string().min(1, "اختر المدينة"),
  address: z.string().min(1, "العنوان مطلوب"),
  officeLatitude: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Latitude يجب أن يكون رقمًا").default(""),
  officeLongitude: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Longitude يجب أن يكون رقمًا").default(""),
  isActive: z.boolean().default(true),
  // دايمًا هنخزن الـID
  officePhotoName: z.string().optional().default(""),
});

export type OfficeDetailsValues = z.infer<typeof OfficeSchema>;
export type OfficeDetailsHandle = { submit: () => Promise<OfficeDetailsValues | null> };

// 👇 أضفنا الـ prop اللي هتبلغ الأب بأي ID للصورة
type Props = {
  defaultValues?: Partial<OfficeDetailsValues> & { cityId?: string | number; officePhotoDisplayName?: string };
  onPhotoIdChange?: (id: string) => void;
  onExtraPhotoIdChange ?: any 
};

function getSessionId(): string {
  try {
    const keys = ["mainUser", "MainUser", "auth", "login", "session", "Session"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const sid = obj?.SessionID ?? obj?.sessionId ?? obj?.session ?? obj?.sid;
      if (sid) return String(sid);
    }
  } catch { }
  return "0";
}

export default forwardRef<OfficeDetailsHandle, Props>(function OfficeDetailsSection(
  { defaultValues, onPhotoIdChange , onExtraPhotoIdChange },
  ref
) {
  const toast = useToast();
  const {
    register, formState: { errors }, trigger, getValues, setValue, watch, reset,
  } = useForm<OfficeDetailsValues>({
    resolver: zodResolver(OfficeSchema),
    defaultValues: {
      officeName: "", phoneNum: "", cityId: "", address: "",
      officeLatitude: "", officeLongitude: "", isActive: true, officePhotoName: "",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extraPhotoId, setExtraPhotoId] = useState("");
  const [headerPreviewUrl, setHeaderPreviewUrl] = useState<string>("");

  useEffect(() => {
  if (defaultValues?.officeHeaderPhotoNamePreview) {
    setHeaderPreviewUrl("https://framework.md-license.com:8093/ZakatImages/" + defaultValues.officeHeaderPhotoNamePreview + ".jpg");
  }
}, [defaultValues?.officeHeaderPhotoNamePreview]);
console.log(headerPreviewUrl);

  const handleExtraPhotoUpload = async (file: File) => {
    try {
      // 👈 اعرض المعاينة مباشرة قبل الرفع
      const localPreview = URL.createObjectURL(file);
      setHeaderPreviewUrl(localPreview);

      setUploading(true);
      setProgress(0);

      const hf = new HandelFile();
      const up = await hf.UploadFileWebSite({
        action: "Add",
        file,
        fileId: "",
        SessionID: getSessionId(),
        onProgress: (p: number) => setProgress(p),
      });

      if (up?.error) throw new Error(String(up.error));

      const newId = String(up.id ?? "");

      setExtraPhotoId(newId);

      toast({ title: "تم رفع صورة الخلفية بنجاح", status: "success" });

      if (onExtraPhotoIdChange) onExtraPhotoIdChange(newId);

    } catch (err: any) {
      toast({
        title: "فشل رفع صورة الخلفية",
        description: err?.message || "Upload failed",
        status: "error",
      });
      setHeaderPreviewUrl(""); // امسح لو فشل
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // في وضع التعديل: نحط الـID في الحقل المخفي ونبني المعاينة
  useEffect(() => {
    const displayNameOrId = String(
      (defaultValues as any)?.officePhotoDisplayName ??
      defaultValues?.officePhotoName ??
      ""
    );
    const fileId = String(defaultValues?.officePhotoName ?? "");

    setValue("officePhotoName", fileId, { shouldDirty: false, shouldValidate: false });
    setPreviewUrl(buildPhotoUrl(displayNameOrId));
    // 👇 بلغ الأب بالـID الحالي (مهم جدًا عشان fallback في وضع التعديل)
    if (fileId && onPhotoIdChange) onPhotoIdChange(fileId);
  }, [defaultValues?.officePhotoName, (defaultValues as any)?.officePhotoDisplayName, setValue, onPhotoIdChange]);

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      const { officePhotoName, ...rest } = defaultValues;
      reset((prev) => ({ ...prev, ...rest })); // متعملش reset للصورة
    }
  }, [defaultValues, reset]);

  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ عرض الصورة فورًا قبل الرفع
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      setUploading(true);
      setProgress(0);

      const hf = new HandelFile();
      const up = await hf.UploadFileWebSite({
        action: "Add",
        file,
        fileId: "",
        SessionID: getSessionId(),
        onProgress: (p: number) => setProgress(p),
      });

      if (up?.error) throw new Error(String(up.error));

      const newId = String(up.id ?? "");

      setValue("officePhotoName", newId, { shouldDirty: true, shouldValidate: true });

      // ✅ بعد الرفع نبدل الصورة بـ URL الحقيقي من السيرفر
      // setPreviewUrl(buildPhotoUrl(newId));

      await trigger("officePhotoName");

      if (onPhotoIdChange) onPhotoIdChange(newId);

      toast({ title: "تم رفع الصورة بنجاح.", status: "success" });
    } catch (err: any) {
      toast({
        title: "فشل رفع الصورة",
        description: err?.message || "Upload failed",
        status: "error",
      });
      // ⚠️ لو فشل الرفع، نحذف المعاينة المؤقتة
      setPreviewUrl("");
    } finally {
      setUploading(false);
      setProgress(0);
      (e.target as HTMLInputElement).value = "";
    }
  };


  useImperativeHandle(ref, () => ({
    submit: async () => ((await trigger()) ? ({...getValues() , extraPhotoId }) : null),
  }));
  
  const [mapPos, setMapPos] = useState<MapLatLng>(() => {
    const lat = Number(defaultValues?.officeLatitude);
    const lng = Number(defaultValues?.officeLongitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && defaultValues?.officeLatitude && defaultValues?.officeLongitude) {
      return { lat, lng };
    }
    return { lat: 32.885353, lng: 13.180161 };
  });

  useEffect(() => {
    const lat = Number(watch("officeLatitude"));
    const lng = Number(watch("officeLongitude"));
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat && lng) {
      setMapPos({ lat, lng });
    }
  }, [watch("officeLatitude"), watch("officeLongitude")]);

  const { data: citiesData, isLoading: citiesLoading, isError: citiesError, error: citiesErr } =
    useCitiesQuery(0, 200);

  const cityOptions = useMemo(() => {
    const rows = citiesData?.rows ?? [];
    return rows
      .map((r: any) => {
        const id = r.Id ?? r.CityId ?? r.id ?? r.cityId ?? r.Code ?? r.code;
        const name = r.CityName ?? r.Name ?? r.City ?? r.name ?? r.city ?? r.Title ?? r.title;
        if (id == null || name == null) return null;
        return { id: String(id), name: String(name) };
      })
      .filter(Boolean) as { id: string; name: string }[];
  }, [citiesData]);

  useEffect(() => {
    if (cityOptions.length > 0 && defaultValues?.cityId) {
      const current = getValues("cityId");
      if (current !== String(defaultValues.cityId)) {
        setValue("cityId", String(defaultValues.cityId), { shouldDirty: false });
      }
    }
    if (citiesError && citiesErr) {
      toast({
        title: "خطأ في تحميل المدن",
        description: citiesErr instanceof Error ? citiesErr.message : "",
        status: "error",
      });
    }
  }, [cityOptions, defaultValues, setValue, citiesError, citiesErr, toast, getValues]);

  const cityIdCurrent = watch("cityId");
  const selectedCityLabel = useMemo(() => {
    const match = cityOptions.find((o) => o.id === String(cityIdCurrent));
    if (match) return match.name;
    if (defaultValues?.cityId && !/^\d+$/.test(String(defaultValues?.cityId))) {
      return String(defaultValues?.cityId);
    }
    return "";
  }, [cityOptions, cityIdCurrent, defaultValues?.cityId]);

  console.log(defaultValues);
  
  return (
    <VStack align="stretch" spacing={5}>
      <SectionCard title="بيانات المكتب">
        <Grid templateColumns={{ base: "repeat(12, 1fr)", lg: "repeat(12, 1fr)" }} gap={4}>
          {/* اسم/هاتف/مدينة */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <FormControl isInvalid={!!errors.officeName}>
              <FormLabel>اسم المكتب</FormLabel>
              <FieldInput placeholder="برجاء كتابة اسم المكتب" {...register("officeName")} />
              <FormErrorMessage>{errors.officeName?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <FormControl isInvalid={!!errors.phoneNum}>
              <FormLabel>رقم الهاتف</FormLabel>
              <FieldInput dir="rtl" placeholder="برجاء كتابة رقم الهاتف (09X)" {...register("phoneNum")} />
              <FormErrorMessage>{errors.phoneNum?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <FormControl isInvalid={!!errors.cityId}>
              <FormLabel>المدينة</FormLabel>
              <FieldSelect
                px={10}
                placeholder={citiesLoading ? "جارِ تحميل المدن…" : "برجاء اختيار المدينة"}
                icon={<ChevronDownIcon />} iconColor="gray.500" iconSize="20px"
                disabled={citiesLoading || citiesError}
                {...register("cityId")}
              >
                {citiesError && (
                  <option value="" disabled>
                    {citiesErr instanceof Error ? citiesErr.message : "تعذر جلب المدن"}
                  </option>
                )}
                {!citiesLoading && !citiesError &&
                  cityOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                }
              </FieldSelect>
              <FormErrorMessage>{errors.cityId?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* الإحداثيات */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl isInvalid={!!errors.officeLatitude}>
              <FormLabel>Latitude</FormLabel>
              <FieldInput placeholder="مثال: 30.0444" inputMode="decimal" {...register("officeLatitude")} />
              <FormErrorMessage>{errors.officeLatitude?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl isInvalid={!!errors.officeLongitude}>
              <FormLabel>Longitude</FormLabel>
              <FieldInput placeholder="مثال: 31.2357" inputMode="decimal" {...register("officeLongitude")} />
              <FormErrorMessage>{errors.officeLongitude?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* العنوان + الخريطة */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <FormControl isInvalid={!!errors.address}>
              <FormLabel>العنوان</FormLabel>
              <FieldInput placeholder="برجاء كتابة العنوان" {...register("address")} />
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>
            <HStack justify="flex-start" mb={3}>
              <HStack spacing={4} h="40px" alignItems="center">
                <Switch {...register("isActive")} isChecked={watch("isActive")} />
                <Text>تفعيل ظهوره في التطبيق</Text>
              </HStack>
            </HStack>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <FormControl>
              <FormLabel>حدد موقعك على الخريطة</FormLabel>
              <MapPlaceholder>
                <MapPicker
                  value={mapPos}
                  onChange={(next) => {
                    setMapPos(next);
                    setValue("officeLatitude", String(next.lat.toFixed(6)), { shouldDirty: true });
                    setValue("officeLongitude", String(next.lng.toFixed(6)), { shouldDirty: true });
                  }}
                  height={320}
                  zoom={13}
                />
              </MapPlaceholder>
            </FormControl>
          </GridItem>

          {/* صورة المكتب */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <FormControl>
              <FormLabel>صورة المكتب</FormLabel>

              {previewUrl ? (
                <Box mb={3}>
                  <Image
                    src={previewUrl}
                    alt="صورة المكتب"
                    maxH="140px"
                    rounded="md"
                    border="1px solid #e2e8f0"
                    objectFit="cover"
                  />
                </Box>
              ) : watch("officePhotoName") ? (
                <Text mb={3} fontSize="sm" color="gray.600">
                  الملف الحالي (ID): <Text as="span" fontWeight="600">{watch("officePhotoName")}</Text>
                </Text>
              ) : (
                <Text mb={2} fontSize="sm" color="gray.500">لم يتم اختيار صورة.</Text>
              )}

              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                onClick={(e) => ((e.target as HTMLInputElement).value = "")}
                sx={{ h: "auto", py: 2 }}
              />

              <input   style={{ display: "none" }} {...register("officePhotoName")} />

              {uploading && (
                <Text mt={2} fontSize="sm" color="gray.600">
                  جاري الرفع… {progress}%
                </Text>
              )}
            </FormControl>

            <FormControl mt={6}>
              <FormLabel>صورة الخلفية</FormLabel>
              {headerPreviewUrl ? (
                <Box mb={3}>
                  <Image
                    src={headerPreviewUrl}
                    alt="صورة الخلفية"
                    maxH="140px"
                    rounded="md"
                    border="1px solid #e2e8f0"
                    objectFit="cover"
                  />
                </Box>
              ) : (
                <Text mb={2} fontSize="sm" color="gray.500">
                  لم يتم اختيار صورة.
                </Text>
              )}
              {extraPhotoId && (
                <Text mt={2} fontSize="sm" color="green.600">
                  تم رفع صورة الخلفية (ID): {extraPhotoId}
                </Text>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleExtraPhotoUpload(file); // هنضيفها حالًا
                  }
                }}
              />
            </FormControl>

          </GridItem>
        </Grid>

        <Divider my={4} />
      </SectionCard>
    </VStack>
  );
});