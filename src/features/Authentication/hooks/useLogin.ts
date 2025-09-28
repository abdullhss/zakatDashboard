// src/features/Authentication/hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { CheckMainUserLogin } from "../../Authentication/Services/authService";
import type { LoginResult } from "../../Authentication/Services/authService";

export const useLogin = () => {
  return useMutation<LoginResult, Error, [string, string]>({
    mutationFn: async ([username, password]) => {
      const result = await CheckMainUserLogin(username, password);
      // 👈 لا ترمي Error هنا
      return result; // هنقرّر في الصفحة
    },
    mutationKey: ["login"],
  });
};
