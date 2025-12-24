import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Box, Image, Stack, Text, useToast } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

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

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  }
};

const logoVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: 0.2,
      duration: 0.8
    }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4 + (i * 0.1),
      duration: 0.5
    }
  })
};

const buttonVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
  loading: {
    scale: [1, 1.02, 1],
    transition: {
      repeat: Infinity,
      duration: 1
    }
  }
};

const ayahVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.8,
      duration: 0.6
    }
  }
};

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

// Create animated components
const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionText = motion(Text);
const MotionSubmitBtn = motion(SubmitBtn);
const MotionAyahWrap = motion(AyahWrap);
const MotionStyledFormCard = motion(StyledFormCard);

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);

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
        setIsSubmitting(false);
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

        const defaultTarget = role === "M" ? "/maindashboard" : "/officedashboard/privelgesOffice";
        const from = (location.state as any)?.from?.pathname as string | undefined;
        
        // Add a small delay for smooth transition
        setTimeout(() => {
          navigate(from || defaultTarget, { replace: true });
        }, 500);
        
      } catch (err: any) {
        toast({
          title: "فشل تسجيل الدخول",
          description: err?.message || "فشل غير معروف.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
      }
    },
    [username, password, mutateAsync, toast, navigate, location.state]
  );

  return (
    <MotionBox
      as={motion.div}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      <StyledPage>
        <LoginSideBar />
        <StyledMain>
          <MotionStyledFormCard 
            as="form" 
            onSubmit={handleSubmit}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <HeaderStack>
              <MotionImage 
                src={logoSrc} 
                alt="Logo" 
                h="120px" 
                w="150px" 
                objectFit="contain"
                variants={logoVariants}
                initial="hidden"
                animate="visible"
              />
              <MotionBox textAlign="center">
                <MotionText 
                  mt="24px" 
                  fontSize="25px" 
                  fontWeight="700" 
                  color="gray.800" 
                  mb={1}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  تسجيل الدخول
                </MotionText>
                <MotionText 
                  fontSize="20px" 
                  color="gray.400"
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  مرحبًا بعودتك، قم بتسجيل الدخول إلى حسابك
                </MotionText>
              </MotionBox>
            </HeaderStack>

            <Stack spacing="20px">
              <LoginForm
                username={username}
                password={password}
                setUsername={setUsername}
                setPassword={setPassword}
                isDisabled={isPending || isSubmitting}
              />

              <MotionSubmitBtn 
                type="submit" 
                disabled={isPending || isSubmitting}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                animate={isPending || isSubmitting ? "loading" : "initial"}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isPending || isSubmitting ? "loading" : "default"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isPending || isSubmitting ? "جارِ التحقق..." : "تسجيل الدخول"}
                  </motion.span>
                </AnimatePresence>
              </MotionSubmitBtn>

              <MotionAyahWrap
                variants={ayahVariants}
                initial="hidden"
                animate="visible"
              >
              </MotionAyahWrap>
              <Link to="/forgetPassword">
                <Text fontSize="14px" color="blue.500" textAlign="center" cursor="pointer">
                  هل نسيت كلمة المرور؟
                </Text>
              </Link>
                <Image src={ayahSrc} alt="آية" maxH="56px" objectFit="contain" />
            </Stack>
          </MotionStyledFormCard>
        </StyledMain>
      </StyledPage>
    </MotionBox>
  );
}