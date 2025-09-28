
import { Box, Heading, SimpleGrid, VStack } from '@chakra-ui/react';

import StatsCard from '../Components/HomeStatesCard/StatsCard'; 
import DashboardCharts from '../Components/DashboardCharts/Charts'; 

const StatsContainer = (props :any) => (
    <Box
        p={8} 
        borderRadius="xl" 
        border="1px solid" 
        borderColor="gray.200" 
        backgroundSize="8px 8px"
        bg="white"
        boxShadow="sm"
width="90%"
margin= "auto   "
        {...props}
    />
);


export default function HomePage() {
    
    const statsData = [
    { title: "إجمالي للموظفين", value: "12", unit: "موظف", type: "employees" },
    { title: "إجمالي القيم المستلمة", value: "2,500,000", unit: "دينار", type: "value" },
            { title: "إجمالي عدد العمليات", value: "5,200", unit: "عملية", type: "operations" },
    ];

    return (
        <VStack spacing={8} align="stretch" > {/* ⬅️ المحاذاة الرئيسية RTL */}
            
            {/* 1. منطقة الإحصائيات */}
            <Box>
                {/* عنوان القسم (ملخص الإحصائيات) */}
                <Heading 
                    as="h2" 
                    size="20px" 
                    fontWeight="bold" 
                    color="#707070" 
                    mb={4} 
                >
                    ملخص الإحصائيات
                </Heading>
                
                <StatsContainer>
                    <SimpleGrid 
                        columns={{ base: 1, md: 3, lg: 3 }} // ⬅️ تم تصحيح الـ md: 3
                        spacing={6}
                    >
                        {statsData.map((stat, index) => (
                            <StatsCard 
                                key={index}
                                title={stat.title}
                                value={stat.value}
                                unit={stat.unit}
                                type={stat.type}
                            />
                        ))}
                    </SimpleGrid>
                </StatsContainer>
            </Box>

            <DashboardCharts /> 
            
        </VStack>
    );
}