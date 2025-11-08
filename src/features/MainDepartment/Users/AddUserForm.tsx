// src/features/MainDepartment/Users/AddUserPage/AddUserPage.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box, Heading, Text, HStack, VStack, useToast, Divider,
} from "@chakra-ui/react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";

import FieldRow from "../../../Components/SharedField/FieldRow";
// hooks
import { useAddUser } from "./hooks/useAddUser";
import { useUpdateUser } from "./hooks/useUpdateUser";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useGetPrivilege } from "../Privelges/hooks/useGetPrivelge";
import { useGetUserById } from "./hooks/useGetUserById";
import { getSession } from "../../../session";

// constants & utils
import { STAY_ON_ADD_PAGE, RESET_AFTER_ADD } from "./helpers/Constants";
import { normalizePhone, isValidEmail, isValidLibyaPhone, strongPassword } from "./helpers/validators";
import { privIdOf } from "./helpers/mappers";

// components
import BasicInfoFields from "./Components/BasicInfoFields";
import AccountFields from "./Components/AccountFields";
import OfficeField from "./Components/OfficeField";
import FormActions from "./Components/FormActions";

export default function AddUserPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const updatedUserId = useParams() ;
  

  // session
  const session = getSession();
  const isOfficeSession = session.role === "O";
  const sessionOfficeId = Number(session.officeId || 0) || 0;
  const sessionOfficeName = session.officeName || (sessionOfficeId ? `مكتب #${sessionOfficeId}` : "—");

  // route/edit mode
  const { id } = useParams();
  const isEdit = !!id;
  const location = useLocation() as any;
  const passedRow = location?.state?.row ?? null;
  const { row: fetchedRow, isLoading: isFetchingUser } = useGetUserById(isEdit ? id : undefined);
  const editRow = passedRow || fetchedRow || null;

  // mutations
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

  // type/office/priv
  const [UserType, setUserType] = useState<"M" | "O" | "">(isOfficeSession ? "O" : "");
  const [Office_Id, setOfficeId] = useState<string | number | "">(isOfficeSession ? sessionOfficeId : "");
  const [GroupRight_Id, setGroupRightId] = useState<number | "">("");

  // offices
  const currentUserId = Number(session.userId || 0) || 0;
  const { data: officesData, error: officesError, isLoading: officesLoading } =
    useGetOffices(0, 200, currentUserId);

  const { officeOptions } = useMemo(() => {
    const rows = officesData?.rows ?? [];
    const opts = rows.map((r: any) => {
      const id = r?.id ?? r?.Id ?? r?.OfficeId ?? r?.Office_Id;
      const name = r?.OfficeName ?? r?.companyName ?? r?.Name ?? r?.name ?? `مكتب #${id}`;
      return { id: Number(id), name: String(name) };
    });
    return { officeOptions: opts };
  }, [officesData]);

  // privileges
  const privType: "M" | "O" = isOfficeSession ? "O" : (UserType === "M" ? "M" : "O");
  const { data: privData, isLoading: privLoading } = useGetPrivilege(privType, 0, 200, true);

  const privileges: any[] = useMemo(() => {
    const fromRows = (privData?.rows ?? []) as any[];
    if (fromRows.length) return fromRows;
    const r0 = (privData as any)?.row ?? {};
    const raw = r0?.GroupRightsData ?? r0?.grouprightsdata ?? r0?.groupRightsData ?? null;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [privData]);

  // fill edit data
  // useEffect(() => {
  //   if (!isEdit || !editRow) return;
  //   setFullName(editRow.FullName ?? editRow.Name ?? editRow.name ?? "");
  //   setUserName(editRow.UserName ?? editRow.LoginName ?? "");
  //   setEmail(editRow.Email ?? "");
  //   setPhoneNum(editRow.PhoneNum ?? editRow.Mobile ?? editRow.Phone ?? "");
  //   setPassword("");
  //   setConfirmPassword("");

  //   const uType = String(editRow.UserType ?? "").toUpperCase() as "M" | "O" | "";
  //   setUserType(isOfficeSession ? "O" : uType);

  //   if (isOfficeSession) {
  //     setOfficeId(sessionOfficeId);
  //   } else {
  //     if (uType === "O") setOfficeId(editRow.Office_Id ?? editRow.OfficeId ?? "");
  //     else setOfficeId("");
  //   }

  //   const gid = Number(editRow.GroupRight_Id ?? 0) || "";
  //   setGroupRightId(gid);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isEdit, editRow, isOfficeSession, sessionOfficeId]);

  // default/clear privilege per type
  useEffect(() => {
    if (UserType === "O") {
      return;
    }
    if (UserType === "M" && !privLoading && privileges.length && !GroupRight_Id) {
      const firstId = Number(privIdOf(privileges[0])) || 0;
      if (firstId) setGroupRightId(firstId);
    }
  }, [privLoading, privileges, GroupRight_Id, UserType]);

  // validation memo (كما هو)
  const validation = useMemo(() => {
    const userNameOk = !!UserName.trim();
    const emailOk = isValidEmail(Email);
    const phoneOk = isValidLibyaPhone(PhoneNum);
    const passProvided = !!Password;

    const passRequired = !isEdit || passProvided;
    const passStrong = passProvided ? strongPassword(Password) : true;
    const passMatch = passProvided ? Password === ConfirmPassword : true;

    const typeOk = !!UserType;
    const privOk = (UserType === "M") ? (GroupRight_Id !== "" && GroupRight_Id != null) : true;
    const officeOk = (UserType === "O") ? !!(isOfficeSession ? sessionOfficeId : Office_Id) : true;

    const allOk =
  userNameOk && emailOk && phoneOk &&
  passStrong && passMatch &&
  (!isEdit ? passRequired : true) && // 👈 شرط مخصص لحالة Edit
  typeOk && privOk && officeOk;


    return { userNameOk, emailOk, phoneOk, passStrong, passMatch, typeOk, privOk, officeOk, allOk, passProvided, passRequired };
  }, [UserName, Email, PhoneNum, Password, ConfirmPassword, UserType, GroupRight_Id, Office_Id, isEdit, isOfficeSession, sessionOfficeId]);

  const resetForm = () => {
    setFullName(""); setUserName(""); setEmail(""); setPhoneNum("");
    setPassword(""); setConfirmPassword("");
    setUserType(isOfficeSession ? "O" : "");
    setOfficeId(isOfficeSession ? sessionOfficeId : "");
    setGroupRightId("");
    setTimeout(() => firstInputRef.current?.focus(), 0);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // نفس التشيكات والتوست
    if (!validation.userNameOk) return toast({ title: "اسم المستخدم مطلوب", status: "warning" });
    if (!validation.emailOk)  return toast({ title: "البريد الإلكتروني غير صالح", status: "warning" });
    if (!validation.phoneOk)  return toast({
      title: "رقم الهاتف غير ليبي",
      description: "المسموح: 091/092/094xxxxxxx أو +218/00218 ثم 91/92/94xxxxxxx",
      status: "warning",
    });
    if (!validation.typeOk) return toast({ title: "اختر نوع الحساب", status: "warning" });
    if (UserType === "M" && !validation.privOk) return toast({ title: "اختر الصلاحية", status: "warning" });
    if (!validation.officeOk) return toast({ title: "اختر المكتب", status: "warning" });
    // if (isEdit && !validation.passProvided) return toast({ title: "كلمة المرور مطلوبة للتحديث.", status: "warning" });
    if (validation.passProvided && !validation.passStrong)
      return toast({
        title: "كلمة المرور ضعيفة",
        description: "الحد الأدنى 8 أحرف وتضم حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا.",
        status: "warning",
      });

    if (validation.passProvided && !validation.passMatch)
      return toast({ title: "تأكيد كلمة المرور غير مطابق", status: "warning" });

    try {
      if (isEdit) {
        const idVal = Number(updatedUserId.id);
        await submitUpdate({
          Id: idVal,
          UserName: UserName.trim(),
          Email: Email.trim(),
          PhoneNum: normalizePhone(PhoneNum),
          LoginName: UserName.trim(),
          // Password: (Password || "").trim(),
          UserType: (isOfficeSession ? "O" : UserType) as "M" | "O",
          GroupRight_Id: Number(GroupRight_Id || 0),
          Office_Id: (isOfficeSession ? sessionOfficeId : (UserType === "O" ? Number(Office_Id || 0) : 0)),
        });
        toast({ title: "تم تحديث المستخدم", status: "success" });
        if (!STAY_ON_ADD_PAGE) navigate(isOfficeSession ? "/officedashboard/usersOffice" : "/maindashboard/users");
      } else {
        await submitAdd({
          UserName: FullName.trim(),
          LoginName: UserName.trim(),
          Email: Email.trim(),
          PhoneNum: normalizePhone(PhoneNum),
          Password,
          ConfirmPassword,
          UserType: (isOfficeSession ? "O" : UserType) as "M" | "O",
          GroupRight_Id: Number(GroupRight_Id || 0),
          Office_Id: (isOfficeSession ? sessionOfficeId : (UserType === "O" ? Number(Office_Id || 0) : 0)),
        } as any);

        toast({ title: "تم إضافة المستخدم", status: "success" });
        if (RESET_AFTER_ADD) resetForm();
        if (!STAY_ON_ADD_PAGE) navigate(isOfficeSession ? "/officedashboard/usersOffice" : "/maindashboard/users");
      }
    } catch (e: any) {
      toast({ title: e?.message || (isEdit ? "تعذّر التحديث" : "تعذّرت الإضافة"), status: "error" });
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

      
            <BasicInfoFields
              isEdit={isEdit}
              firstInputRef={firstInputRef as any}
              FullName={FullName} setFullName={setFullName}
              UserName={UserName} setUserName={setUserName}
              Email={Email} setEmail={setEmail}
              PhoneNum={PhoneNum} setPhoneNum={setPhoneNum}
              Password={Password} setPassword={setPassword}
              ConfirmPassword={ConfirmPassword} setConfirmPassword={setConfirmPassword}
            />

         
            <AccountFields
              isOfficeSession={isOfficeSession}
              UserType={UserType} setUserType={setUserType}
              privLoading={privLoading}
              privileges={privileges}
              GroupRight_Id={GroupRight_Id} setGroupRightId={setGroupRightId}
            />

     
            <OfficeField
              visible={UserType === "O"}
              isOfficeSession={isOfficeSession}
              sessionOfficeName={sessionOfficeName}
              sessionOfficeId={sessionOfficeId}
              officesLoading={officesLoading}
              officesError={officesError}
              officeOptions={officeOptions}
              Office_Id={Office_Id}
              setOfficeId={setOfficeId as any}
            />

     
            <FormActions
              isEdit={isEdit}
              busy={busy}
              allOk={validation.allOk}
              onReset={() => {
                resetForm();
                toast({ title: "تم تفريغ الحقول", status: "info" });
              }}
              onBack={() => navigate(isOfficeSession ? "/officedashboard/usersOffice" : "/maindashboard/users")}
            />
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
