import React, { useEffect, useState } from 'react';
import {
  Select,
  Box,
  VStack,
  Text,
  Spinner,
  Button,
  SimpleGrid
} from "@chakra-ui/react";
import { doTransaction, executeProcedure } from '../../../api/apiClient';
import { DataTable } from "../../../Components/Table/DataTable";

const PAGE_LIMIT = 10;

const Notification = () => {
  const {userId , officeId} = getCurrentUserId(); 
  const [readStatus, setReadStatus] = useState(0); // 0=الكل, 1=غير مقروء, 2=مقروء
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

const NOTIFICATION_COLUMNS = [
  {
    key: "CreatedDate",
    header: "التاريخ",
    render: (row) => row.CreatedDate || "-"
  },
  {
    key: "Notification",
    header: "الإشعار",
    wrap: true,
    render: (row) => row.Notification || "-"
  },
  {
    key: "IsRead",
    header: "الحالة",
    render: (row) => (
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text>{row.IsRead == 1 ? "غير مقروء" : "مقروء"}</Text>
        {row.IsRead == 1 && (
          <Button
            size="sm"
            colorScheme="green"
            ml={2}
            onClick={async () => {
              await markAsRead(row.Id);
              fetchNotifications();
            }}
          >
            علّم كمقروء
          </Button>
        )}
      </Box>
    )
  }
];

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const startIndex = (page - 1) * PAGE_LIMIT + 1;
      const params = `${officeId}#${readStatus}#${startIndex}#${PAGE_LIMIT}`;
      const response = await executeProcedure(
        "7lQMHI4BiW1BZAGFF/tnbhU400WJH4V6KH3CLkJ6F70=",
        params
      );

      const result = response.decrypted.data.Result[0];
      setTotalCount(Number(result.OfficeNotificationsCount));
      setNotifications(result.OfficeNotificationsData 
        ? JSON.parse(result.OfficeNotificationsData) 
        : []);
    } finally {
      setLoading(false);
    }
  };
  const markAsRead = async (id) =>{
    const response = await doTransaction({
      TableName:"fya6qf8aVD784IB8iLXV9ndiDvh8nB0ReeOG9Qtbgqg=",
      ColumnsNames:"Id#IsRead#ReadDate#Readby",
      ColumnsValues:`${id}#2#default#${userId}`,
      WantedAction:"1",
    })
  }

  useEffect(() => {
    fetchNotifications();
  }, [page, readStatus]); // لما الصفحة أو الفلتر يتغير

  return (
    <Box p={5}>
      {/* فلتر الحالة */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Box>
          <Text mb={1}>حالة الإشعار</Text>
          <Select
            placeholder="اختر الحالة"
            value={readStatus}
            px={3}
            onChange={(e) => setReadStatus(Number(e.target.value))}
          >
            <option value={0}>الكل</option>
            <option value={1}>غير مقروء</option>
            <option value={2}>مقروء</option>
          </Select>
        </Box>

        {/* <Box display="flex" alignItems="flex-end">
          <Button
            width="100%"
            onClick={() => setPage(1)} // إعادة الصفحة للواحد عند البحث
          >
            بحث
          </Button>
        </Box> */}
      </SimpleGrid>

      {/* الجدول */}
      {loading ? (
        <Box mt={10} display="flex" justifyContent="center">
          <Spinner size="xl" thickness="4px" />
        </Box>
      ) : notifications.length > 0 ? (
        <Box mt={6}>
          <DataTable
            title="الإشعارات"
            data={notifications}
            columns={NOTIFICATION_COLUMNS}
            page={page}
            pageSize={PAGE_LIMIT}
            onPageChange={setPage}
            totalRows={totalCount}
            startIndex={(page - 1) * PAGE_LIMIT + 1}
          />
        </Box>
      ) : (
        <Text mt={6} fontSize="20px" textAlign="center" w="full">
          لا توجد إشعارات
        </Text>
      )}
    </Box>
  );
};

export default Notification;

function getCurrentUserId() {
  try {
    const keys = ["mainUser", "MainUser", "user", "auth", "login"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const Office_Id = obj?.Office_Id;
      const UserId = obj?.UserId;
      return {
        userId : UserId, officeId:Office_Id
      }
    }
  } catch {}
  return 1;
}
