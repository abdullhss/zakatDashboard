import { useMutation } from "@tanstack/react-query";
import { deleteSubventionType } from "../Services/deleteSubvention";


export function useDeleteSubventionType() {

  return useMutation({
    mutationFn: (id: number | string) => deleteSubventionType(id),

  });
}