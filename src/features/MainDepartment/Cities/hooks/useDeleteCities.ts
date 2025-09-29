// src/features/Cities/hooks/useDeleteCity.ts
import { useMutation } from "@tanstack/react-query";
import { deleteCity } from "../Services/deleteCities";

export function useDeleteCity() {
  return useMutation({
    mutationFn: (id: number | string) => deleteCity(id),
  });
}
