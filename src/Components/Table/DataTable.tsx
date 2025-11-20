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
  Tfoot,
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
  /** ✅ صف الإجماليات الاختياري */
  totals?: Record<string, React.ReactNode>;
};

export const DataTable: React.FC<DataTableProps & ExtraProps> = ({
  title,
  data,
  columns,
  headerAction,
  startIndex = 1,
  onEditRow,
  onDeleteRow,
  renderActions,
  totalRows,
  stickyHeader = true,
  page,
  pageSize,
  onPageChange,
  viewHashTag = true,
  totals,
  runEdit = false,
  canEditTitle = false ,
  handleChangeTitle,
  updatedTitle ,
  setUpdatedTitle
}) => {
  const hasActions = !!(renderActions || onEditRow || onDeleteRow);
  const total = typeof totalRows === "number" ? totalRows : data.length;
  const hasTotals = totals && Object.keys(totals).length > 0;

  return (
    <TableCardContainer w="100%">
      {/* Header */}
      <TableHeader>
        {
          !canEditTitle ?
          (<Heading size="md" fontWeight="700" color="gray.700">
            {title}
          </Heading>) : (
            <div>
              <input type="text" defaultValue={updatedTitle} onChange={(e)=>{setUpdatedTitle(e.target.value)}} style={{fontWeight:600 , fontSize:"1.4rem" , padding:"2px 8px" , border:"1px solid #CCC" , borderRadius:"6px" ,}}>
              
              </input>
              <button onClick={()=>{handleChangeTitle()}} style={{color:"#FFF" , padding:"8px" , borderRadius:"4px" , margin:"0px 16px" , backgroundColor:"#1B5853"}}>
                تعديل الاسم
              </button>
            </div>
          )
        }
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
              {viewHashTag && (
                <TableHeadCell fontSize={18} textAlign="center">
                  #
                </TableHeadCell>
              )}
              {columns.map((col) => (
                <TableHeadCell
                  key={col.key}
                  textAlign="start"
                  fontSize={18}
                  width={col.width}
                >
                  {col.header}
                </TableHeadCell>
              ))}
              {hasActions && (
                <TableHeadCell fontSize={18} width="64px">
                  إجراءات
                </TableHeadCell>
              )}
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row: AnyRec, index) => (
              <Tr key={(row as any).id ?? index}>
                {viewHashTag && (
                  <TableDataCell fontWeight="700" color="gray.700">
                    {startIndex + index}
                  </TableDataCell>
                )}
                {columns.map((col) => (
                  <TableDataCell
                    fontWeight="500"
                    fontSize={16}
                    textAlign="start"
                    key={col.key}
                  >
                    {col.render ? col.render(row, index) : (row as any)[col.key]}
                  </TableDataCell>
                ))}
                {hasActions && (
                  <TableDataCell>
                    <Flex justify="flex-end">
                      {renderActions ? (
                        renderActions(row, index)
                      ) : (
                        <Menu placement="bottom-end" isLazy>
                          <MenuButton
                            as={IconButton}
                            aria-label="إجراءات"
                            icon={<BsThreeDotsVertical />}
                            size="sm"
                            variant="brandOutline"
                            onClick={
                              ()=>{
                                    if(runEdit && onEditRow){
                                      onEditRow(row, index)
                                  }
                                  else{
                                    (e) => e.stopPropagation()
                                  }
                                }
                              }
                          />
                          { !(runEdit && onEditRow) &&<MenuList>
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
                          </MenuList>}
                        </Menu>
                      )}
                    </Flex>
                  </TableDataCell>
                )}
              </Tr>
            ))}
          </Tbody>

          {/* ✅ إجمالي القيم */}
          {hasTotals && (
            <Tfoot>
              <Tr bg="background.subtle">
                {viewHashTag && <TableDataCell></TableDataCell>}
                {columns.map((col) => (
                  <TableDataCell
                    key={col.key}
                    fontWeight="700"
                    fontSize={16}
                    textAlign="start"
                    color="gray.800"
                  >
                    {totals[col.key] ?? ""}
                  </TableDataCell>
                ))}
                {hasActions && <TableDataCell></TableDataCell>}
              </Tr>
            </Tfoot>
          )}
        </Table>
      </Box>

      {/* Footer */}
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
