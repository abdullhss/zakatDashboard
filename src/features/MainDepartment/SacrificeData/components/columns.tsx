// src/features/sacrifices/table/columns.tsx
import React from "react";
import { Text, VStack, Switch } from "@chakra-ui/react";
import type { AnyRec } from "../../../../api/apiClient";
import type { SacrificeRow } from "../helpers/types";
import { formatLYD } from "../helpers/types";

export function buildColumns() {
  return [
    {
      key: "Name",
      header: "اسم النوع",
      render: (r: AnyRec) => (
        <Text fontWeight="600" color="gray.700">
          {(r as SacrificeRow).Name}
        </Text>
      ),
    },
    {
      key: "Price",
      header: "السعر",
      align: "right",
      render: (r: AnyRec) => (
        <Text color="gray.700">{formatLYD((r as SacrificeRow).Price)}</Text>
      ),
    },
    {
      key: "IsActive",
      header: "الحالة",
      align: "center",
      render: (r: AnyRec) => {
        const row = r as SacrificeRow;
        return (
          <VStack align="right">
            {/* <Switch isChecked={row.IsActive} isReadOnly /> */}
            <Text as="span" color="gray.600">
              {row.IsActive ? "مفعل" : "غير مفعل"}
            </Text>
          </VStack>
        );
      },
    },
  ];
}
