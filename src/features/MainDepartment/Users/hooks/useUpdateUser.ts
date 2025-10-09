import { useState } from "react";
import { updateUser, type UpdateUserInput } from "../Services/updateUser";

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: UpdateUserInput) => {
    setLoading(true);
    try {
      const res = await updateUser(payload);
      if ((res as any)?.error) throw new Error((res as any).error || "تعذّر التحديث");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { loading, submit };
}
