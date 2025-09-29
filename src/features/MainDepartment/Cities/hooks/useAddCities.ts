// src/features/.../hooks/useAddCity.ts
import { useMutation } from "@tanstack/react-query";
import { addCity } from "../Services/addCities";
import type { CityInput } from "../Services/addCities";

export function useAddCity() {
  return useMutation({
    mutationFn: (input: CityInput) => addCity(input),
  });
}
