import React, { useState, useEffect } from 'react';
import { Box, HStack, Text, Input, useToast } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import { executeProcedure, doTransaction } from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 100;

const OutFitrTable = () => {
    const mainUser = JSON.parse(localStorage.getItem("mainUser"));
    const officeId = mainUser.Office_Id;
    const navigate = useNavigate();
    const toast = useToast();

    const [outFitrData, setOutFitrData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    
    // Date format: MM-DD-YYYY
    const [outputDate, setOutputDate] = useState(
        new Date().toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
        }).replace(/\//g, '-')
    );
    
    const [page, setPage] = useState(1);
    const offset = (page - 1) * PAGE_SIZE;

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await executeProcedure(
                "6Ww2MAzg8cD417291n9vSrUwlrvN8CKiL/0Qsa7Ntti6pbzwWDAHpneN4E06t32z",
                `${officeId}#${outputDate}#${offset + 1}#${PAGE_SIZE}`
            );
            
            console.log("API Response:", response);
            
            if (response.decrypted.data.Result[0]) {
                const parsed = JSON.parse(response.decrypted.data.Result[0].ZakatFitrOfficeOutputItemsData);
                setOutFitrData(parsed);
                setTotalRows(Number(response.decrypted.data.Result[0].ZakatFitrOfficeOutputItemsCount || 0));
            } else {
                setOutFitrData([]);
                setTotalRows(0);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({
                title: "خطأ",
                description: "فشل في تحميل البيانات",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, outputDate]);

    const columns = [
        { 
            key: "Id", 
            header: "رقم العملية", 
            render: (r) => r.Id,
            width: "100px"
        },
        { 
            key: "OutDate", 
            header: "تاريخ الصرف", 
            render: (r) => {
                // Format date for display
                const date = new Date(r.OutDate);
                return date.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        },
        { 
            key: "actions", 
            header: "تفاصيل",
            render: (r, index) => (
                <SharedButton
                    variant="brandOutline"
                    size="sm"
                    onClick={() => navigate(`/officedashboard/fitrOutput/details/${r.Id}`)}
                >
                    عرض التفاصيل
                </SharedButton>
            )
        }
    ];

    const handleDateChange = (e) => {
        // Convert YYYY-MM-DD (input type="date" format) to MM-DD-YYYY
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) {
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric' 
            }).replace(/\//g, '-');
            setOutputDate(formattedDate);
            setPage(1); // Reset to first page when changing date
        }
    };

    const handleAddNew = () => {
        navigate("/officedashboard/OutFitrZakat");
    };

    // Format date for input field (YYYY-MM-DD)
    const getInputDateValue = () => {
        const [month, day, year] = outputDate.split('-');
        return `${year}-${month}-${day}`;
    };

    return (
        <Box>
            <DataTable
                title="سجل صرف زكاة الفطر"
                data={outFitrData}
                columns={columns}
                totalRows={totalRows}
                loading={loading}
                page={page}
                startIndex={offset + 1}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                headerAction={
                    <HStack spacing={3}>
                        <Box>
                            <Text fontSize="sm" mb={1} color="gray.600">
                                تاريخ الصرف:
                            </Text>
                            <Input
                                type="date"
                                value={getInputDateValue()}
                                onChange={handleDateChange}
                                width="200px"
                                size="sm"
                            />
                        </Box>
                        <SharedButton
                            variant="brandGradient"
                            onClick={handleAddNew}
                        >
                            إضافة صرف جديد
                        </SharedButton>
                    </HStack>
                }
            />

            {!loading && (!outFitrData || outFitrData.length === 0) && (
                <Text mt={3} color="gray.500" textAlign="center">
                    لا توجد عمليات صرف في هذا التاريخ.
                </Text>
            )}
        </Box>
    );
};

export default OutFitrTable;