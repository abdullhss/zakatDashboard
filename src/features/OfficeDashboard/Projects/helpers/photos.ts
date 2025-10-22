export const ZAKAT_IMAGES_BASE =
  "https://framework.md-license.com:8093/ZakatImages";

export const buildProjectPhotoUrl = (
  id?: string | number,
  ext: string = ".jpg"
) => (id ? `${ZAKAT_IMAGES_BASE}/${id}${ext}` : "");
