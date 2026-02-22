// src/features/sacrifices/utils/mapApiRows.ts
import type { AnyRec } from "../../../../api/apiClient";
import type { SacrificeRow } from "./types";

export function mapApiRowsToSacrificeRows(sourceRows: AnyRec[]): SacrificeRow[] {
  return sourceRows.map((r) => ({
    Id: r.Id ?? r.SacrificeTypeId ?? r.TypeId ?? r.Code ?? r.id ?? r.code ?? Math.random().toString(36).slice(2),
    Name: (r.SacrificeTypeName ?? r.TypeName ?? r.Name ?? r.name ?? "—") as string,
    Price: r.SacrificeTypePrice != null ? Number(r.SacrificeTypePrice) : null,
    IsActive: (r.IsActive === 'T' || r.isActive === 'T' || r.IsActive === true),
    SacrificeCategory_Id: r.SacrificeCategory_Id != null ? Number(r.SacrificeCategory_Id) : null,
  }));
}



export function pickTotalRows(data: any, fallbackLen: number): number {
  if (typeof data?.totalRows === "number") return data.totalRows;
  const cnt =
    data?.row?.SacrificeTypesCount ??
    data?.row?.sacrificetypescount ??
    data?.row?.TotalRowsCount ??
    data?.row?.totalRowsCount;
  const n = Number(cnt);
  return Number.isFinite(n) ? n : fallbackLen;
}
