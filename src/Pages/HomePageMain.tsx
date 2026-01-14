
import { Box, Heading, Select, SimpleGrid, VStack } from '@chakra-ui/react';

import StatsCard from '../Components/HomeStatesCard/StatsCard'; 
import DashboardCharts from '../Components/DashboardCharts/Charts'; 
import { useEffect, useState } from 'react';
import { executeProcedure } from '../api/apiClient';

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
    const [statsData1, setStatsData] = useState<any>({
        WeeklyPayments: [],
        ActionsPayments: [],
        EmployeesCount: 0,
        TotalReceivedValues: 0,
        TotalReceivedValuesToday: 0,
        TotalTransactionsCount: 0,
      });
    const [officeId , setOfficeId] = useState<null | number>(null);
    const [allOffices , setAllOffices] = useState<any[]>([]);
    useEffect(() => {
        const getOffices = async () => {
            const response = await executeProcedure("eTcJ/vnBezzSD18bWEaw1PQzCrDtz1E9ZsA2hLVgjhU=", "0#1#10000");
            console.log(response);
            
            setAllOffices(JSON.parse(response.decrypted?.data?.Result[0].OfficesData) || []);
        }
        getOffices();
    }, []);
    

    const mainuser = JSON.parse(localStorage.getItem("mainUser") || "null") ;
    useEffect(() => {
        if (!mainuser) return;
    
        if (mainuser.role === "M") {
        setOfficeId(-1);
        } else {
        setOfficeId(mainuser.Office_Id);
        }
    }, []);

    useEffect(() => {
        if (officeId === null) return;

        const getStatsData = async () => {
            const response = await executeProcedure(
            "SDzK3NU+KnRw1A6l8udHoQ==",
            `${officeId}`
            );

            const result = response.decrypted?.data?.Result?.[0];

            if (!result) return;

            setStatsData({
            ActionsPayments: JSON.parse(result.ActionsPayments || "[]"),
            EmployeesCount: JSON.parse(result.EmployeesCount || "0"),
            TotalReceivedValues: JSON.parse(result.TotalReceivedValues || "0"),
            TotalReceivedValuesToday: JSON.parse(result.TotalReceivedValuesToday || "0"),
            TotalTransactionsCount: JSON.parse(result.TotalTransactionsCount || "0"),
            WeeklyPayments: JSON.parse(result.WeeklyPayments || "[]"),
            });
        };

        getStatsData();
    }, [officeId]);

    console.log(statsData1);
 
  const statsData = [
    { title: "إجمالي للموظفين", value: statsData1.EmployeesCount, unit: "موظف", type: "employees" },
    { title: "إجمالي القيم المستلمة", value: statsData1.TotalReceivedValues, unit: "دينار", type: "value" },
    { title: "إجمالي عدد العمليات", value: statsData1.TotalTransactionsCount, unit: "عملية", type: "operations" },
    { title: "إجمالي القيم المستلمة اليوم", value: statsData1.TotalReceivedValuesToday, unit: "دينار", type: "value" },
];
console.log(statsData1.WeeklyPayments);
const weeklyPaymentsData = statsData1.WeeklyPayments?.map(
    (item: any, index: number) => ({
      name: item.DayName,
      value: item.WeeklyPayment,
      color: index % 2 === 0 ? "#07574f" : "#E9B949",
    })
  ) || [];

  const colors = [
    "#07574F", // أخضر غامق
    "#E9B949", // ذهبي
    "#2B6CB0", // أزرق
    "#9F7AEA", // بنفسجي
    "#ED8936", // برتقالي
    "#38B2AC", // تركواز
    "#E53E3E", // أحمر
    "#4A5568", // رمادي غامق
    "#319795", // أخضر مائل للأزرق
    "#DD6B20", // برتقالي غامق
  ];
  

  const pieChartData = statsData1.ActionsPayments?.map(
    (item: any, index: number) => ({
      name: item.ActionName,
      value: item.percentValue,
      color: colors[index],
    })
    ) || [];


  return (
    <VStack spacing={8} align="stretch" > 
      
      {/* 1. منطقة الإحصائيات */}
      <Box>
        {/* عنوان القسم (ملخص الإحصائيات) */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Heading 
            as="h2" 
            size="20px" 
            fontWeight="bold" 
            color="#707070" 
            mb={4}
            px={10}
            py={3} 
            style={{textWrap:"nowrap"}}
            >
                ملخص الإحصائيات
            </Heading>
            {
                mainuser.role === "M" && (
                    <Select px={3} style={{width:"250px"}} onChange={(e) => setOfficeId(Number(e.target.value))} value={officeId}>
                        <option key={-1} value={-1}>الكل</option>
                        {allOffices.map((office) => (
                            <option key={office.Id} value={office.Id}>{office.OfficeName}</option>
                        ))}
                    </Select>
                )
            }
        </Box>
        
        <StatsContainer>
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 4 }} // ⬅️ تم تصحيح الـ md: 3
            spacing={4}
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

      <DashboardCharts isMainUser={mainuser.role === "M"} pieChartData={pieChartData} weeklyPaymentsData={weeklyPaymentsData} /> 
            
    </VStack>
  );
}