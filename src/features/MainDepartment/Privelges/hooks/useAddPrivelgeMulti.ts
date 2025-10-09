import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGroupRightWithFeatures,
  type AddGroupRightWithFeaturesPayload,
} from "../Services/addPrivelgeMulti";

export function useAddGroupRightWithFeatures() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AddGroupRightWithFeaturesPayload) => addGroupRightWithFeatures(p),
    onSuccess: () => {
      // امسح كل كاش متعلق بالصلاحيات مهما كانت مفاتيحه الفرعية
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "privileges",
      });
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "groupRights",
      });
    },
  });
}
