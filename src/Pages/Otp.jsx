import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ExecuteAuthentication } from '../api/apiClient';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Input,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";

const EnterOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds countdown
  const [canResend, setCanResend] = useState(false);
    const toast = useToast();

  // Countdown timer effect with navigation when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
      // Navigate to home when timer finishes
      const navigateTimer = setTimeout(() => {
        navigate("/");
        localStorage.removeItem("TransToken")
      }, 1000);
      return () => clearTimeout(navigateTimer);
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, navigate]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key down for backspace and navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp(newOtp);
      
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    } else {
      toast({
        title: "خطأ",
        description: "الرجاء لصق رمز مكون من 6 أرقام",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
        });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const TransToken = localStorage.getItem("TransToken")
        
        const otpString = otp.join('');
        
        const response = await ExecuteAuthentication(TransToken , otpString);
        
        console.log(response.success);
        
        if(response.success == 200){
            toast({
            title: "تم بنجاح",
            description: "تم تغير كلمه المرور بنجاح",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
            });

            navigate("/login")
        }
    } catch (error) {
      console.error("OTP verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrowseAsVisitor = () => {
    navigate("/");
    localStorage.removeItem("TransToken")
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate circle progress (for circular timer)
  const radius = 35; // Increased radius for bigger timer
  const circumference = 2 * Math.PI * radius;
  const progress = ((90 - timeLeft) / 90) * circumference;

  // Determine timer color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 30) {
      return "#EF4444"; // Red color for last 30 seconds
    }
    return "#24645E"; // Original color for first 60 seconds
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.95 },
    hover: { scale: 1.02 }
  };

  const otpContainerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const otpInputVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <>
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <Flex minH="100vh" direction={{ base: "column", lg: "row" }} dir="rtl">
            {/* OTP Form */}
            <Flex w="100%" lg={{ w: "50%" }} align="center" justify="center" p={8}>
            <Box w="100%" maxW="xl">

                {/* Header */}
                <VStack spacing={4} mb={8} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold">
                    التحقق من الرمز
                </Text>

                <Text color="gray.500">
                    أدخل الرمز المكون من 6 أرقام المرسل إلى هاتفك
                </Text>

                {/* Circular Timer */}
                <Box position="relative">
                    <svg
                    width="120"
                    height="120"
                    viewBox="0 0 80 80"
                    style={{ transform: "rotate(-90deg)" }}
                    >
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="#E5E7EB"
                        strokeWidth="4"
                        fill="transparent"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke={getTimerColor()}
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                    />
                    </svg>

                    <Flex
                    position="absolute"
                    inset={0}
                    direction="column"
                    align="center"
                    justify="center"
                    >
                    <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={timeLeft <= 30 ? "red.500" : "gray.700"}
                    >
                        {formatTime(timeLeft)}
                    </Text>

                    {timeLeft <= 30 && (
                        <Text fontSize="xs" color="red.500">
                        متبقي وقت قليل
                        </Text>
                    )}
                    </Flex>
                </Box>
                </VStack>

                {/* Form */}
                <VStack
                as="form"
                spacing={8}
                onSubmit={handleSubmit}
                >

                {/* OTP Inputs */}
                <HStack spacing={3} dir="ltr">
                    {otp.map((digit, index) => (
                    <motion.input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        variants={otpInputVariants}
                        style={{
                        width: "56px",
                        height: "56px",
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        border: digit ? "2px solid #24645E" : "2px solid #CBD5E0",
                        backgroundColor: digit ? "#ECFDF5" : "#fff",
                        outline: "none",
                        }}
                    />
                    ))}
                </HStack>

                {/* Buttons */}
                <VStack spacing={3} w="100%">
                    <Button
                    type="submit"
                    w="100%"
                    isDisabled={otp.join("").length !== 6 || isSubmitting}
                    bgGradient="linear(to-r, #24645E, #18383D, #17343B)"
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    >
                    {isSubmitting ? "جاري التحقق..." : "تحقق من الرمز"}
                    </Button>

                    <Button
                    variant="outline"
                    w="100%"
                    onClick={handleBrowseAsVisitor}
                    >
                    تصفح كزائر
                    </Button>
                </VStack>

                </VStack>
            </Box>
            </Flex>
        </Flex>
        </motion.div>
    </>
  );
};

export default EnterOTP;