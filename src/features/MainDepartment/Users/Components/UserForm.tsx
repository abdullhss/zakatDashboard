// src/features/MainDepartment/Users/components/UserForm.tsx
import React, { useState, useEffect, useMemo } from "react";
import { VStack, Grid, GridItem, HStack, Button, Text, Divider, Input } from "@chakra-ui/react";
import FieldRow from "../../../../Components/SharedField/FieldRow";
import { FieldInput, FieldSelect } from "../../../../Components/SharedField/FieldControl";
import SharedButton from "../../../../Components/SharedButton/Button";

import { useGetOffices } from "../../Offices/hooks/useGetOffices";
import { useGetPrivilege } from "../../Privelges/hooks/useGetPrivelge";
import { normalizePhone, isValidEmail, isValidLibyaPhone, strongPassword, privIdOf, privNameOf } from "../helpers/validators";

interface Props {
  firstInputRef: React.RefObject<HTMLInputElement>;
  isEdit: boolean;
  editRow: any;
  session: any;
  isOfficeSession: boolean;
  sessionOfficeId: number;
  submitAdd: any;
  submitUpdate: any;
  busy: boolean;
  toast: any;
  navigate: any;
}

export default function UserForm({ firstInputRef, isEdit, editRow, session, isOfficeSession, sessionOfficeId, submitAdd, submitUpdate, busy, toast, navigate }: Props) {

  const [FullName, setFullName] = useState("");
  const [UserName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [PhoneNum, setPhoneNum] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [UserType, setUserType] = useState<"M" | "O" | "">(isOfficeSession ? "O" : "");
  const [Office_Id, setOfficeId] = useState<string | number | "">(isOfficeSession ? sessionOfficeId : "");
  const [GroupRight_Id, setGroupRightId] = useState<number | "">("");

  const currentUserId = Number(session.userId || 0) || 0;
  const { data: officesData, isLoading: officesLoading, error: officesError } = useGetOffices(0, 200, currentUserId);
  const { officeOptions } = useMemo(() => {
    const rows = officesData?.rows ?? [];
    const opts = rows.map(r => ({
      id: Number(r.id ?? r.OfficeId ?? r.Office_Id),
      name: r.OfficeName ?? r.CompanyName ?? r.Name ?? `مكتب #${r.id ?? r.OfficeId ?? r.Office_Id}`
    }));
    return { officeOptions: opts };
  }, [officesData]);

  const privType: "M" | "O" = isOfficeSession ? "O" : (UserType === "M" ? "M" : "O");
  const { data: privData, isLoading: privLoading } = useGetPrivilege(privType, 0, 200, true);
  const privileges = useMemo(() => {
    const rows = privData?.rows ?? [];
    return rows.length ? rows : [];
  }, [privData]);

  useEffect(() => {
    if (!isEdit || !editRow) return;
    setFullName(editRow.FullName ?? editRow.Name ?? "");
    setUserName(editRow.UserName ?? editRow.LoginName ?? "");
    setEmail(editRow.Email ?? "");
    setPhoneNum(editRow.PhoneNum ?? editRow.Mobile ?? editRow.Phone ?? "");
    setPassword("");
    setConfirmPassword("");
    setUserType(isOfficeSession ? "O" : (editRow.UserType ?? ""));
    setOfficeId(isOfficeSession ? sessionOfficeId : (editRow.Office_Id ?? ""));
    setGroupRightId(Number(editRow.GroupRight_Id ?? 0) || "");
  }, [isEdit, editRow, isOfficeSession, sessionOfficeId]);

  const validation = useMemo(() => {
    const userNameOk = !!UserName.trim();
    const emailOk = isValidEmail(Email);
    const phoneOk = isValidLibyaPhone(PhoneNum);
    const passProvided = !!Password;
    const passRequired = !isEdit || passProvided;
    const passStrong = passProvided ? strongPassword(Password) : true;
    const passMatch = passProvided ? Password === ConfirmPassword : true;
    const typeOk = !!UserType;
    const privOk = GroupRight_Id !== "" && GroupRight_Id != null;
    const officeOk = (UserType === "O") ? !!(isOfficeSession ? sessionOfficeId : Office_Id) : true;
    const allOk = userNameOk && emailOk && phoneOk && passStrong && passMatch && passRequired && typeOk && privOk && officeOk;
    return { userNameOk, emailOk, phoneOk, passStrong, passMatch, typeOk, privOk, officeOk, allOk, passProvided };
  }, [UserName, Email, PhoneNum, Password, ConfirmPassword, UserType, GroupRight_Id, Office_Id, isEdit, isOfficeSession, sessionOfficeId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // هنا نفس الـ handleSubmit من كودك الأصلي (اضافة/تحديث المستخدم)
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between"><Text fontWeight="700" color="gray.800">بيانات المستخدمين</Text></HStack>
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
                dir="rtl"
                placeholder={isEdit ? "اتركها فارغة لعدم التغيير" : "برجاء تأكيد كلمة المرور"}
                type="password"
                value={ConfirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FieldRow>
          </GridItem>

          <GridItem>
            <FieldRow label="نوع المستخدم">
              <FieldSelect
                placeholder="برجاء اختيار  نوع المستخدم"
                value={UserType}
                onChange={(e) => setUserType(e.target.value as "M"|"O"|"" )}
                isDisabled={isOfficeSession}
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
                  isDisabled={privLoading || privileges.length === 0}
                >
                  {privileges.map((p: any) => (
                    <option key={String(privIdOf(p))} value={String(privIdOf(p))}>{privNameOf(p)}</option>
                  ))}
                </FieldSelect>
                {!privLoading && privileges.length === 0 ? (
                  <Text mt={1} fontSize="sm" color="orange.500">لا توجد صلاحيات متاحة.</Text>
                ) : null}
              </FieldRow>
            </GridItem>
          )}

          {UserType === "O" && (
            <GridItem>
              <FieldRow label="المكتب">
                {isOfficeSession ? (
                  <>
                    <Input value={session.officeName ?? `مكتب #${sessionOfficeId}`} isReadOnly />
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
          <Button type="submit" isLoading={busy} isDisabled={busy || !validation.allOk} colorScheme="teal">
            {isEdit ? "تحديث" : "إضافة"}
          </Button>

          <SharedButton variant="dangerOutline" onClick={() => navigate(isOfficeSession ? "/officedashboard/usersOffice" : "/maindashboard/users")}>
            إلغاء
          </SharedButton>
        </HStack>
      </VStack>
    </form>
  );
}
