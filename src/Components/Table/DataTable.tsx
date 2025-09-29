// src/components/Table/DataTable.tsx
import React from "react";
import {
  Table, Thead, Tbody, Tr, Flex, Heading, Box,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Text, Switch
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { AnyRec, DataTableProps } from "./TableTypes";
import { TableCardContainer, TableHeader, TableHeadCell, TableDataCell, ROW_H } from "./TableStyles";

type ExtraProps = {
  onEditRow?: (row: AnyRec, index: number) => void;
  onDeleteRow?: (row: AnyRec, index: number) => void;
  renderActions?: (row: AnyRec, index: number) => React.ReactNode;
  totalRows?: number;
  stickyHeader?: boolean;
};

export const DataTable: React.FC<DataTableProps & ExtraProps> = ({
  title, data, columns, headerAction, startIndex = 1,
  onEditRow, onDeleteRow, renderActions, totalRows, stickyHeader = true,
}) => {
  const hasActions = !!(renderActions || onEditRow || onDeleteRow);
  const shownFrom = data.length ? startIndex : 0;
  const shownTo   = data.length ? startIndex + data.length - 1 : 0;
  const total     = typeof totalRows === "number" ? totalRows : data.length;

  return (
    <TableCardContainer>
      <TableHeader>
        <Heading size="md" fontWeight="700" color="gray.700">{title}</Heading>
        <Box>{headerAction}</Box>
      </TableHeader>

      <Box overflowX="auto">
        {/* نستخدم variant="elevated" اللي جهّزناه في الثيم */}
        <Table variant="elevated" size="sm" sx={{
          "tbody tr": {
            _odd:  { bg: "background.stripe" },
            _hover:{ bg: "background.hover" },
            transition: "background 120ms ease",
          }
        }}>
          <Thead
            bg="background.subtle"
            position={stickyHeader ? "sticky" : undefined}
            top={0}
            zIndex={1}
          >
            <Tr>
              <TableHeadCell width="48px">#</TableHeadCell>
              {columns.map(col => (
                <TableHeadCell key={col.key} width={col.width}>
                  {col.header}
                </TableHeadCell>
              ))}
              {hasActions && <TableHeadCell width="64px">إجراءات</TableHeadCell>}
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row: AnyRec, index) => (
              <Tr key={row.id ?? index}>
                <TableDataCell fontWeight="700" color="gray.700">
                  {startIndex + index}
                </TableDataCell>

                {columns.map(col => (
                  <TableDataCell key={col.key}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </TableDataCell>
                ))}

                {hasActions && (
                  <TableDataCell>
                    <Flex justify="flex-end">
                      {renderActions ? (
                        renderActions(row, index)
                      ) : (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="خيارات"
                            icon={<BsThreeDotsVertical />}
                            variant="brandGhost"
                            boxSize={ROW_H}
                            minW={ROW_H}
                          />
                          <MenuList>
                            <MenuItem onClick={() => onEditRow?.(row, index)} isDisabled={!onEditRow}>تعديل</MenuItem>
                            <MenuItem color="red.500" onClick={() => onDeleteRow?.(row, index)} isDisabled={!onDeleteRow}>حذف</MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </Flex>
                  </TableDataCell>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Flex justify="space-between" align="center" mt={3} px={1}>
        <Box />
  
      </Flex>
    </TableCardContainer>
  );
};
