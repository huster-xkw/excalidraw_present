import { useCallback } from "react";

import "./PageFlipOverlay.scss";

const PageFlipOverlay = ({
  direction,
  onAnimationEnd,
}: {
  direction: "forward" | "backward" | null;
  onAnimationEnd: () => void;
}) => {
  const handleAnimationEnd = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  if (!direction) {
    return null;
  }

  return (
    <div
      className={`page-flip-overlay page-flip-${direction}`}
      onAnimationEnd={handleAnimationEnd}
    />
  );
};

export default PageFlipOverlay;
