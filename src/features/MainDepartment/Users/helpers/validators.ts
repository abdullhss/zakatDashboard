export const normalizePhone = (raw: string) => raw.replace(/[^\d+]/g, "");

export function isValidLibyaPhone(raw: string): boolean {
  const s = normalizePhone(raw);
  if (/^0(91|92|94)\d{7}$/.test(s)) return true;
  if (/^\+218(91|92|94)\d{7}$/.test(s)) return true;
  if (/^00218(91|92|94)\d{7}$/.test(s)) return true;
  return false;
}

export const isValidEmail = (e: string) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e.trim());

export const strongPassword = (p: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/.test(p);
