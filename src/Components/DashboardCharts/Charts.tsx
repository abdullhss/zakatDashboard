// src/components/DashboardCharts.jsx

import { Box, Flex, Heading, SimpleGrid, Button, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiChevronDown } from 'react-icons/fi'; 
import { useEffect, useState } from 'react';
import { executeProcedure } from '../../api/apiClient';

// ===================================
// 1. البيانات
// ===================================

// بيانات الرسم البياني الدائري ("الخدمات")
const pieData = [
  { name: 'للمشاريع', value: 400, color: '#0b564fff' }, // تركواز فاتح
  { name: 'الصدقات', value: 350, color: '#0d8a83ff' },  
  { name: 'الزكاة', value: 250, color: '#17343B' },   
];


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
                    label={({ percent }) => `${(percent  * 100).toFixed(0)}%`}
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
)

const BarChartSection = () => {
  const [startDate , setStartDate] = useState("") ;
  const [endDate , setEndDate] = useState("") ;
  const [data,setData] = useState() ; 
  useEffect(()=>{
    const getData = async ()=>{
      const response = await executeProcedure("yBUHpivA07MokXA71F71ZWk5iSjoHXCRV6bL7GgxGPA=",`${startDate}#${endDate}`);
      setData(response.rows)
    }
    getData() ;
  },[])
  const chartData = data?.map(item => ({
  name: `${item.OfficeName}`,
  zakat: item.TotalZakat,
  sadaka: item.TotalSadaka,
}));

  return(
        <ChartContainer w="65vw">
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md" fontWeight="bold" color="gray.800">
                  إجمالي المبالغ
              </Heading>
              {/* أزرار التحكم في الرسم البياني (بستايل مطابق للتصميم) */}
  {/*             <Flex gap={2}>
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
              </Flex> */}
          </Flex>

        <Box overflowX="auto">
        <Box minW={`${chartData?.length * 80}px`}>
          <ResponsiveContainer width="100%" height={370}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                padding={{ left: 30, right: 30 }}
                style={{ fontSize: "12px" }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                style={{ fontSize: "12px" }}
              />

              <Tooltip />

              <Bar
                dataKey="zakat"
                name="الزكاة"
                fill="#07574f"
                radius={[5, 5, 0, 0]}
                barSize={25}
              />

              <Bar
                dataKey="sadaka"
                name="الصدقة"
                fill="#E9B949"
                radius={[5, 5, 0, 0]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        </Box>
      </ChartContainer>
  )
};


export default function DashboardCharts() {
    return (
        // ⬅️ عكس ترتيب المكونات ليتطابق مع تصميم Figma
        <SimpleGrid>
            <BarChartSection />
            {/* <PieChartSection /> */}
        </SimpleGrid>
    );
}