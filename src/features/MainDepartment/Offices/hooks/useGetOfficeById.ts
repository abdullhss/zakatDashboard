import { useQuery } from "@tanstack/react-query";
import { doTransaction } from "../../../../api/apiClient";
import { OFFICE_TABLE } from "../Services/updateOffice";

export function useGetOfficeById(id?: string | number) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ["office", id],
    queryFn: async () => {
      const res = await doTransaction({
        TableName: OFFICE_TABLE,
        WantedAction: 2, // Select (عدّل حسب سيرفرك)
        ColumnsNames: "Id",
        ColumnsValues: String(id),
        PointId: 0,
      });
      const row = res?.decrypted?.data?.Result?.[0] ?? {};
      return {
        id: row.Id,
        officeName: row.OfficeName,
        phoneNum: row.PhoneNum,
        cityId: row.City_Id,
        address: row.Address,
        isActive: row.IsActive === 1 || row.IsActive === true,
        officeLatitude: row.OfficeLatitude ?? "",
        officeLongitude: row.OfficeLongitude ?? "",
        officePhotoName: row.OfficePhotoName ?? "",
      };
    },
  });
}
