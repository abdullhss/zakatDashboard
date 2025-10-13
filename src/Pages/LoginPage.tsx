// // src/Pages/LoginPage.tsx
// import { useState, useCallback, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Box, Image, Stack, Text, useToast } from "@chakra-ui/react";

// import { useLogin } from "../features/Authentication/hooks/useLogin";
// import LoginForm from "../features/Authentication/LoginForm";
// import {
//   StyledPage,
//   StyledMain,
//   StyledFormCard,
//   HeaderStack,
//   SubmitBtn,
//   AyahWrap,
// } from "../features/Authentication/Styles/LoginpageStyles";
// import LoginSideBar from "../features/Authentication/LoginSideBar";
// import type { LoginResult } from "../features/Authentication/Services/authService";

// const logoSrc = "/assets/Logo.png";
// const ayahSrc = "/assets/Quran.png";

// export default function LoginPage() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const toast = useToast();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { mutateAsync, isPending } = useLogin();

//   // لو في جلسة محفوظة مسبقًا وجّه مباشرة حسب الدور
//   useEffect(() => {
//     const auth = localStorage.getItem("auth") === "true";
//     const role = localStorage.getItem("role");
//     if (auth && role === "M") navigate("/maindashboard", { replace: true });
//     else if (auth && role === "O") navigate("/officedashboard", { replace: true });
//   }, [navigate]);

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();

//       const u = username.trim();
//       const p = password;
//       if (!u || !p) {
//         toast({
//           title: "البيانات ناقصة",
//           description: "الرجاء إدخال اسم المستخدم وكلمة المرور.",
//           status: "warning",
//           duration: 3000,
//           isClosable: true,
//         });
//         return;
//       }

//       try {
//         const resp = (await mutateAsync([u, p])) as LoginResult;

//         if (!resp?.success || !resp.userData) {
//           throw new Error(resp?.message || "اسم المستخدم أو كلمة المرور غير صحيحة.");
//         }

//         const user = resp.userData;
//         const role = user.UserRole; // "M" أو "O"

//         // حفظ الجلسة + الدور + كائن المستخدم بشكل متوافق مع الشاشات الأخرى
//         localStorage.setItem("auth", "true");
//         localStorage.setItem("role", role);
//         localStorage.setItem("username", user.UserName ?? "");
//         localStorage.setItem("userId", String(user.UserID ?? "")); // لبعض الدوال التي تقرأ userId مباشرة
//         localStorage.setItem(
//           "mainUser",
//           JSON.stringify({
//             Id: user.UserID,
//             UserId: user.UserID, // احتياطيًا
//             UserName: user.UserName,
//             UserType: role, // نخليها "M"/"O"
//             Office_Id: user.Office_Id ?? 0,
//             GroupRight_Id: user.GroupRight_Id ?? 0,
//             GroupRightName: user.GroupRightName ?? "",
//             Email: user.Email ?? "",
//             PhoneNum: user.PhoneNum ?? "",
//             role, // نسخة صريحة
//           })
//         );

//         toast({
//           title: `مرحبًا بعودتك، ${user.UserName || "مستخدم"}!`,
//           status: "success",
//           duration: 1200,
//           isClosable: true,
//         });

//         const defaultTarget = role === "M" ? "/maindashboard" : "/officedashboard";
//         const from = (location.state as any)?.from?.pathname as string | undefined;
//         navigate(from || defaultTarget, { replace: true });
//       } catch (err: any) {
//         toast({
//           title: "فشل تسجيل الدخول",
//           description: err?.message || "فشل غير معروف.",
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//         });
//       }
//     },
//     [username, password, mutateAsync, toast, navigate, location.state]
//   );

//   return (
//     <StyledPage>
//       <LoginSideBar />
//       <StyledMain>
//         <StyledFormCard as="form" onSubmit={handleSubmit}>
//           <HeaderStack>
//             <Image src={logoSrc} alt="Logo" h="120px" w="150px" objectFit="contain" />
//             <Box textAlign="center">
//               <Text mt="24px" fontSize="25px" fontWeight="700" color="gray.800" mb={1}>
//                 تسجيل الدخول
//               </Text>
//               <Text fontSize="20px" color="gray.400">
//                 مرحبًا بعودتك، قم بتسجيل الدخول إلى حسابك
//               </Text>
//             </Box>
//           </HeaderStack>

//           <Stack spacing="20px">
//             <LoginForm
//               username={username}
//               password={password}
//               setUsername={setUsername}
//               setPassword={setPassword}
//               isDisabled={isPending}
//             />

//             <SubmitBtn type="submit" disabled={isPending}>
//               {isPending ? "جارِ التحقق..." : "تسجيل الدخول"}
//             </SubmitBtn>

//             <AyahWrap>
//               <Image src={ayahSrc} alt="آية" maxH="56px" objectFit="contain" />
//             </AyahWrap>
//           </Stack>
//         </StyledFormCard>
//       </StyledMain>
//     </StyledPage>
//   );
// }



// src/Pages/LoginPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Image, Stack, Text, useToast } from "@chakra-ui/react";

import { useLogin } from "../features/Authentication/hooks/useLogin";
import LoginForm from "../features/Authentication/LoginForm";
import {
  StyledPage,
  StyledMain,
  StyledFormCard,
  HeaderStack,
  SubmitBtn,
  AyahWrap,
} from "../features/Authentication/Styles/LoginpageStyles";
import LoginSideBar from "../features/Authentication/LoginSideBar";
import type { LoginResult } from "../features/Authentication/Services/authService";

const logoSrc = "/assets/Logo.png";
const ayahSrc = "/assets/Quran.png";

// التقط اسم المكتب ورقمه من مصادر متعددة
function extractOfficeMeta(user: any) {
  const dbg = (window as any)?.__loginDebug?.picked ?? {};
  const Office_Id =
    Number(user?.Office_Id ?? user?.OfficeId ?? dbg?.Office_Id ?? dbg?.OfficeId ?? 0) || 0;

  const OfficeName =
    user?.OfficeName ??
    user?.officeName ??
    dbg?.OfficeName ??
    dbg?.officeName ??
    user?.CompanyName ??
    dbg?.CompanyName ??
    "";

  return { Office_Id, OfficeName: String(OfficeName || "").trim() };
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync, isPending } = useLogin();

  // لو في جلسة محفوظة مسبقًا وجّه مباشرة حسب الدور
  useEffect(() => {
    const auth = localStorage.getItem("auth") === "true";
    const role = localStorage.getItem("role");
    if (auth && role === "M") navigate("/maindashboard", { replace: true });
    else if (auth && role === "O") navigate("/officedashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const u = username.trim();
      const p = password;
      if (!u || !p) {
        toast({
          title: "البيانات ناقصة",
          description: "الرجاء إدخال اسم المستخدم وكلمة المرور.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        const resp = (await mutateAsync([u, p])) as LoginResult;

        if (!resp?.success || !resp.userData) {
          throw new Error(resp?.message || "اسم المستخدم أو كلمة المرور غير صحيحة.");
        }

        const user = resp.userData;
        const role = user.UserRole; // "M" أو "O"

        // ⭐ نجيب اسم المكتب ورقمه إن وُجدوا
        const { Office_Id, OfficeName } = extractOfficeMeta(user);

        // حفظ الجلسة + الدور + بيانات المستخدم (بما فيها اسم المكتب)
        localStorage.setItem("auth", "true");
        localStorage.setItem("role", role);
        localStorage.setItem("username", user.UserName ?? "");
        localStorage.setItem("userId", String(user.UserID ?? ""));
        if (OfficeName) localStorage.setItem("officeName", OfficeName); // مفتاح مباشر للهيدر

        localStorage.setItem(
          "mainUser",
          JSON.stringify({
            Id: user.UserID,
            UserId: user.UserID, // احتياط
            UserName: user.UserName,
            UserType: role, // "M" | "O"
            Office_Id, // رقم المكتب
            OfficeName, // اسم المكتب
            GroupRight_Id: (user as any)?.GroupRight_Id ?? 0,
            GroupRightName: (user as any)?.GroupRightName ?? "",
            Email: user.Email ?? "",
            PhoneNum: user.PhoneNum ?? "",
            role,
          })
        );

        toast({
          title: `مرحبًا بعودتك، ${user.UserName || "مستخدم"}!`,
          status: "success",
          duration: 1200,
          isClosable: true,
        });

        const defaultTarget = role === "M" ? "/maindashboard" : "/officedashboard";
        const from = (location.state as any)?.from?.pathname as string | undefined;
        navigate(from || defaultTarget, { replace: true });
      } catch (err: any) {
        toast({
          title: "فشل تسجيل الدخول",
          description: err?.message || "فشل غير معروف.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [username, password, mutateAsync, toast, navigate, location.state]
  );

  return (
    <StyledPage>
      <LoginSideBar />
      <StyledMain>
        <StyledFormCard as="form" onSubmit={handleSubmit}>
          <HeaderStack>
            <Image src={logoSrc} alt="Logo" h="120px" w="150px" objectFit="contain" />
            <Box textAlign="center">
              <Text mt="24px" fontSize="25px" fontWeight="700" color="gray.800" mb={1}>
                تسجيل الدخول
              </Text>
              <Text fontSize="20px" color="gray.400">
                مرحبًا بعودتك، قم بتسجيل الدخول إلى حسابك
              </Text>
            </Box>
          </HeaderStack>

          <Stack spacing="20px">
            <LoginForm
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
              isDisabled={isPending}
            />

            <SubmitBtn type="submit" disabled={isPending}>
              {isPending ? "جارِ التحقق..." : "تسجيل الدخول"}
            </SubmitBtn>

            <AyahWrap>
              <Image src={ayahSrc} alt="آية" maxH="56px" objectFit="contain" />
            </AyahWrap>
          </Stack>
        </StyledFormCard>
      </StyledMain>
    </StyledPage>
  );
}
