// src/features/MainDepartment/News/hooks/useNewsData.ts
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  addNewsData,
  type AddNewsPayload,
} from "../Services/addNewsData";
import type { NormalizedSummary } from "../../../../api/apiClient";

export function useAddNewsData(): UseMutationResult<
  NormalizedSummary,
  Error,
  AddNewsPayload
> {
  const queryClient = useQueryClient();

  return useMutation<NormalizedSummary, Error, AddNewsPayload>({
    mutationFn: addNewsData,
    mutationKey: ["news:add"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-dashboard"] });
    },
  });
}
