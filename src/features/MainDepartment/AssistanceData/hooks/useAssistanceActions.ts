import { useToast } from "@chakra-ui/react";
import useUpdateAssistanceData from "../hooks/useUpdateAssistanceData";
import { DATA_TOKEN, POINT_ID } from "../helpers/constants";

/**
 * الموافقة/الرفض يتطلبان attachmentId (PDF) + ApprovedDate إجباريًا.
 * عمود الملف يُحفظ داخل الخدمة باسم ResreachFileName حسب الدوكيومنتيشن.
 */
export function useAssistanceActions(refetch?: () => void) {
  const toast = useToast();
  const updateTx = useUpdateAssistanceData();

  /** موافقة مع مرفق */
  const approve = async (id: number | string, attachmentId: string) => {
    try {
      await updateTx.mutateAsync({
        id,
        isApproved: true,
        approvedDate: new Date(),     // إلزامي
        dataToken: DATA_TOKEN,
        pointId: POINT_ID,
        attachmentId,                 // يُخزن في ResreachFileName داخل الخدمة
      });
      toast({ title: "تمت الموافقة على الطلب", status: "success", duration: 1200 });
      refetch?.();
    } catch (e: any) {
      toast({ title: "فشل الموافقة", description: e?.message, status: "error" });
      throw e;
    }
  };

  /** رفض مع مرفق */
  const reject = async (id: number | string, attachmentId: string) => {
    try {
      await updateTx.mutateAsync({
        id,
        isApproved: false,
        approvedDate: new Date(),     // الدوكيومنتيشن يتطلب تاريخ حتى في الرفض
        dataToken: DATA_TOKEN,
        pointId: POINT_ID,
        attachmentId,                 // يُخزن في ResreachFileName داخل الخدمة
      });
      toast({ title: "تم رفض الطلب", status: "warning", duration: 1200 });
      refetch?.();
    } catch (e: any) {
      toast({ title: "فشل الرفض", description: e?.message, status: "error" });
      throw e;
    }
  };

  return { approve, reject, isPending: updateTx.isPending };
}

export default useAssistanceActions;
