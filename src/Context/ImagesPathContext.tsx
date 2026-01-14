import { createContext, useContext } from "react";

export const ImagesPathContext = createContext<any>(null);

export const useImagesPathContext = () => {
  return useContext(ImagesPathContext);
};
