// src/components/StatsCard.jsx

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
// استخدام أيقونات مطابقة للتصميم قدر الإمكان
import { FiUsers, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

// دالة لتحديد الأيقونة بناءً على النوع
const getIcon = (type :any) => {
    switch (type) {
        case 'employees':
            return FiUsers;
        case 'value':
            return FiDollarSign;
        case 'operations':
            return FiBarChart2;
        default:
            return FiBarChart2;
    }
};

// التدرج اللوني الذي يظهر في تصميم Figma (لون side في الثيم)
const ICON_GRADIENT = "linear-gradient(to top, var(--chakra-colors-side-c), var(--chakra-colors-side-a))";


export default function StatsCard({ title, value, unit, type } :any) {
    const CardIcon = getIcon(type);

    return (
        <Box
            bg="white"
            borderRadius="xl" 

            boxShadow="md"
            // تباعد داخلي كبير: (30px في التصميم)
            p={6} 
            flex="1" 
            minW="250px"
        >
            <Flex 
                justifyContent="space-between" 
                alignItems="center" 
                h="100px" // لضبط ارتفاع البطاقة
            >
                
                {/* 1. قسم الأيقونة (على اليسار في RTL) */}
                <Flex
                    // حجم الأيقونة: 48px
                    w="48px"
                    h="48px"
                    borderRadius="md" // حواف دائرية خفيفة
                    justifyContent="center"
                    alignItems="center"
                    backgroundImage={ICON_GRADIENT}
                    boxShadow="lg"
                    flexShrink={0} // لضمان عدم تقلص حجمها
                >
                    <Icon as={CardIcon} boxSize={5} color="white" />
                </Flex>

                {/* 2. قسم النص (على اليمين في RTL) */}
                <Flex 
                    direction="column" 
                    alignItems="flex-start" 
                    alignSelf="flex-end'"
                    textAlign="right"

                    // التباعد بين النص والأيقونة
                    ml={4} 
                    mr={0}
                >
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        {title}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>
                        {value} <Text as="span" fontSize="lg" fontWeight="normal" color="gray.600">{unit}</Text>
                    </Text>
                </Flex>
            </Flex>
        </Box>
    );
}