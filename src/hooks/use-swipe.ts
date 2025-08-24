import { useEffect, useRef, useState } from 'react';

interface SwipeConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(
  elementRef: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const { minSwipeDistance = 50, maxSwipeTime = 300 } = config;
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsSwiping(true);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      if (deltaTime < maxSwipeTime) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
          if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (deltaX > 0 && handlers.onSwipeRight) {
              handlers.onSwipeRight();
            } else if (deltaX < 0 && handlers.onSwipeLeft) {
              handlers.onSwipeLeft();
            }
          } else {
            // Vertical swipe
            if (deltaY > 0 && handlers.onSwipeDown) {
              handlers.onSwipeDown();
            } else if (deltaY < 0 && handlers.onSwipeUp) {
              handlers.onSwipeUp();
            }
          }
        }
      }

      touchStart.current = null;
      setIsSwiping(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      
      // Prevent default to avoid scrolling during swipe
      e.preventDefault();
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [elementRef, handlers, minSwipeDistance, maxSwipeTime]);

  return { isSwiping };
}
