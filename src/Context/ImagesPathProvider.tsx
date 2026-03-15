import { useState } from "react";
import { ImagesPathContext } from "./ImagesPathContext";

const IMAGES_PATH_STORAGE_KEY = "appImagesPath";

function getStoredImagesPath(): string | undefined {
  try {
    const stored = sessionStorage.getItem(IMAGES_PATH_STORAGE_KEY);
    return stored ?? undefined;
  } catch {
    return undefined;
  }
}

export const ImagesPathProvider = ({ children }: any) => {
  const [imagesPath, setImagesPath] = useState<string | undefined>(getStoredImagesPath);

  const setImagesPathAndStore = (value: string | undefined) => {
    setImagesPath(value);
    try {
      if (value != null) sessionStorage.setItem(IMAGES_PATH_STORAGE_KEY, value);
      else sessionStorage.removeItem(IMAGES_PATH_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <ImagesPathContext.Provider value={{ imagesPath, setImagesPath: setImagesPathAndStore }}>
      {children}
    </ImagesPathContext.Provider>
  );
};
