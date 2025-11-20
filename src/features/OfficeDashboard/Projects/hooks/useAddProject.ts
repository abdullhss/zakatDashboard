import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProject, type AddProjectInput } from "../Services/addProject";
import { useToast } from "@chakra-ui/react";

export function useAddProject() {
  const qc = useQueryClient();
  const toast = useToast() ;
  
  return useMutation({
    mutationKey: ["projects", "add"],
    mutationFn: async (payload: AddProjectInput) => {
      const res = await addProject(payload);
      console.log(res);
      
      if (res.code == 207) {
        toast({
          title:"فشلت الاضافة",
          status:"error",
          description:"هذا المشروع موجود من قبل"
        })
        return
        // throw new Error(res.error || "Add project failed");
      }
      return res;
    },
    onSuccess: () => {
      // لو عندك كاش لقائمة المشاريع
      qc.invalidateQueries({ queryKey: ["projects"] }).catch(() => {});
    },
  });
}
