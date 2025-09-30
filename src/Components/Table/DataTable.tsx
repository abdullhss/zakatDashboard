// src/components/Table/DataTable.tsx
import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Flex,
  Heading,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

import type { AnyRec, DataTableProps } from "./TableTypes";
import {
  TableCardContainer,
  TableHeader,
  TableHeadCell,
  TableDataCell,
  ROW_H,
} from "./TableStyles";

import Pagination from "./Pagination";

type ExtraProps = {
  onEditRow?: (row: AnyRec, index: number) => void;
  onDeleteRow?: (row: AnyRec, index: number) => void;
  renderActions?: (row: AnyRec, index: number) => React.ReactNode;
  totalRows?: number;
  stickyHeader?: boolean;
};

export const DataTable: React.FC<DataTableProps & ExtraProps> = ({
  title,
  data,
  columns,
  headerAction,
  startIndex = 1,

  // actions
  onEditRow,
  onDeleteRow,
  renderActions,

  // totals
  totalRows,

  // UX
  stickyHeader = true,

  // pagination (اختياري)
  page,
  pageSize,
  onPageChange,
}) => {
  const hasActions = !!(renderActions || onEditRow || onDeleteRow);

  // أرقام العرض أسفل الجدول
  const shownFrom = data.length ? startIndex : 0;
  const shownTo = data.length ? startIndex + data.length - 1 : 0;
  const total = typeof totalRows === "number" ? totalRows : data.length;

  return (
    <TableCardContainer>
      {/* Header */}
      <TableHeader>
        <Heading size="md" fontWeight="700" color="gray.700">
          {title}
        </Heading>
        <Box>{headerAction}</Box>
      </TableHeader>

      {/* Table */}
      <Box overflowX="auto">
        <Table
          variant="elevated"
          size="sm"
          sx={{
            "tbody tr": {
              _odd: { bg: "background.stripe" },
              _hover: { bg: "background.hover" },
              transition: "background 120ms ease",
            },
          }}
        >
          <Thead
            bg="background.subtle"
            position={stickyHeader ? "sticky" : undefined}
            top={0}
            zIndex={1}
          >
            <Tr>
              <TableHeadCell width="48px">#</TableHeadCell>

              {columns.map((col) => (
                <TableHeadCell key={col.key} width={col.width}>
                  {col.header}
                </TableHeadCell>
              ))}

              {hasActions && <TableHeadCell width="64px">إجراءات</TableHeadCell>}
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row: AnyRec, index) => (
              <Tr key={(row as any).id ?? index}>
                {/* numbering */}
                <TableDataCell fontWeight="700" color="gray.700">
                  {startIndex + index}
                </TableDataCell>

                {/* data cells */}
                {columns.map((col) => (
                  <TableDataCell key={col.key}>
                    {col.render ? col.render(row, index) : (row as any)[col.key]}
                  </TableDataCell>
                ))}

                {/* actions */}
                {hasActions && (
                  <TableDataCell>
                    <Flex justify="flex-end">
                      {renderActions ? (
                        renderActions(row, index)
                      ) : (
                        <Menu placement="bottom-end" isLazy>
                          <MenuButton
                            as={IconButton}
                            aria-label="خيارات"
                            icon={<BsThreeDotsVertical />}
                            variant="ghost"
                            border="none"
                            boxSize={ROW_H}
                            minW={ROW_H}
                            _hover={{ bg: "blackAlpha.50" }}
                            _active={{ bg: "blackAlpha.100" }}
                          />
                          <MenuList>
                            <MenuItem
                              onClick={() => onEditRow?.(row, index)}
                              isDisabled={!onEditRow}
                            >
                              تعديل
                            </MenuItem>
                            <MenuItem
                              color="red.500"
                              onClick={() => onDeleteRow?.(row, index)}
                              isDisabled={!onDeleteRow}
                            >
                              حذف
                            </MenuItem>
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

      {/* Footer: left (info) — right (pagination) */}
      <Flex justify="space-between" align="center" mt={3} px={1}>
    

        {page && pageSize && onPageChange && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalRows={total}
            onPageChange={onPageChange}
            maxVisible={5}
          />
        )}
      </Flex>
    </TableCardContainer>
  );
};

export default DataTable;
