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
type Props = { defaultValues?: Partial<OfficeDetailsValues> };

type LatLng = { lat: number; lng: number };

function useDynamicLeaflet() {
  const [loaded, setLoaded] = useState(false);
  const [components, setComponents] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const RL = await import("react-leaflet");
        if (mounted) { setComponents(RL); setLoaded(true); }
      } catch { if (mounted) setLoaded(false); }
    })();
    return () => { mounted = false; };
  }, []);
  return { loaded, components };
}

const OfficeDetailsSection = forwardRef<OfficeDetailsHandle, Props>(({ defaultValues }, ref) => {
  const toast = useToast();
  const {
    register, formState: { errors }, trigger, getValues, setValue, watch,
  } = useForm<OfficeDetailsValues>({
    resolver: zodResolver(OfficeSchema),
    defaultValues: {
      officeName: "", phoneNum: "", cityId: "", address: "",
      officeLatitude: "", officeLongitude: "", isActive: true,
      officePhotoName: "", ...defaultValues,
    },
    mode: "onBlur",
  });

  useImperativeHandle(ref, () => ({
    submit: async () => (await trigger() ? (getValues() as OfficeDetailsValues) : null),
  }));

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

  const isActive = watch("isActive");
  const latStr = watch("officeLatitude");
  const lngStr = watch("officeLongitude");

  const { loaded, components } = useDynamicLeaflet();
  const [center, setCenter] = useState<LatLng | null>(null);

  useEffect(() => {
    const lat = Number(latStr), lng = Number(lngStr);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && latStr !== "" && lngStr !== "") {
      setCenter({ lat, lng }); return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        ()   => setCenter({ lat: 24.7136, lng: 46.6753 })
      );
    } else { setCenter({ lat: 24.7136, lng: 46.6753 }); }
  }, []);

  const handleMapClick = (e: any) => {
    try {
      const { lat, lng } = e.latlng;
      setValue("officeLatitude", String(lat.toFixed(6)), { shouldDirty: true });
      setValue("officeLongitude", String(lng.toFixed(6)), { shouldDirty: true });
      toast({ title: `تم تحديد: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, status: "info", duration: 1500 });
    } catch {}
  };

  // TODO: بدّل الـ SessionID ده من السياق/الستيت الحقيقي عندك
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
              <FormErrorMessage>{errors.cityId?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* صف 2: Latitude + Longitude */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl isInvalid={!!errors.officeLatitude}>
              <FormLabel>Latitude (دوّنًا)</FormLabel>
              <FieldInput placeholder="مثال: 24.7136" inputMode="decimal" {...register("officeLatitude")} />
              <FormErrorMessage>{errors.officeLatitude?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl isInvalid={!!errors.officeLongitude}>
              <FormLabel>Longitude (خط طول)</FormLabel>
              <FieldInput placeholder="مثال: 46.6753" inputMode="decimal" {...register("officeLongitude")} />
              <FormErrorMessage>{errors.officeLongitude?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* صف 3: العنوان + الخريطة */}
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
                {!loaded ? (
                  <Box h="full" display="flex" alignItems="center" justifyContent="center" gap={3}>
                    <Spinner />
                    <Text color="gray.500">سيتم عرض الخريطة لو react-leaflet مثبتة</Text>
                  </Box>
                ) : !center ? (
                  <Box h="full" display="flex" alignItems="center" justifyContent="center">
                    <Spinner />
                  </Box>
                ) : (
                  <DynamicLeafletMap
                    components={components}
                    center={center}
                    value={{
                      lat: Number(latStr) || center.lat,
                      lng: Number(lngStr) || center.lng,
                    }}
                    onClick={handleMapClick}
                  />
                )}
              </MapPlaceholder>
            </FormControl>
          </GridItem>

          {/* صف 4: تفعيل + رفع الصورة */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <HStack spacing={4} h="50px" alignItems="center">
              <Text>تفعيل ظهوره في التطبيق</Text>
              <Switch {...register("isActive")} isChecked={isActive} />
            </HStack>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <FormControl>
              <FormLabel>صورة المكتب</FormLabel>
              <UploadField
                sessionId={SESSION_ID}
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

export default OfficeDetailsSection;

/* ===== Dynamic Leaflet Map ===== */
function DynamicLeafletMap({
  components, center, value, onClick,
}: { components: any; center: LatLng; value: LatLng; onClick: (e: any) => void }) {
  const { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } = components;
  const [pos, setPos] = useState<LatLng>(value);

  function ClickHandler() {
    useMapEvents({
      click: (e: any) => {
        onClick(e);
        const { lat, lng } = e.latlng;
        setPos({ lat, lng });
      },
    });
    return null;
  }

  function ResizeFix() {
    const map = useMap();
    useEffect(() => {
      const t = setTimeout(() => map.invalidateSize(), 150);
      return () => clearTimeout(t);
    }, [map]);
    return null;
  }

  useEffect(() => { setPos(value); }, [value.lat, value.lng]);

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      <ResizeFix />
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler />
      <Marker position={[pos.lat, pos.lng]}>
        <Popup>المختار: {pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}</Popup>
      </Marker>
    </MapContainer>
  );
}
