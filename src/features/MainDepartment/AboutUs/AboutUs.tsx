    import React from 'react';
    import { Box, Flex, Spinner, Alert, AlertIcon, Text, Heading, Card, CardBody, VStack, HStack, Icon, Link } from "@chakra-ui/react";
    import { FaPhone, FaMapMarkerAlt, FaGlobe, FaInstagram, FaFacebook } from 'react-icons/fa';
    // 🛑 استيراد الـ Hook المُعدَّل
    import { useGetAboutUs } from "./hooks/useGetAboutUs"; 

    // 🛑 المكون الرئيسي لعرض البيانات
    export default function AboutUs() {
        
        // 1. جلب البيانات من الـ Hook
        const { data, isLoading, isError, error, isFetching } = useGetAboutUs();
        
        // 🚨 الصف الأول (الوحيد) من البيانات بعد التحليل
        const contactInfo = data?.rows?.[0] ?? {}; 
        
        // 2. إدارة حالات التحميل والخطأ
        if (isLoading || isFetching) {
            return (
                <Flex justify="center" p={10}>
                    <Spinner size="xl" color="blue.500" />
                </Flex>
            );
        }

        if (isError) {
            return (
                <Alert status='error' m={6}>
                    <AlertIcon />
                    حدث خطأ أثناء جلب محتوى "من نحن": {error?.message || "خطأ في الاتصال بالخادم."}
                </Alert>
            );
        }
        
        if (!contactInfo || Object.keys(contactInfo).length === 0) {
            return (
                <Alert status='info' m={6}>
                    <AlertIcon />
                    لا توجد بيانات اتصال متاحة حاليًا.
                </Alert>
            );
        }
        
        // دالة مساعدة لعرض صف تفاصيل
        const InfoRow = ({ icon, label, value, isLink = false }: { icon: any, label: string, value: string | undefined, isLink?: boolean }) => {
            if (!value) return null;
            const displayValue = value.replace(/^https?:\/\//i, '');
            const href = isLink && !value.startsWith('http') ? `https://${value}` : value;

            return (
                <HStack spacing={4} align="start" p={3} borderBottom="1px solid" borderColor="gray.100" _last={{ borderBottom: 'none' }}>
                    <Icon as={icon} w={5} h={5} color="green.600" mt={1} />
                    <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm" color="gray.600">{label}</Text>
                        {isLink ? (
                            <Link href={href} isExternal color="blue.500" fontWeight="medium">
                                {displayValue}
                            </Link>
                        ) : (
                            <Text fontSize="md" color="gray.800">{value}</Text>
                        )}
                    </VStack>
                </HStack>
            );
        };

        // 3. عرض البيانات في بطاقة تفاصيل الاتصال
        return (
            <Box p={6}>
                <Heading as="h1" size="xl" mb={6} color="gray.700" display="flex" alignItems="center">
                    <Icon as={FaPhone} mr={3} color="green.500" />
                    بيانات التواصل (About Us)
                </Heading>

                <Card variant="outline" maxW="lg" mx="auto">
                    <CardBody p={0}>
                        <VStack spacing={0} align="stretch" divider={<Divider orientation='horizontal' />}>
                            
                            <InfoRow 
                                icon={FaPhone} 
                                label="رقم الهاتف" 
                                value={contactInfo.PhoneNum} 
                            />
                            
                            <InfoRow 
                                icon={FaMapMarkerAlt} 
                                label="العنوان" 
                                value={contactInfo.Address} 
                            />
                            
                            <InfoRow 
                                icon={FaGlobe} 
                                label="الموقع الإلكتروني" 
                                value={contactInfo.WebSite} 
                                isLink={true} 
                            />
                            
                            <InfoRow 
                                icon={FaFacebook} 
                                label="فيسبوك" 
                                value={contactInfo.FaceBook} 
                                isLink={true} 
                            />
                            
                            <InfoRow 
                                icon={FaInstagram} 
                                label="إنستغرام" 
                                value={contactInfo.Instegram} 
                                isLink={true} 
                            />

                        </VStack>
                    </CardBody>
                </Card>
            </Box>
        );
    }