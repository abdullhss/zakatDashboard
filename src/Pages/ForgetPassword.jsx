import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RequireAuthentication } from "../api/apiClient";
import { useToast } from "@chakra-ui/react";
import { FiPhone, FiEye, FiEyeOff } from "react-icons/fi";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  IconButton,
} from "@chakra-ui/react";

// Validation schema
const forgetSchema = z.object({
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .regex(/^09[0-9]{8}$/, "رقم الهاتف يجب أن يبدأ بـ 09 ويحتوي على 10 أرقام"),

  newPassword: z
    .string()
    .min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),

  confirmNewPassword: z
    .string()
    .min(6, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmNewPassword"],
});


const ForgetPassword = () => {
    const navigate = useNavigate();
    const [phoneValue, setPhoneValue] = useState("09");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    
    const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(forgetSchema),
    defaultValues: {
      phone: "09",
    },
  });

  // Handle phone input changes
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    // Force start with "09"
    if (!value.startsWith("09")) {
      value = "09" + value.replace(/^09/, "");
    }

    // Limit to 10 digits
    if (value.length > 10) value = value.slice(0, 10);

    setPhoneValue(value);
    setValue("phone", value, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      const response = await RequireAuthentication(
        "5k/BC+JJntFYBhrRWnHg7wS+aNtfcnZQI0/hTAjd6p8=",
        "0uDqb2KIbyhs7RT5Yq/WxzJW9hWxVEKASbgBdm47lmA=",
        `${data.phone}#${data.newPassword}`,
        "Sms",
        data.phone
      );
      console.log(`${data.phone}#${data.newPassword}`);
      console.log(response);
      
      if (response.success == 200) {
        localStorage.setItem("TransToken", response.TransToken);
        toast({
        title: "تم بنجاح",
        description: "تم إرسال رمز التحقق بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
        });
        navigate("/otp");
      } else {
        toast({
        title: "خطأ",
        description: response.error,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
        });
      }
    } catch (error) {
        toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال رمز الاستعادة",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
        });
      console.error(error);
    }
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <Flex minH="100vh" direction={{ base: "column", lg: "row" }} dir="rtl">
            {/* Form */}
            <Flex w="100%" lg={{ w: "50%" }} align="center" justify="center" p={8}>
            <Box w="100%" maxW="md">

                {/* Header */}
                <VStack spacing={3} mb={8} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold">
                    استعادة كلمة المرور
                </Text>
                <Text color="gray.500">
                    أدخل رقم هاتفك لإرسال رمز التحقق
                </Text>
                </VStack>

                {/* Form */}
                <VStack
                as="form"
                spacing={6}
                onSubmit={handleSubmit(onSubmit)}
                >

                {/* Phone */}
                <Box w="100%">
                    <Text mb={2}>رقم الهاتف *</Text>

                    <Box position="relative">
                    <Input
                        {...register("phone")}
                        value={phoneValue}
                        onChange={handlePhoneChange}
                        type="tel"
                        placeholder="09xxxxxxxx"
                        pr="3rem"
                        isInvalid={!!errors.phone}
                    />

                    <Box position="absolute" right="10px" top="50%" transform="translateY(-50%)">
                        <FiPhone color="gray" />
                    </Box>
                    </Box>

                    {errors.phone && (
                    <Text mt={2} fontSize="sm" color="red.500">
                        {errors.phone.message}
                    </Text>
                    )}
                </Box>

                {/* New Password */}
                <Box w="100%">
                    <Text mb={2}>كلمة السر الجديدة *</Text>

                    <Box position="relative">
                    <Input
                        {...register("newPassword")}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="أدخل كلمة السر الجديدة"
                        pr="3rem"
                        isInvalid={!!errors.newPassword}
                    />

                    <IconButton
                        aria-label="toggle password"
                        icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                        position="absolute"
                        right="6px"
                        top="50%"
                        transform="translateY(-50%)"
                        variant="ghost"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                    </Box>

                    {errors.newPassword && (
                    <Text mt={2} fontSize="sm" color="red.500">
                        {errors.newPassword.message}
                    </Text>
                    )}
                </Box>

                {/* Confirm Password */}
                <Box w="100%">
                    <Text mb={2}>تأكيد كلمة السر *</Text>

                    <Box position="relative">
                    <Input
                        {...register("confirmNewPassword")}
                        type={showConfirmNewPassword ? "text" : "password"}
                        placeholder="أعد إدخال كلمة السر"
                        pr="3rem"
                        isInvalid={!!errors.confirmNewPassword}
                    />

                    <IconButton
                        aria-label="toggle password"
                        icon={showConfirmNewPassword ? <FiEyeOff /> : <FiEye />}
                        position="absolute"
                        right="6px"
                        top="50%"
                        transform="translateY(-50%)"
                        variant="ghost"
                        onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                        }
                    />
                    </Box>

                    {errors.confirmNewPassword && (
                    <Text mt={2} fontSize="sm" color="red.500">
                        {errors.confirmNewPassword.message}
                    </Text>
                    )}
                </Box>

                {/* Submit */}
                <Button
                    type="submit"
                    w="100%"
                    color="white"
                    isLoading={isSubmitting}
                    bgGradient="linear(to-r, #24645E, #18383D, #17343B)"
                    _hover={{ opacity: 0.9 }}
                >
                    إرسال رمز التحقق
                </Button>

                {/* Back */}
                <Text
                    cursor="pointer"
                    color="gray.500"
                    _hover={{ color: "teal.600" }}
                    onClick={() => navigate("/login")}
                >
                    العودة إلى تسجيل الدخول
                </Text>

                </VStack>
            </Box>
            </Flex>
        </Flex>
    </motion.div>

  );
};

export default ForgetPassword;