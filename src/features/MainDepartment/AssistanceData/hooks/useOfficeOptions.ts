import type { AnyRec } from "../../../../Components/Table/TableTypes";

export function useOfficeOptions(rows?: AnyRec[]) {
  const opts = [
    { id: 0, name: "كل المكاتب" },
    ...(rows ?? []).map((r: AnyRec) => ({
      id: r.id ?? r.Id,
      name: r.companyName ?? r.OfficeName ?? `مكتب #${r.id ?? r.Id}`,
    })),
  ];
  const nameById = new Map<string | number, string>();
  opts.forEach((o) => nameById.set(o.id, o.name));
  return { officeOptions: opts, officeNameById: nameById };
}
