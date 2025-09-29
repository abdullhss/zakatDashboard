import { useMutation } from "@tanstack/react-query";
import { updateCity, type UpdateCityInput } from "../Services/updateCities";

export function useUpdateCities() {
  return useMutation({
    mutationKey: ["cities", "update"],
    mutationFn: (payload: UpdateCityInput) => updateCity(payload),
  });
}
