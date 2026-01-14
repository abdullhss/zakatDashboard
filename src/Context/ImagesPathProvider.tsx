import { useState } from "react";
import { ImagesPathContext } from "./ImagesPathContext";

export const ImagesPathProvider = ({ children }: any) => {
  const [imagesPath, setImagesPath] = useState<string>();

  return (
    <ImagesPathContext.Provider value={{ imagesPath, setImagesPath }}>
      {children}
    </ImagesPathContext.Provider>
  );
};
