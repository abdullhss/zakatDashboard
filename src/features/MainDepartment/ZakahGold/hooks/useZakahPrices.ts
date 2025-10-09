// src/features/Zakah/hooks/useUpdateZakahPrice.ts
import { useMutation } from "@tanstack/react-query";
import {
  updateZakahPrice,
  updateGold24Price,
  updateSilverPrice,
} from "../services/zakahPrices";

/** تحديث عام (تمرير id=4 للذهب أو 5 للفضة) */
export function useUpdateZakahPrice() {
  return useMutation({
    mutationFn: updateZakahPrice,
  });
}

/** شورتكَت: ذهب 24 */
export function useUpdateGold24Price() {
  return useMutation({
    mutationFn: (price: number | string) => updateGold24Price(price),
  });
}

/** شورتكَت: فضة */
export function useUpdateSilverPrice() {
  return useMutation({
    mutationFn: (price: number | string) => updateSilverPrice(price),
  });
}
