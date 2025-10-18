import { useMutation } from "@tanstack/react-query";
import { updateOffice, type UpdateOfficePayload } from "../Services/updateOffice";

export default function useUpdateOffice() {
  return useMutation({
    mutationFn: (p: UpdateOfficePayload) => updateOffice(p),
  });
}
