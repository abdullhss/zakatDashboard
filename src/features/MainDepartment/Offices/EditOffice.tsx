import { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Grid, GridItem, useToast, HStack, Text, Switch,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import SharedButton from "../../../Components/SharedButton/Button";
import FieldRow from "../../../Components/SharedField/FieldRow";
import { FieldInput, FieldSelect } from "../../../Components/SharedField/FieldControl";

import { updateOffice } from "./Services/updateOffice";
import { useGetOffices } from "./hooks/useGetOffices";
import MapPicker from "../../../Components/Map/MapPicker";

// helpers لاستخراج القيم بأسماء مختلفة
const officeIdOf = (r: any) => r?.Id ?? r?.id ?? r?.OfficeId ?? r?.Office_Id;
const officeNameOf = (r: any) =>
  r?.OfficeName ?? r?.CompanyName ?? r?.Name ?? r?.name ?? "";
const cityIdOf = (r: any) => r?.City_Id ?? r?.CityId ?? r?.cityId ?? r?.CityID ?? 0;
const cityNameOf = (r: any) => r?.CityName ?? r?.cityName ?? r?.City ?? "";
const phoneOf = (r: any) => r?.PhoneNum ?? r?.phone ?? r?.Mobile ?? r?.Phone ?? "";
const addrOf = (r: any) => r?.Address ?? r?.address ?? r?.Addr ?? "";
const latOf = (r: any) => r?.OfficeLatitude ?? r?.Latitude ?? r?.lat ?? r?.Lat ?? "";
const lngOf = (r: any) => r?.OfficeLongitude ?? r?.Longitude ?? r?.lng ?? r?.Lng ?? "";
const activeOf = (r: any) => !!(r?.IsActive ?? r?.isActive ?? r?.Active);

// مركز ديفولت (طرابلس) لو مفيش إحداثيات محفوظة
const DEFAULT_CENTER = { lat: 32.8872, lng: 13.1913 };

function getCurrentUserId(): number {
  try {
    const keys = ["mainUser", "MainUser", "user", "auth", "login"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const id = obj?.UserId ?? obj?.userId ?? obj?.Id ?? obj?.id;
      if (Number.isFinite(Number(id))) return Number(id);
    }
  } catch {}
  return 1;
}

export default function EditOffice() {
  const { id } = useParams();                         // /offices/edit/:id
  const location = useLocation() as any;              // { state: { row } }
  const passedRow = location?.state?.row ?? null;

  const toast = useToast();
  const navigate = useNavigate();

  // لو جاي من الجدول، بنستخدم الصف فورًا. لو لا، هنجلب أول 200 ونحاول نلاقيه
  const userId = getCurrentUserId();
  const { data: officesData, isLoading } = useGetOffices(0, 200, userId);

  const loadedRow = useMemo(() => {
    if (passedRow) return passedRow;
    const rows = officesData?.rows ?? [];
    return rows.find((r: any) => String(officeIdOf(r)) === String(id)) ?? null;
  }, [passedRow, officesData, id]);

  // ===== form state =====
  const [officeName, setOfficeName] = useState("");
  const [cityId, setCityId] = useState<string | number>("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // ملء القيم من الصف
  useEffect(() => {
    if (!loadedRow) return;

    setOfficeName(officeNameOf(loadedRow));
    setCityId(String(cityIdOf(loadedRow) || ""));
    setPhone(String(phoneOf(loadedRow) || ""));
    setAddress(String(addrOf(loadedRow) || ""));

    const latRaw = Number(latOf(loadedRow));
    const lngRaw = Number(lngOf(loadedRow));
    setLatitude(Number.isFinite(latRaw) ? latRaw.toFixed(6) : "");
    setLongitude(Number.isFinite(lngRaw) ? lngRaw.toFixed(6) : "");

    setIsActive(activeOf(loadedRow));
  }, [loadedRow]);

  // بناء اختيارات المدن من نفس البيانات (لو عندك API منفصل بدّله)
  const cityOptions = useMemo(() => {
    const rows = officesData?.rows ?? [];
    const uniq = new Map<string, string>();
    rows.forEach((r: any) => {
      const cid = String(cityIdOf(r) || "");
      const cname = cityNameOf(r) || `مدينة #${cid}`;
      if (cid) uniq.set(cid, cname);
    });
    return Array.from(uniq, ([value, label]) => ({ value, label }));
  }, [officesData]);

  const canSubmit = !!loadedRow && String(officeIdOf(loadedRow)) !== "";

  const handleSave = async () => {
    if (!loadedRow) {
      toast({ title: "لا يوجد صف مكتب للـتعديل.", status: "error" });
      return;
    }
    try {
      const summary = await updateOffice({
        id: officeIdOf(loadedRow),
        officeName,
        cityId: cityId || 0,
        phone,
        address,
        isActive,
        latitude,
        longitude,
        photoName: "",
        pointId: 0,
      });

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "تعذّر التحديث");
      }

      toast({ title: "تم تحديث بيانات المكتب", status: "success" });
      navigate("/maindashboard/offices");
    } catch (e: any) {
      toast({ title: e?.message || "تعذّر التحديث", status: "error" });
    }
  };

  const handleCancel = () => navigate("/maindashboard/offices");

  // حسبة مركز الخريطة: لو الإحداثيات فاضية نستخدم طرابلس
  const center = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    return Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : DEFAULT_CENTER;
  }, [latitude, longitude]);

  return (
    <Box p={4} dir="rtl">
      <Heading size="lg" mb={6}>تعديل مكتب</Heading>

      {isLoading && !loadedRow ? (
        <Text color="gray.600">جارِ التحميل…</Text>
      ) : !loadedRow ? (
        <Text color="red.500">لم يتم العثور على المكتب المطلوب.</Text>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <GridItem>
            <FieldRow label="اسم المكتب / الشركة">
              <FieldInput
                placeholder="مثال: مكتب طرابلس"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
              />
            </FieldRow>
          </GridItem>

          <GridItem>
            <FieldRow label="المدينة">
              <FieldSelect
                placeholder="اختر المدينة"
                value={String(cityId)}
                onChange={(e) => setCityId(e.target.value)}
              >
                {/* لو المدينة الحالية مش ضمن الخيارات، اعرضها Hidden */}
                {String(cityId) &&
                  !cityOptions.some(o => o.value === String(cityId)) && (
                    <option value={String(cityId)} hidden>
                      {cityNameOf(loadedRow) || `مدينة #${cityId}`}
                    </option>
                  )}
                {cityOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </FieldSelect>
            </FieldRow>
          </GridItem>

          <GridItem>
            <FieldRow label="رقم الهاتف">
              <FieldInput
                dir="ltr"
                placeholder="09XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FieldRow>
          </GridItem>

          <GridItem>
            <FieldRow label="العنوان">
              <FieldInput
                placeholder="المنطقة / الشارع / ..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FieldRow>
          </GridItem>

          {/* الخريطة + تعديل الإحداثيات */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FieldRow label="الموقع على الخريطة">
              <MapPicker
                value={center}
                onChange={(c) => {
                  setLatitude(c.lat.toFixed(6));
                  setLongitude(c.lng.toFixed(6));
                }}
                height={320}
                zoom={12}
              />
              <HStack spacing={4} mt={3}>
                <FieldInput
                  placeholder="Latitude"
                  value={String(latitude ?? "")}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <FieldInput
                  placeholder="Longitude"
                  value={String(longitude ?? "")}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </HStack>
              <Text mt={2} fontSize="sm" color="gray.500">
                اضغط على الخريطة أو اسحب الماركر لتعديل الإحداثيات.
              </Text>
            </FieldRow>
          </GridItem>

          <GridItem>
            <FieldRow label="حالة المكتب">
              <HStack>
                <Switch
                  isChecked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  mr={2}
                />
                <Text color="gray.600">{isActive ? "مفعل" : "غير مفعل"}</Text>
              </HStack>
            </FieldRow>
          </GridItem>
        </Grid>
      )}

      <HStack justify="flex-start" spacing={3} mt={8}>
        <SharedButton onClick={handleSave} isDisabled={!canSubmit}>
          تحديث
        </SharedButton>
        <SharedButton variant="dangerOutline" onClick={handleCancel}>
          إلغاء
        </SharedButton>
      </HStack>
    </Box>
  );
}
