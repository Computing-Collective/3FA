import { useState, useCallback } from "react";

/**
 * Crops the image to the aspect ratio in initialParams
 **/
export function useCardRatio(initialParams) {
  const [aspectRatio, setAspectRatio] = useState(initialParams);

  const calculateRatio = useCallback((height, width) => {
    if (height && width) {
      const isLandscape = height <= width;
      const ratio = isLandscape ? width / height : height / width;

      setAspectRatio(ratio);
    }
  }, []);

  return [aspectRatio, calculateRatio];
}
