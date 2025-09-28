import {
  Table,
  Thead,
  Tbody,
  Tr,
  Checkbox,
  Flex,
  Heading,
  Box,
  Menu, // تمت إضافته
  MenuButton, // تمت إضافته
  MenuList, // تمت إضافته
  MenuItem, // تمت إضافته
  IconButton, // تمت إضافته
  Text, // تمت إضافته
} from "@chakra-ui/react";
import React from "react";
import { BsThreeDotsVertical } from 'react-icons/bs'; // تمت إضافته
import type { AnyRec, DataTableProps } from "./TableTypes";
import { TableCardContainer, TableHeader, TableHeadCell, TableDataCell } from "./TableStyles";

export const DataTable: React.FC<DataTableProps> = ({
  title, data, columns, headerAction, startIndex = 1,
}) => {
  return (
    <TableCardContainer>
      <TableHeader>
        <Heading size="md" fontWeight="600" color="gray.700">
          {title}
        </Heading>
        <Box>{headerAction}</Box>
      </TableHeader>

      <Box overflowX="auto">
        <Table variant="unstyled" size="sm">
          {/* === تم تطبيق الخلفية الرمادية (#E5E9EA) على الـ Thead بالكامل === */}
          <Thead bg="#E5E9EA"> 
            <Tr>
              {/* الترقيم # */}
              <TableHeadCell width="20px">#</TableHeadCell> 
              {/* Checkbox */}
              <TableHeadCell width="40px"><Checkbox /></TableHeadCell> 
              
              {/* الأعمدة المخصصة */}
              {columns.map(col => (
                <TableHeadCell key={col.key} width={col.width}>
                  {col.header}
                </TableHeadCell>
              ))}
              
              {/* الإجراءات */}
              <TableHeadCell width="50px">إجراءات</TableHeadCell>
            </Tr>
          </Thead>
          
          <Tbody>
            {data.map((row: AnyRec, index) => (
              // استخدمنا row.id كـ key إذا كان موجودًا، وإلا استخدمنا index
              <Tr key={row.id ?? index} _hover={{ bg: "gray.50" }}> 
                
                {/* الترقيم # */}
                <TableDataCell fontWeight="bold" color="gray.600">
                  {startIndex + index}
                </TableDataCell>
                
                {/* Checkbox */}
                <TableDataCell><Checkbox /></TableDataCell>
                
                {/* عرض البيانات */}
                {columns.map(col => (
                  <TableDataCell key={col.key}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </TableDataCell>
                ))}
                
                {/* عمود الإجراءات (Menu Button) */}
                <TableDataCell>
                  <Flex justify="flex-end">
                    {/* إضافة Menu كاملًا */}
                    <Menu>
                      <MenuButton
                          as={IconButton}
                          aria-label='خيارات'
                          icon={<BsThreeDotsVertical />}
                          variant='ghost'
                          size='sm'
                      />
                      <MenuList>
                          <MenuItem>تعديل</MenuItem>
                          <MenuItem color="red.500">حذف</MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </TableDataCell>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* شريط الترقيم */}
      <Flex justify="flex-end" align="center" mt={4} pr={4}>
        <Text color="gray.600" fontSize="sm">
            عرض 1-{Math.min(data.length, 8)} من {data.length} سجل
        </Text>
      </Flex>
    </TableCardContainer>
  );
};