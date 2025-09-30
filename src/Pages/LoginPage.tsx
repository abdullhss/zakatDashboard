// src/Pages/LoginPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Image, Stack, Text, useToast } from "@chakra-ui/react";
import { useLogin } from "../features/Authentication/hooks/useLogin";
import LoginForm from "../features/Authentication/LoginForm";
import {
  StyledPage, StyledMain, StyledFormCard, HeaderStack, SubmitBtn, AyahWrap,
} from "../features/Authentication/Styles/LoginpageStyles";
import LoginSideBar from "../features/Authentication/LoginSideBar";

const logoSrc = "/assets/Logo.png";
const ayahSrc = "/assets/Quran.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync, isPending } = useLogin();

  // ✅ ما نحولش إلا لو فيه auth=true ودور صحيح
  useEffect(() => {
    const auth = localStorage.getItem("auth") === "true";
    const role = localStorage.getItem("role");
    if (auth && role === "M") navigate("/maindashboard", { replace: true });
    else if (auth && role === "O") navigate("/officedashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const u = username.trim();
    const p = password;
    if (!u || !p) {
      toast({ title: "البيانات ناقصة", description: "الرجاء إدخال اسم المستخدم وكلمة المرور.", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    try {
      const resp: any = await mutateAsync([u, p]);
      const user =
        resp?.userData ??
        resp?.row ??
        (Array.isArray(resp?.rows) ? resp.rows[0] : null) ??
        resp?.data?.row ??
        (Array.isArray(resp?.data?.rows) ? resp.data.rows[0] : null);

      if (!user) throw new Error(resp?.message || "بيانات غير صالحة.");

      const role = String(user?.UserRole ?? user?.UserType ?? "").toUpperCase();
      if (role !== "M" && role !== "O") throw new Error("دور غير معروف.");

      // ✅ خزّن علامة الجلسة + الدور
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", role);
      if (user?.UserName) localStorage.setItem("username", String(user.UserName));
      const id = user?.UserID ?? user?.Id;
      if (id != null) localStorage.setItem("userId", String(id));

      toast({ title: `مرحبًا بعودتك، ${user?.UserName || "مستخدم"}!`, status: "success", duration: 1200, isClosable: true });

      const target = role === "M" ? "/maindashboard" : "/officedashboard";
      const from = (location.state as any)?.from?.pathname as string | undefined;
      navigate(from || target, { replace: true });
    } catch (err: any) {
      toast({ title: "فشل تسجيل الدخول", description: err?.message || "فشل غير معروف.", status: "error", duration: 5000, isClosable: true });
    }
  }, [username, password, mutateAsync, toast, navigate, location.state]);

  return (
    <StyledPage>
      <LoginSideBar />
      <StyledMain>
        <StyledFormCard as="form" onSubmit={handleSubmit}>
          <HeaderStack>
            <Image src={logoSrc} alt="Logo" h="120px" w="150px" objectFit="contain" />
            <Box textAlign="center">
              <Text mt="24px" fontSize="25px" fontWeight="700" color="gray.800" mb={1}>تسجيل الدخول</Text>
              <Text fontSize="20px" color="gray.400">مرحبًا بعودتك، قم بتسجيل الدخول إلى حسابك</Text>
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
