import { useToast } from "@chakra-ui/react";
import useUpdateAssistanceData from "./useUpdateAssistanceData";
import { DATA_TOKEN, POINT_ID } from "../helpers/constants";

export function useAssistanceActions(refetch?: () => void) {
  const toast = useToast();
  const updateTx = useUpdateAssistanceData();

  const approve = async (id: number | string) => {
    try {
      await updateTx.mutateAsync({
        id,
        isApproved: true,
        approvedDate: new Date(),
        dataToken: DATA_TOKEN,
        pointId: POINT_ID,
      });
      toast({ title: "تمت الموافقة على الطلب", status: "success", duration: 1200 });
      refetch?.();
    } catch (e: any) {
      toast({ title: "فشل الموافقة", description: e?.message, status: "error" });
    }
  };

  const reject = async (id: number | string) => {
    try {
      await updateTx.mutateAsync({
        id,
        isApproved: false,
        approvedDate: null,
        dataToken: DATA_TOKEN,
        pointId: POINT_ID,
      });
      toast({ title: "تم رفض الطلب", status: "warning", duration: 1200 });
      refetch?.();
    } catch (e: any) {
      toast({ title: "فشل الرفض", description: e?.message, status: "error" });
    }
  };

  return { approve, reject, isPending: updateTx.isPending };
}
