// src/components/DashboardCharts.jsx

import { Box, Flex, Heading, SimpleGrid, Button, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiChevronDown } from 'react-icons/fi'; 

// ===================================
// 1. البيانات
// ===================================

// بيانات الرسم البياني الدائري ("الخدمات")
const pieData = [
  { name: 'للمشاريع', value: 400, color: '#00A896' }, // تركواز فاتح
  { name: 'الصدقات', value: 350, color: '#03645F' },  // أخضر داكن (أغمق)
  { name: 'الزكاة', value: 250, color: '#17343B' },   // أزرق بحري داكن (الأغمق)
];

// بيانات الرسم البياني العمودي ("إجمالي المبالغ") - بيانات عشوائية للأيام
// يجب أن نبدأ بالسبت (على اليمين) وننتهي بالخميس (على اليسار) في المحور
const barData = [
  { name: 'السبت', uv: 5.5 },
  { name: 'الجمعة', uv: 7 },
  { name: 'الخميس', uv: 10 },
  { name: 'الأربعاء', uv: 4 },
  { name: 'الثلاثاء', uv: 8 },
  { name: 'الاثنين', uv: 9 },
  { name: 'الأحد', uv: 6 },
];


// ===================================
// 2. مُكوّن الحاوية الأساسي
// ===================================

const ChartContainer = (props:any) => (
    <Box
        bg="white"
        p={6}
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        h="450px" 
w="450px"
margin="auto"
            {...props}
    />
);

// ===================================
// 3. مُكوّن الرسم البياني الدائري (PieChartSection)
// ===================================

export const PieChartSection = () => (
    <ChartContainer>
        <Heading size="md" fontWeight="bold" color="gray.800" mb={4} textAlign="center">
            الخدمات
        </Heading>
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={80} 
                    paddingAngle={3}
                    style={{ 
                        filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))',
                    }} 
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false} 
                >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} /> 
                    ))}
                </Pie>
                
                {/* Legend مُخصص ليتناسب مع تصميم Figma */}
                <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="square" 
                    wrapperStyle={{ paddingTop: '20px' }}
                    content={({ payload }) => (
                        <Flex justify="center" mt={4} dir="rtl"> {/* ⬅️ إضافة dir="rtl" هنا */}
                            {payload.map((entry, index) => (
                                <Flex 
                                    key={`item-${index}`} 
                                    align="center" 
                                    mx={3}
                                >
                                    <Box w="10px" h="10px" bg={entry.color} mr={2} borderRadius="sm" />
                                    <Text fontSize="sm" color="gray.600">{entry.value}</Text>
                                </Flex>
                            ))}
                        </Flex>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    </ChartContainer>
);

// ===================================
// 4. مُكوّن الرسم البياني العمودي (BarChartSection)
// ===================================

const BarChartSection = () => (
    <ChartContainer>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md" fontWeight="bold" color="gray.800">
                إجمالي المبالغ
            </Heading>
            {/* أزرار التحكم في الرسم البياني (بستايل مطابق للتصميم) */}
            <Flex gap={2}>
                <Button 
                    rightIcon={<FiChevronDown />} 
                    size="sm" 
                    bg="#17343B" // ⬅️ لون داكن مطابق للتصميم
                    color="white" 
                    _hover={{ bg: "#0f1f23" }}
                    borderRadius="md"
                >
                    للكتب
                </Button>
                <Button 
                    rightIcon={<FiChevronDown />} 
                    size="sm" 
                    bg="#17343B" // ⬅️ لون داكن مطابق للتصميم
                    color="white" 
                    _hover={{ bg: "#0f1f23" }}
                    borderRadius="md"
                >
                    شهري
                </Button>
            </Flex>
        </Flex>

        <ResponsiveContainer width="100%" height={370}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" /> 
                
                {/* محور X (الأيام) - تم عكسه ليعرض "السبت" أولاً على اليمين */}
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} reversed={true} /> 
                
                {/* محور Y (المبالغ) */}
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                
                <Tooltip /> 
                
                {/* الأعمدة */}
                <Bar 
                    dataKey="uv" 
                    fill="#00A896" // اللون التركواز الداكن
                    radius={[5, 5, 0, 0]} 
                    barSize={30}
                />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
);

// ===================================
// 5. المكون الذي يجمع الرسوم البيانية معاً
// ===================================

export default function DashboardCharts() {
    return (
        // ⬅️ عكس ترتيب المكونات ليتطابق مع تصميم Figma
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <BarChartSection /> {/* ⬅️ أصبح على اليمين */}
            <PieChartSection /> {/* ⬅️ أصبح على اليسار */}
        </SimpleGrid>
    );
}