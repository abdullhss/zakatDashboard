
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Image,
  Stack,
  Text,
  useToast, 
} from "@chakra-ui/react";

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

const logoSrc = "/assets/Logo.png";
const ayahSrc = "/assets/Quran.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const { mutate, isLoading } = useLogin();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!username || !password) {
        toast({
          title: "البيانات ناقصة",
          description: "الرجاء إدخال اسم المستخدم وكلمة المرور.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      mutate([username, password], {
        onSuccess: (data) => {
          toast({
            title: `مرحبًا بعودتك، ${data.userData?.UserName || 'مستخدم'}!`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          navigate('/dashboard'); 
        },
        onError: (err: any) => {
          const message = err.message || "حدث خطأ غير متوقع في الاتصال.";
          toast({
            title: "فشل تسجيل الدخول",
            description: message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        },
      });
    },
    [username, password, mutate, toast, navigate]
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
                isDisabled={isLoading}
            />
            
            <SubmitBtn 
                type="submit" 
                isLoading={isLoading} 
                loadingText="جارِ التحقق..."
            >
                تسجيل الدخول
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