// src/features/MainDepartment/Users/AddUserPage.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box, Heading, Text, Grid, GridItem, HStack, VStack,
  useToast, Divider, Button, Input
} from "@chakra-ui/react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import FieldRow from "../../../Components/SharedField/FieldRow";
import { FieldInput, FieldSelect } from "../../../Components/SharedField/FieldControl";
import SharedButton from "../../../Components/SharedButton/Button";

import { useAddUser } from "./hooks/useAddUser";
import { useUpdateUser } from "./hooks/useUpdateUser";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useGetPrivilege } from "../Privelges/hooks/useGetPrivelge";
import { useGetUserById } from "./hooks/useGetUserById";
import { getSession } from "../../../session";

// =====================
// إعدادات سريعة
// =====================
// خليه true علشان بعد "إضافة" يفضل في نفس الصفحة وميفرّش
const STAY_ON_ADD_PAGE = true;
// بعد الإضافة: نفرّغ الحقول (مع بقاء الصفحة مفتوحة)
const RESET_AFTER_ADD = true;

// ===== Helpers =====
const officeIdOf = (r: any) => r?.Office_Id ?? r?.OfficeId ?? r?.Id ?? r?.id;
const officeNameOf = (r: any) =>
  r?.OfficeName ?? r?.CompanyName ?? r?.Name ?? r?.name ?? String(officeIdOf(r) ?? "—");

const privIdOf = (r: any) => r?.GroupRight_Id ?? r?.Id ?? r?.id;
const privNameOf = (r: any) =>
  r?.GroupRight_Name ?? r?.GroupRightName ?? r?.Name ?? r?.Title ?? String(privIdOf(r) ?? "—");

// ===== Validators =====
const normalizePhone = (raw: string) => raw.replace(/[^\d+]/g, "");
function isValidLibyaPhone(raw: string): boolean {
  const s = normalizePhone(raw);
  if (/^0(91|92|94)\d{7}$/.test(s)) return true;
  if (/^\+218(91|92|94)\d{7}$/.test(s)) return true;
  if (/^00218(91|92|94)\d{7}$/.test(s)) return true;
  return false;
}
const isValidEmail = (e: string) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e.trim());
const strongPassword = (p: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/.test(p);

export default function AddUserPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // جلسة المستخدم
  const session = getSession();
  const isOfficeSession = session.role === "O";
  const sessionOfficeId = Number(session.officeId || 0) || 0;
  const sessionOfficeName = session.officeName || (sessionOfficeId ? `مكتب #${sessionOfficeId}` : "—");

  // وضع الصفحة
  const { id } = useParams();
  const isEdit = !!id;

  const location = useLocation() as any;
  const passedRow = location?.state?.row ?? null;

  const { row: fetchedRow } = useGetUserById(isEdit ? id : undefined);
  const editRow = passedRow || fetchedRow || null;

  const { loading: adding,   submit: submitAdd }    = useAddUser();
  const { loading: updating, submit: submitUpdate } = useUpdateUser();
  const busy = adding || updating;

  // form state
  const [FullName, setFullName] = useState("");
  const [UserName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [PhoneNum, setPhoneNum] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  // نوع الحساب
  const [UserType, setUserType] = useState<"M" | "O" | "">(isOfficeSession ? "O" : "");
  // المكتب
  const [Office_Id, setOfficeId] = useState<string | number | "">(isOfficeSession ? sessionOfficeId : "");
  // الصلاحية
  const [GroupRight_Id, setGroupRightId] = useState<number | "">("");

  // === المكاتب (للإدارة فقط) ===
  const currentUserId = Number(session.userId || 0) || 0;
  const { data: officesData, error: officesError, isLoading: officesLoading } =
    useGetOffices(0, 200, currentUserId);

  const { officeOptions, officeNameById } = useMemo(() => {
    const rows = officesData?.rows ?? [];
    const opts = rows.map((r: any) => {
      const id = r?.id ?? r?.Id ?? r?.OfficeId ?? r?.Office_Id;
      const name = r?.OfficeName ?? r?.companyName ?? r?.Name ?? r?.name ?? `مكتب #${id}`;
      return { id: Number(id), name: String(name) };
    });
    const map = new Map<number, string>();
    opts.forEach(o => map.set(o.id, o.name));
    return { officeOptions: opts, officeNameById: map };
  }, [officesData]);

  // === الصلاحيات ===
  const privType: "M" | "O" =
    isOfficeSession ? "O" : (UserType === "M" ? "M" : "O");
  const { data: privData, isLoading: privLoading } =
    useGetPrivilege(privType, 0, 200, true);

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

  // تعبئة التعديل
  useEffect(() => {
    if (!isEdit || !editRow) return;
    setFullName(editRow.FullName ?? editRow.Name ?? editRow.name ?? "");
    setUserName(editRow.UserName ?? editRow.LoginName ?? "");
    setEmail(editRow.Email ?? "");
    setPhoneNum(editRow.PhoneNum ?? editRow.Mobile ?? editRow.Phone ?? "");
    setPassword("");
    setConfirmPassword("");

    const uType = String(editRow.UserType ?? "").toUpperCase() as "M" | "O" | "";
    setUserType(isOfficeSession ? "O" : uType);

    if (isOfficeSession) {
      setOfficeId(sessionOfficeId);
    } else {
      if (uType === "O") setOfficeId(editRow.Office_Id ?? editRow.OfficeId ?? "");
      else setOfficeId("");
    }

    const gid = Number(editRow.GroupRight_Id ?? 0) || "";
    setGroupRightId(gid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editRow, isOfficeSession, sessionOfficeId]);

  // قيمة افتراضية لأول صلاحية
  useEffect(() => {
    if (!privLoading && !GroupRight_Id && privileges.length) {
      const firstId = Number(privIdOf(privileges[0])) || 0;
      if (firstId) setGroupRightId(firstId);
    }
  }, [privLoading, privileges, GroupRight_Id]);

  // Validation
  const validation = useMemo(() => {
    const userNameOk = !!UserName.trim();
    const emailOk = isValidEmail(Email);
    const phoneOk = isValidLibyaPhone(PhoneNum);
    const passProvided = !!Password;
    const passStrong = passProvided ? strongPassword(Password) : isEdit ? true : false;
    const passMatch = passProvided ? Password === ConfirmPassword : isEdit ? true : ConfirmPassword === "";
    const typeOk = !!UserType;
    const privOk = GroupRight_Id !== "" && GroupRight_Id != null;
    const officeOk = (UserType === "O") ? !!(isOfficeSession ? sessionOfficeId : Office_Id) : true;

    const allOk =
      userNameOk && emailOk && phoneOk &&
      passStrong && passMatch &&
      typeOk && privOk && officeOk;

    return { userNameOk, emailOk, phoneOk, passStrong, passMatch, typeOk, privOk, officeOk, allOk };
  }, [UserName, Email, PhoneNum, Password, ConfirmPassword, UserType, GroupRight_Id, Office_Id, isEdit, isOfficeSession, sessionOfficeId]);

  const resetForm = () => {
    setFullName(""); setUserName(""); setEmail(""); setPhoneNum("");
    setPassword(""); setConfirmPassword("");
    setUserType(isOfficeSession ? "O" : "");
    setOfficeId(isOfficeSession ? sessionOfficeId : "");
    setGroupRightId("");
    // فوكس على أول حقل
    setTimeout(() => firstInputRef.current?.focus(), 0);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // checks
    if (!validation.userNameOk) return toast({ title: "اسم المستخدم مطلوب", status: "warning" });
    if (!validation.emailOk)   return toast({ title: "البريد الإلكتروني غير صالح", status: "warning" });
    if (!validation.phoneOk)   return toast({
      title: "رقم الهاتف غير ليبي",
      description: "المسموح: 091/092/094xxxxxxx أو +218/00218 ثم 91/92/94xxxxxxx",
      status: "warning",
    });
    if (!validation.typeOk)    return toast({ title: "اختر نوع الحساب", status: "warning" });
    if (!validation.privOk)    return toast({ title: "اختر الصلاحية", status: "warning" });
    if (!validation.officeOk)  return toast({ title: "اختر المكتب", status: "warning" });
    if (!isEdit && !Password)  return toast({ title: "كلمة المرور مطلوبة", status: "warning" });
    if (!validation.passStrong) return toast({
      title: "كلمة المرور ضعيفة",
      description: "الحد الأدنى 8 أحرف وتضم حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا.",
      status: "warning",
    });
    if (!validation.passMatch) return toast({ title: "تأكيد كلمة المرور غير مطابق", status: "warning" });

    try {
      if (isEdit) {
        const idVal = Number(editRow?.Id ?? editRow?.UserId ?? editRow?.id ?? 0) || 0;
        await submitUpdate({
          Id: idVal,
          UserName: UserName.trim(),
          Email: Email.trim(),
          PhoneNum: normalizePhone(PhoneNum),
          LoginName: UserName.trim(),
          Password: (Password || "").trim(),
          UserType: (isOfficeSession ? "O" : UserType) as "M" | "O",
          GroupRight_Id: Number(GroupRight_Id || 0),
          Office_Id: (isOfficeSession ? sessionOfficeId : (UserType === "O" ? Number(Office_Id || 0) : 0)),
        });
        toast({ title: "تم تحديث المستخدم", status: "success" });
        // في التعديل ممكن تفضّل ترجع للقائمة، لكن بناءً على طلبك نخلي الصفحة مفتوحة
        if (!STAY_ON_ADD_PAGE) navigate(isOfficeSession ? "/officedashboard/usersOffice" : "/maindashboard/users");
      } else {
        await submitAdd({
          UserName: UserName.trim(),
          Email: Email.trim(),
          PhoneNum: normalizePhone(PhoneNum),
          Password,
          ConfirmPassword,
          UserType: (isOfficeSession ? "O" : UserType) as "M" | "O",
          GroupRight_Id: Number(GroupRight_Id || 0),
          Office_Id: (isOfficeSession ? sessionOfficeId : (UserType === "O" ? Number(Office_Id || 0) : 0)),
        } as any);

        toast({ title: "تم إضافة المستخدم", status: "success" });

        // متقفلش الصفحة
        if (RESET_AFTER_ADD) resetForm();
        if (!STAY_ON_ADD_PAGE) navigate(isOfficeSession ? "/officedashboard/usersOffice" : "/maindashboard/users");
      }
    } catch (e: any) {
      toast({
        title: e?.message || (isEdit ? "تعذّر التحديث" : "تعذّرت الإضافة"),
        status: "error",
      });
    }
  };

  return (
    <Box dir="rtl">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" fontWeight="700" color="gray.800">
          المستخدمين <Text as="span" color="gray.500"> / </Text> {isEdit ? "تعديل مستخدم" : "إضافة مستخدم"}
        </Heading>
      </HStack>

      <Box
        bg="background.surface"
        border="1px solid"
        borderColor="background.border"
        rounded="lg"
        p={{ base: 4, md: 6 }}
        boxShadow="sm"
      >
        <form onSubmit={handleSubmit} noValidate>
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <Text fontWeight="700" color="gray.800">بيانات المستخدمين</Text>
            </HStack>
            <Divider />

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              <GridItem>
                <FieldRow label="الاسم كامل">
                  <FieldInput
                    ref={firstInputRef}
                    placeholder="برجاء كتابة الاسم كامل"
                    value={FullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </FieldRow>
              </GridItem>

              <GridItem>
                <FieldRow label="اسم المستخدم">
                  <FieldInput
                    placeholder="برجاء كتابة اسم المستخدم"
                    value={UserName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </FieldRow>
              </GridItem>

              <GridItem>
                <FieldRow label="البريد الالكتروني">
                  <FieldInput
                    placeholder="example@email.com"
                    type="email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FieldRow>
              </GridItem>

              <GridItem>
                <FieldRow label="رقم الهاتف">
                  <FieldInput
                    placeholder="091xxxxxxx أو +21891xxxxxxx"
                    value={PhoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    inputMode="tel"
                    maxLength={16}
                  />
                </FieldRow>
              </GridItem>

              <GridItem>
                <FieldRow label="كلمة المرور">
                  <FieldInput
                    placeholder={isEdit ? "اتركها فارغة لعدم التغيير" : "8+ أحرف: كبير/صغير/رقم/رمز"}
                    type="password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FieldRow>
              </GridItem>

              <GridItem>
                <FieldRow label="تأكيد كلمة المرور">
                  <FieldInput
                    placeholder={isEdit ? "اتركها فارغة لعدم التغيير" : "برجاء تأكيد كلمة المرور"}
                    type="password"
                    value={ConfirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </FieldRow>
              </GridItem>

              {/* نوع الحساب */}
              <GridItem>
                <FieldRow label="نوع الحساب">
                  <FieldSelect
                    placeholder="برجاء اختيار نوع الحساب"
                    value={UserType}
                    onChange={(e) => setUserType(e.target.value as "M" | "O" | "")}
                    isDisabled={isOfficeSession}
                  >
                    <option value="M">إدارة</option>
                    <option value="O">مكتب</option>
                  </FieldSelect>
                </FieldRow>
              </GridItem>

              {/* الصلاحية */}
              <GridItem>
                <FieldRow label="الصلاحية">
                  <FieldSelect
                    placeholder={privLoading ? "جاري تحميل الصلاحيات..." : "اختر الصلاحية"}
                    value={String(GroupRight_Id ?? "")}
                    onChange={(e) => setGroupRightId(Number(e.target.value) || "")}
                    isDisabled={privLoading || privileges.length === 0}
                  >
                    {privileges.map((p: any) => {
                      const id = Number(privIdOf(p));
                      const name = String(privNameOf(p));
                      return <option key={String(id)} value={String(id)}>{name}</option>;
                    })}
                  </FieldSelect>
                  {!privLoading && privileges.length === 0 ? (
                    <Text mt={1} fontSize="sm" color="orange.500">لا توجد صلاحيات متاحة.</Text>
                  ) : null}
                </FieldRow>
              </GridItem>

              {/* المكتب */}
              {UserType === "O" && (
                <GridItem>
                  <FieldRow label="المكتب">
                    {isOfficeSession ? (
                      // عرض اسم المكتب فقط (Read-only) + نثبت القيمة المرسلة من الجلسة
                      <>
                        <Input value={sessionOfficeName} isReadOnly />
                        {/* نرسل الـ Office_Id من الجلسة في الخلفية */}
                        <input type="hidden" value={sessionOfficeId} />
                      </>
                    ) : (
                      <FieldSelect
                        placeholder={officesLoading ? "جاري تحميل المكاتب..." : "اختر المكتب"}
                        value={String(Office_Id ?? "")}
                        onChange={(e) => setOfficeId(e.target.value)}
                        isDisabled={officesLoading}
                      >
                        {officeOptions.map((o) => (
                          <option key={String(o.id)} value={String(o.id)}>{o.name}</option>
                        ))}
                      </FieldSelect>
                    )}
                    {officesError ? (
                      <Text mt={2} color="red.500" fontSize="sm">تعذّر تحميل قائمة المكاتب</Text>
                    ) : null}
                  </FieldRow>
                </GridItem>
              )}

              <GridItem display={{ base: "none", md: "none", lg: "block" }} />
            </Grid>

            <HStack justify="flex-start" spacing={4} pt={2}>
              <Button type="submit" isLoading={busy} isDisabled={busy} colorScheme="teal">
                {isEdit ? "تحديث" : "إضافة"}
              </Button>

              {/* إلغاء = تفريغ فقط (لا خروج) */}
              <SharedButton
                variant="dangerOutline"
                onClick={() => {
                  resetForm();
                  toast({ title: "تم تفريغ الحقول", status: "info" });
                }}
              >
                إلغاء
              </SharedButton>

              {/* زر اختياري للرجوع للقائمة يدويًا لو حبيت */}
              <SharedButton
                variant="secondary"
                onClick={() => navigate(isOfficeSession ? "/officedashboard/usersOffice" : "/maindashboard/users")}
              >
                الرجوع للقائمة
              </SharedButton>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
