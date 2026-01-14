import { HStack, Text } from "@chakra-ui/react";
import type { AnyRec, Column } from "../../../../Components/Table/TableTypes";
import type { CampaignRow } from "../utils/types";
import ActionButtons from "../../../../Components/SharedButton/ActionButtons";
import { isOffice } from "../../../../session";
import { useImagesPathContext } from "../../../../Context/ImagesPathContext";

type Args = {
  hasOfficeInfo: boolean;
  updatePending: boolean;
  busyRowId: React.MutableRefObject<CampaignRow["Id"] | null>;
  onApprove: (row: AnyRec) => void;
  onReject: (row: AnyRec) => void;
};

export function createCampaignColumns({
  hasOfficeInfo,
  updatePending,
  busyRowId,
  onApprove,
  onReject,
}: Args): Column[] {
  const { imagesPath } = useImagesPathContext();
  const baseCols: Column[] = [
    {
      key: "CampaignName",
      header: "اسم الحملة",
      width: "20%",
      render: (r: AnyRec) => (
        <Text fontWeight="600" color="gray.700">
          {(r as CampaignRow).CampaignName ?? "—"}
        </Text>
      ),
    },
    {
      key: "CampaignType",
      header: "نوع الحملة",
      width: "10%",
      render: (r: AnyRec) => (r as CampaignRow).CampaignType ?? "—",
    },
    {
      key: "WantedAmount",
      header: "المبلغ المستهدف",
      width: "12%",
      render: (r: AnyRec) => (r as CampaignRow).WantedAmount ?? "—",
    },
    {
      key: "CampaignRemainingAmount",
      header: "المبلغ المتبقي",
      width: "12%",
      render: (r: AnyRec) => (r as CampaignRow).CampaignRemainingAmount ?? "—",
    },
    {
      key: "UserName",
      header: "اسم المستخدم",
      width: "12%",
      render: (r: AnyRec) => (r as CampaignRow).UserName ?? "—",
    },
    {
      key: "",
      header: "عرض الصورة",
      width: "12%",
      render: (r: AnyRec) => {
        return <a style={{color:"#005599"}} target="_blank" href={`${imagesPath}/${r.CampaignPhotoName}.jpg`}>
          عرض
        </a>;
      },
    },
    {
      key: "CreatedDate",
      header: "تاريخ الانشاء",
      width: "12%",
      render: (r: AnyRec) => {
        const d = (r as CampaignRow).CreatedDate;
        const dateVal = typeof d === "string" || d instanceof Date ? new Date(d) : null;
        return d && dateVal ? dateVal.toLocaleDateString("en") : "—";
      },
    },
  ];

  const officeCol: Column[] =
    (!isOffice() && hasOfficeInfo)
      ? [{
          key: "Office",
          header: "المكتب",
          width: "10%",
          render: (r: AnyRec) => {
            const rr = r as CampaignRow;
            return rr.OfficeName ?? rr.Office_Id ?? "—";
          },
        }]
      : [];

  const actionsCol: Column = {
    key: "__actions",
    header: "الإجراء",
    width: "12%",
    render: (r: AnyRec) => {
      const rr = r as CampaignRow;
      const busy = busyRowId.current === rr.Id && updatePending;
      return (
        <HStack spacing="8px">
          <ActionButtons
            row={r}
            onApprove={onApprove}
            onReject={onReject}
            disabled={updatePending}
            busy={busy}
          />
        </HStack>
      );
    },
  };

  return [...baseCols.slice(0, 1), ...officeCol, ...baseCols.slice(1), actionsCol];
}
