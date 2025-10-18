// src/features/MainDepartment/Offices/OfficeDetailsSection.tsx
import {
  Box, Grid, GridItem, VStack, HStack, FormControl, FormLabel, FormErrorMessage,
  Input, Select, Switch, Text, Divider, chakra, useToast, Spinner,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useMemo, forwardRef, useImperativeHandle, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SectionCard from "./SectionCard";
import { useCitiesQuery } from "../Cities/hooks/useCities";
import UploadField from "../../../Components/UploadFiles/uploadFile";
import MapPicker, { type LatLng as MapLatLng } from "../../../Components/Map/MapPicker";

const FieldInput = chakra(Input, { baseStyle: { h: "50px", rounded: "lg", w: "100%" } });
const FieldSelect = chakra(Select, {
  baseStyle: {
    h: "50px", rounded: "lg", w: "100%", pe: "10",
    sx: { ".chakra-select__icon": { insetInlineEnd: "3", top: "50%", transform: "translateY(-50%)" } },
  },
});
const MapPlaceholder = chakra(Box, {
  baseStyle: {
    rounded: "lg", borderWidth: "1px", borderStyle: "dashed",
    borderColor: "background.border", bg: "white",
    h: { base: "260px", md: "320px" }, overflow: "hidden",
  },
});

/** API schema: Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName */
const OfficeSchema = z.object({
  officeName: z.string().min(1, "اسم المكتب مطلوب"),
  phoneNum: z.string().min(3, "رقم غير صالح"),
  cityId: z.string().min(1, "اختر المدينة"),
  address: z.string().min(1, "العنوان مطلوب"),
  officeLatitude: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Latitude يجب أن يكون رقمًا").default(""),
  officeLongitude: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Longitude يجب أن يكون رقمًا").default(""),
  isActive: z.boolean().default(true),
  officePhotoName: z.string().optional().default(""),
});

export type OfficeDetailsValues = z.infer<typeof OfficeSchema>;
export type OfficeDetailsHandle = { submit: () => Promise<OfficeDetailsValues | null> };
type Props = { defaultValues?: Partial<OfficeDetailsValues> & { cityId?: string | number } };

export default forwardRef<OfficeDetailsHandle, Props>(function OfficeDetailsSection({ defaultValues }, ref) {
  const toast = useToast();
  const {
    register, formState: { errors }, trigger, getValues, setValue, watch, reset,
  } = useForm<OfficeDetailsValues>({
    resolver: zodResolver(OfficeSchema),
    defaultValues: {
      officeName: "", phoneNum: "", cityId: "", address: "",
      officeLatitude: "", officeLongitude: "", isActive: true,
      officePhotoName: "", ...defaultValues,
    },
    mode: "onBlur",
  });

  // إعادة تهيئة نموذج التعديل
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset((prev) => ({ ...prev, ...defaultValues }));
    }
  }, [defaultValues, reset]);

  useImperativeHandle(ref, () => ({
    submit: async () => (await trigger() ? (getValues() as OfficeDetailsValues) : null),
  }));

  // المدن
  const { data: citiesData, isLoading: citiesLoading, isError: citiesError, error: citiesErr } = useCitiesQuery(0, 200);
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

  // تثبيت قيمة المدينة في الـSelect عند التعديل
  useEffect(() => {
    if (cityOptions.length > 0 && defaultValues?.cityId) {
      const currentValue = getValues("cityId");
      if (currentValue !== String(defaultValues.cityId)) {
        setValue("cityId", String(defaultValues.cityId), { shouldDirty: false });
      }
    }
    if (citiesError && citiesErr) {
      toast({ title: "خطأ في تحميل المدن", description: citiesErr instanceof Error ? citiesErr.message : "", status: "error" });
    }
  }, [cityOptions, defaultValues, setValue, citiesError, citiesErr, toast, getValues]);

  // اسم المدينة الحالية (قراءة فقط)
  const cityIdCurrent = watch("cityId");
  const selectedCityLabel = useMemo(() => {
    const match = cityOptions.find(o => o.id === String(cityIdCurrent));
    if (match) return match.name;
    if (defaultValues?.cityId && !/^\d+$/.test(String(defaultValues.cityId))) {
      return String(defaultValues.cityId); // fallback لو جالك اسم بدل ID
    }
    return "";
  }, [cityOptions, cityIdCurrent, defaultValues?.cityId]);

  // إحداثيات + تزامن مع MapPicker
  const latStr = watch("officeLatitude");
  const lngStr = watch("officeLongitude");

  // موضع الخريطة الداخلي (رقمي)
  const [mapPos, setMapPos] = useState<MapLatLng>(() => {
    const lat = Number(defaultValues?.officeLatitude);
    const lng = Number(defaultValues?.officeLongitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && defaultValues?.officeLatitude && defaultValues?.officeLongitude) {
      return { lat, lng };
    }
    // fallback: موقع الجهاز أو (طرابلس) سيتم تحديثه لاحقًا
    return { lat: 32.885353, lng: 13.180161 };
  });

  // أول ما نلاقي الحقول فاضية، جرّب نجيب موقع الجهاز مرّة واحدة
  useEffect(() => {
    const noLat = !latStr || Number.isNaN(Number(latStr));
    const noLng = !lngStr || Number.isNaN(Number(lngStr));
    if (noLat || noLng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setMapPos(next);
            setValue("officeLatitude", String(next.lat.toFixed(6)), { shouldDirty: true });
            setValue("officeLongitude", String(next.lng.toFixed(6)), { shouldDirty: true });
          },
          () => {}
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // لو المستخدم عدّل الحقول يدويًا، حدّث الخريطة
  useEffect(() => {
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && latStr !== "" && lngStr !== "") {
      setMapPos({ lat, lng });
    }
  }, [latStr, lngStr]);

  const SESSION_ID = "SESSION-PLACEHOLDER-123";

  return (
    <VStack align="stretch" spacing={5}>
      <SectionCard title="بيانات المكتب">
        <Grid templateColumns={{ base: "repeat(12, 1fr)", lg: "repeat(12, 1fr)" }} gap={4}>
          {/* صف 1: اسم المكتب + الهاتف + المدينة */}
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
              <FieldInput dir="rtl" placeholder="برجاء كتابة رقم الهاتف" {...register("phoneNum")} />
              <FormErrorMessage>{errors.phoneNum?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <FormControl isInvalid={!!errors.cityId}>
              <FormLabel>المدينة</FormLabel>

              <FieldSelect
                placeholder={citiesLoading ? "جارِ تحميل المدن…" : "برجاء اختيار المدينة"}
                icon={<ChevronDownIcon />} iconColor="gray.500" iconSize="20px"
                disabled={citiesLoading || citiesError} {...register("cityId")}
              >
                {citiesError && <option value="" disabled>
                  {citiesErr instanceof Error ? citiesErr.message : "تعذر جلب المدن"}
                </option>}
                {!citiesLoading && !citiesError && cityOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FieldSelect>

              {/* اسم المدينة الحالية (قراءة فقط) */}
              {selectedCityLabel && (
                <Text mt={2} fontSize="sm" color="gray.600">
                  المدينة الحالية: <Text as="span" fontWeight="600">{selectedCityLabel}</Text>
                </Text>
              )}

              <FormErrorMessage>{errors.cityId?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* صف 2: Latitude + Longitude */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl isInvalid={!!errors.officeLatitude}>
              <FormLabel>Latitude (دوّنًا)</FormLabel>
              <FieldInput placeholder="مثال: 30.0444" inputMode="decimal" {...register("officeLatitude")} />
              <FormErrorMessage>{errors.officeLatitude?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl isInvalid={!!errors.officeLongitude}>
              <FormLabel>Longitude (خط طول)</FormLabel>
              <FieldInput placeholder="مثال: 31.2357" inputMode="decimal" {...register("officeLongitude")} />
              <FormErrorMessage>{errors.officeLongitude?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* صف 3: العنوان + الخريطة (نفس الستايل) */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <FormControl isInvalid={!!errors.address}>
              <FormLabel>العنوان</FormLabel>
              <FieldInput placeholder="برجاء كتابة العنوان" {...register("address")} />
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <FormControl>
              <FormLabel>حدد موقعك على الخريطة</FormLabel>
              <MapPlaceholder>
                {/* بنستخدم MapPicker بنفس مكان وديزاين الخريطة القديمة */}
                <MapPicker
                  value={mapPos}
                  onChange={(next) => {
                    setMapPos(next);
                    setValue("officeLatitude", String(next.lat.toFixed(6)), { shouldDirty: true });
                    setValue("officeLongitude", String(next.lng.toFixed(6)), { shouldDirty: true });
                  }}
                  height={320}   // بيشتغل داخل MapPlaceholder اللي محدد الارتفاع برضه
                  zoom={13}
                />
              </MapPlaceholder>
            </FormControl>
          </GridItem>

          {/* صف 4: تفعيل + رفع الصورة */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <HStack spacing={4} h="50px" alignItems="center">
              <Text>تفعيل ظهوره في التطبيق</Text>
              <Switch {...register("isActive")} isChecked={watch("isActive")} />
            </HStack>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl>
              <FormLabel>صورة المكتب</FormLabel>
              <UploadField
                sessionId={"SESSION-PLACEHOLDER-123"}
                onUploaded={(fileId) => setValue("officePhotoName", fileId, { shouldDirty: true })}
                onDeleted={() => setValue("officePhotoName", "", { shouldDirty: true })}
              />
            </FormControl>
          </GridItem>
        </Grid>

        <Divider my={4} />
      </SectionCard>
    </VStack>
  );
});
