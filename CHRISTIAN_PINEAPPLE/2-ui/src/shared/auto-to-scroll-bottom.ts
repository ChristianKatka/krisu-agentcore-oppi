import { RefObject } from 'react';

export const autoScrollToBottom = (
  scrollContainerRef: RefObject<HTMLDivElement | null>,
) => {
  if (scrollContainerRef.current) {
    const container = scrollContainerRef.current;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }
};
