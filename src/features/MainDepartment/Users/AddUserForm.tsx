// src/features/MainDepartment/Users/AddUserPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Text, Grid, GridItem, HStack, VStack,
  useToast, Divider,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import FieldRow from "../../../Components/SharedField/FieldRow";
import { FieldInput, FieldSelect } from "../../../Components/SharedField/FieldControl";
import SharedButton from "../../../Components/SharedButton/Button";

import { useAddUser } from "./hooks/useAddUser";
import { useUpdateUser } from "./hooks/useUpdateUser";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useGetPrivilege } from "../Privelges/hooks/useGetPrivelge";
import { useGetUserById } from "./hooks/useGetUserById";

/* current user id (للـ offices) */
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

// helpers (تستخدم في استخراج القيم من صفوف غير متجانسة)
const officeIdOf = (r: any) => r?.Office_Id ?? r?.OfficeId ?? r?.Id ?? r?.id;
const officeNameOf = (r: any) =>
  r?.OfficeName ?? r?.CompanyName ?? r?.Name ?? r?.name ?? String(officeIdOf(r) ?? "—");

const privIdOf = (r: any) => r?.GroupRight_Id ?? r?.Id ?? r?.id;
const privNameOf = (r: any) =>
  r?.GroupRight_Name ?? r?.GroupRightName ?? r?.Name ?? r?.Title ?? String(privIdOf(r) ?? "—");

export default function AddUserPage() {
  const toast = useToast();
  const navigate = useNavigate();

  // ⬇️ تحديد وضع الصفحة (إضافة / تعديل)
  const { id } = useParams();
  const isEdit = !!id;

  // لو جايين من الجدول: row مبعوت في state
  const location = useLocation() as any;
  const passedRow = location?.state?.row ?? null;

  // لو مفيش state و في id: هات الصف من السيرفر
  const { row: fetchedRow } = useGetUserById(isEdit ? id : undefined);

  // صف المصدر النهائي
  const editRow = passedRow || fetchedRow || null;

  // الإضافة والتحديث
  const { loading: adding, submit: submitAdd } = useAddUser();
  const { loading: updating, submit: submitUpdate } = useUpdateUser();
  const busy = adding || updating;

  // form state
  const [FullName, setFullName] = useState("");
  const [UserName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [PhoneNum, setPhoneNum] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  const [UserType, setUserType] = useState<"M" | "O" | "">("");
  const [Office_Id, setOfficeId] = useState<string | number | "">("");
  const [GroupRight_Id, setGroupRightId] = useState<number | "">("");

  // offices
  const userId = getCurrentUserId();
  const { data: officesData, error: officesError, isLoading: officesLoading } =
    useGetOffices(0, 200, userId);

  // ✅ ابنِ قائمة أسماء المكاتب + خريطة id→name
  const { officeOptions, officeNameById } = useMemo(() => {
    const rows = officesData?.rows ?? [];
    const opts = rows.map((r: any) => {
      const id =
        r?.id ?? r?.Id ?? r?.OfficeId ?? r?.Office_Id;
      const name =
        r?.companyName ?? r?.OfficeName ?? r?.Name ?? r?.name ?? `مكتب #${id}`;
      return { id: Number(id), name: String(name) };
    });
    const map = new Map<number, string>();
    opts.forEach(o => map.set(o.id, o.name));
    return { officeOptions: opts, officeNameById: map };
  }, [officesData]);

  // privileges (حسب نوع الحساب)
  const roleKey = (UserType || "M") as "M" | "O";
  const { data: privData, isLoading: privLoading } = useGetPrivilege(roleKey, 0, 200);

  // استخراج الصلاحيات من الخدمة (rows أو JSON داخل Row)
  const privileges: any[] = useMemo(() => {
    const fromRows = (privData?.rows ?? []) as any[];
    if (fromRows.length) return fromRows;

    const r0 = (privData as any)?.row ?? {};
    const raw =
      r0?.GroupRightsData ?? r0?.grouprightsdata ?? r0?.groupRightsData ?? null;

    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
      catch { return []; }
    }
    return [];
  }, [privData]);

  // تعيين قيم أولية عند الدخول وضع التعديل
  useEffect(() => {
    if (!isEdit || !editRow) return;

    setFullName(editRow.FullName ?? editRow.Name ?? editRow.name ?? "");
    setUserName(editRow.UserName ?? editRow.LoginName ?? "");
    setEmail(editRow.Email ?? "");
    setPhoneNum(editRow.PhoneNum ?? editRow.Mobile ?? editRow.Phone ?? "");
    setPassword("");          // ما نعرضش الباسورد
    setConfirmPassword("");

    const uType = String(editRow.UserType ?? "").toUpperCase() as "M" | "O" | "";
    setUserType(uType);

    if (uType === "O") {
      setOfficeId(editRow.Office_Id ?? editRow.OfficeId ?? "");
      setGroupRightId(""); // مكاتب = 0 عند الإرسال
    } else if (uType === "M") {
      const gid = Number(editRow.GroupRight_Id ?? 0) || 0;
      setGroupRightId(gid);
      setOfficeId("");
    }
  }, [isEdit, editRow]);

  // أول ما الصلاحيات تتوفر مع "إدارة" اختَر أدمن/أول عنصر (للإضافة فقط)
  const adminPrivId = useMemo(() => {
    const f =
      privileges.find((p) => String(privNameOf(p)).trim().toLowerCase().includes("أدمن")) ??
      privileges.find((p) => String(privNameOf(p)).trim().toLowerCase().includes("admin"));
    const idNum = Number(privIdOf(f ?? {}));
    return Number.isFinite(idNum)
      ? idNum
      : (privileges[0] ? Number(privIdOf(privileges[0])) : 0);
  }, [privileges]);

  useEffect(() => {
    // في وضع الإضافة فقط نحط ديفولت
    if (!isEdit && UserType === "M" && !privLoading && privileges.length && GroupRight_Id === "") {
      setGroupRightId(adminPrivId);
    }
    if (UserType === "M") setOfficeId("");
    if (UserType === "O") setGroupRightId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [UserType, privLoading, privileges, adminPrivId, isEdit]);

  // validation
  const isValid = useMemo(() => {
    const userName = UserName.trim();
    const email = Email.trim();
    const phone = PhoneNum.replace(/\D/g, "");
    if (  !userName || !email || !phone) return false;

    // الباسورد إجباري في الإضافة، اختياري في التعديل
    if (!isEdit && !Password) return false;
    if (Password || ConfirmPassword) {
      if (Password !== ConfirmPassword) return false;
    }

    if (!UserType) return false;
    if (UserType === "M" && (GroupRight_Id === "" || GroupRight_Id == null)) return false;
    if (UserType === "O" && !Office_Id) return false;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneOk = /^\d{7,20}$/.test(phone);
    return emailOk && phoneOk;
  }, [FullName, UserName, Email, PhoneNum, Password, ConfirmPassword, UserType, Office_Id, GroupRight_Id, isEdit]);

  const resetForm = () => {
    setFullName(""); setUserName(""); setEmail(""); setPhoneNum("");
    setPassword(""); setConfirmPassword(""); setUserType("");
    setOfficeId(""); setGroupRightId("");
  };

const handleSubmit = async () => {
  if (!isValid) {
    toast({ title: "من فضلك اكمل الحقول بشكل صحيح", status: "warning" });
    return;
  }
  try {
    if (isEdit) {
      // تحديث
      const idVal = Number(editRow?.Id ?? editRow?.UserId ?? editRow?.id ?? 0) || 0;

      await submitUpdate({
        Id: idVal,
        UserName: UserName.trim(),
        Email: Email.trim(),
        PhoneNum: PhoneNum.replace(/\D/g, ""),
        LoginName: UserName.trim(),
        Password: (Password || "").trim(), // فاضي = لا تغيير
        UserType: UserType as "M" | "O",
        GroupRight_Id: UserType === "M" ? Number(GroupRight_Id || 0) : 0,
        Office_Id: UserType === "O" ? Number(Office_Id || 0) : 0,
      });

      toast({ title: "تم تحديث المستخدم", status: "success" });
      navigate("/maindashboard/users");
    } else {
      // إضافة
      const res = await submitAdd({
        UserName: UserName.trim(),
        Email: Email.trim(),
        PhoneNum: PhoneNum.replace(/\D/g, ""),
        Password,
        ConfirmPassword,
        UserType: UserType as "M" | "O",
        GroupRight_Id: UserType === "M" ? Number(GroupRight_Id) : 0,
        Office_Id: UserType === "O" ? Number(Office_Id) : 0,
      } as any);

      // محاولة استخراج الId من الاستجابة (أسماء شائعة)
      const newId =
        Number(
          (res as any)?.Id ??
          (res as any)?.id ??
          (res as any)?.UserId ??
          (res as any)?.insertedId ??
          (res as any)?.NewId ??
          0
        ) || 0;

      // تجهيز بيانات العرض
      const officeName =
        UserType === "O"
          ? (officeNameById.get(Number(Office_Id)) ?? `مكتب #${Office_Id}`)
          : undefined;

      const privName = (() => {
        if (UserType !== "M") return undefined;
        const found = privileges.find((p: any) => Number(privIdOf(p)) === Number(GroupRight_Id));
        return found ? String(privNameOf(found)) : (GroupRight_Id ? `صلاحية #${GroupRight_Id}` : undefined);
      })();

      toast({ title: "تم إضافة المستخدم", status: "success" });

      // روح لصفحة التفاصيل ومعاك كل الداتا اللي اتبعتت
      navigate("/maindashboard/users/created", {
        state: {
          user: {
            Id: newId,
            FullName,
            Email,
            PhoneNum,
            UserName,
            UserType,
            GroupRight_Id: UserType === "M" ? Number(GroupRight_Id) : 0,
            GroupRight_Name: privName,
            Office_Id: UserType === "O" ? Number(Office_Id) : 0,
            OfficeName: officeName,
            IsActive: 1,
          },
        },
        replace: true,
      });
    }

    resetForm();
  } catch (e: any) {
    toast({
      title: e?.message || (isEdit ? "تعذّر التحديث" : "تعذّرت الإضافة"),
      status: "error",
    });
  }
};


  const handleCancel = () => navigate("/maindashboard/users");

  return (
    <Box dir="rtl">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" fontWeight="700" color="gray.800">
          المستخدمين <Text as="span" color="gray.500"> / </Text> {isEdit ? "تعديل مستخدم" : "إضافة مستخدم"}
        </Heading>
      </HStack>

      <Box bg="background.surface" border="1px solid" borderColor="background.border" rounded="lg" p={{ base: 4, md: 6 }} boxShadow="sm">
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Text fontWeight="700" color="gray.800">بيانات المستخدمين</Text>
          </HStack>
          <Divider />

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            <GridItem>
              <FieldRow label="الاسم كامل">
                <FieldInput placeholder="برجاء كتابة الاسم كامل" value={FullName} onChange={(e) => setFullName(e.target.value)} />
              </FieldRow>
            </GridItem>

            <GridItem>
              <FieldRow label="اسم المستخدم">
                <FieldInput placeholder="برجاء كتابة اسم المستخدم" value={UserName} onChange={(e) => setUserName(e.target.value)} />
              </FieldRow>
            </GridItem>

            <GridItem>
              <FieldRow label="البريد الالكتروني">
                <FieldInput placeholder="برجاء كتابة البريد الالكتروني" type="email" value={Email} onChange={(e) => setEmail(e.target.value)} />
              </FieldRow>
            </GridItem>

            <GridItem>
              <FieldRow label="رقم الهاتف">
                <FieldInput placeholder="برجاء كتابة رقم الهاتف" value={PhoneNum} onChange={(e) => setPhoneNum(e.target.value)} />
              </FieldRow>
            </GridItem>

            <GridItem>
              <FieldRow label="كلمة المرور">
                <FieldInput placeholder={isEdit ? "اتركها فارغة لعدم التغيير" : "برجاء كتابة كلمة المرور"} type="password" value={Password} onChange={(e) => setPassword(e.target.value)} />
              </FieldRow>
            </GridItem>

            <GridItem>
              <FieldRow label="تأكيد كلمة المرور">
                <FieldInput placeholder={isEdit ? "اتركها فارغة لعدم التغيير" : "برجاء تأكيد كلمة المرور"} type="password" value={ConfirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </FieldRow>
            </GridItem>

            <GridItem>
              <FieldRow label="نوع الحساب">
                <FieldSelect
                  placeholder="برجاء اختيار نوع الحساب"
                  value={UserType}
                  onChange={(e) => {
                    const v = e.target.value as "M" | "O" | "";
                    setUserType(v);
                    if (v !== "O") setOfficeId("");
                  }}
                >
                  <option value="M">إدارة</option>
                  <option value="O">مكتب</option>
                </FieldSelect>
              </FieldRow>
            </GridItem>

            {UserType === "M" && (
              <GridItem>
                <FieldRow label="الصلاحية">
                  <FieldSelect
                    placeholder={privLoading ? "جاري تحميل الصلاحيات..." : "اختر الصلاحية"}
                    value={String(GroupRight_Id ?? "")}
                    onChange={(e) => setGroupRightId(Number(e.target.value) || "")}
                    isDisabled={privLoading}
                  >
                    {privileges.map((p: any) => {
                      const id = Number(privIdOf(p));
                      const name = String(privNameOf(p));
                      return <option key={String(id)} value={String(id)}>{name}</option>;
                    })}
                  </FieldSelect>
                </FieldRow>
              </GridItem>
            )}

            <GridItem>
              <FieldRow label="المكتب">
                <FieldSelect
                  placeholder={officesLoading ? "جاري تحميل المكاتب..." : "اختر المكتب"}
                  value={String(Office_Id ?? "")}
                  onChange={(e) => setOfficeId(e.target.value)}
                  isDisabled={UserType !== "O" || officesLoading}
                >
                  {/* اسم المكتب الحالي في وضع التعديل */}
                  <option value="" hidden>
                    {UserType === "O"
                      ? officeNameById.get(Number(Office_Id)) ?? "اختر المكتب"
                      : "اختر المكتب"}
                  </option>

                  {officeOptions.map((o) => (
                    <option key={String(o.id)} value={String(o.id)}>
                      {o.name}
                    </option>
                  ))}
                </FieldSelect>
              </FieldRow>
              {officesError ? <Text mt={2} color="red.500" fontSize="sm">تعذّر تحميل قائمة المكاتب</Text> : null}
            </GridItem>

            <GridItem display={{ base: "none", md: "none", lg: "block" }} />
          </Grid>

          <HStack justify="flex-start" spacing={4} pt={2}>
            <SharedButton variant="brandGradient" onClick={handleSubmit} isLoading={busy} isDisabled={!isValid}>
              {isEdit ? "تحديث" : "إضافة"}
            </SharedButton>
            <SharedButton variant="dangerOutline" onClick={handleCancel}>
              إلغاء
            </SharedButton>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
