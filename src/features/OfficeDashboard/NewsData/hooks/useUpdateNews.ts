// src/features/MainDepartment/News/hooks/useUpdateNewsData.ts
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  updateNewsData,
  type UpdateNewsPayload,
} from "../Services/updateNewsData";
import type { NormalizedSummary } from "../../../../api/apiClient";

export function useUpdateNewsData(): UseMutationResult<
  NormalizedSummary,
  Error,
  UpdateNewsPayload
> {
  const queryClient = useQueryClient();

  return useMutation<NormalizedSummary, Error, UpdateNewsPayload>({
    mutationFn: updateNewsData,
    mutationKey: ["news:update"],
    onSuccess: (_data, variables) => {

      queryClient.invalidateQueries({ queryKey: ["news-dashboard"] });
 
    },
  });
}
