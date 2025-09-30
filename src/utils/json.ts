// src/utils/json.ts
export function safeJSONParse<T = any>(value: string): T | string | null {
  try {
    // حاول تعمل parse
    return JSON.parse(value);
  } catch {
    // مش JSON → رجعه زي ما هو
    return value || null;
  }
}
