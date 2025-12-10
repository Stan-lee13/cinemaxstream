import { useEffect, useRef, useState } from 'react';

interface GestureHandlers {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  lastTapTime: number;
  initialDistance: number;
  initialAngle: number;
}

export const useGestures = (element: HTMLElement | null, handlers: GestureHandlers) => {
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTapTime: 0,
    initialDistance: 0,
    initialAngle: 0,
  });
  // use number|null for browser timers
  const longPressTimer = useRef<number | null>(null);
  const LONG_PRESS_DURATION = 500;
  const DOUBLE_TAP_DELAY = 300;
  const MIN_SWIPE_DISTANCE = 50;

  // Keep a stable ref to handlers so we don't need to re-register listeners when handlers object changes
  const handlersRef = useRef<GestureHandlers>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.atan2(dy, dx);
  };

  useEffect(() => {
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();

      touchState.current = {
        ...touchState.current,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: now,
      };

      if (e.touches.length === 2) {
        touchState.current.initialDistance = getDistance(e.touches);
        touchState.current.initialAngle = getAngle(e.touches);
      }

      // Start long press timer
      if (handlersRef.current.onLongPress) {
        longPressTimer.current = window.setTimeout(() => handlersRef.current.onLongPress!(), LONG_PRESS_DURATION);
      }

      // Check for double tap
      if (handlersRef.current.onDoubleTap) {
        const timeSinceLastTap = now - touchState.current.lastTapTime;
        if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
          handlersRef.current.onDoubleTap!();
          touchState.current.lastTapTime = 0; // Reset to prevent triple tap
        } else {
          touchState.current.lastTapTime = now;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if movement occurs
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (e.touches.length === 2 && (handlersRef.current.onPinch || handlersRef.current.onRotate)) {
        const currentDistance = getDistance(e.touches);
        const currentAngle = getAngle(e.touches);

        if (handlersRef.current.onPinch && touchState.current.initialDistance > 0) {
          const scale = currentDistance / touchState.current.initialDistance;
          handlersRef.current.onPinch(scale);
        }

        if (handlersRef.current.onRotate) {
          const angle = (currentAngle - touchState.current.initialAngle) * (180 / Math.PI);
          handlersRef.current.onRotate(angle);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (handlersRef.current.onSwipe && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchState.current.startX;
        const deltaY = touch.clientY - touchState.current.startY;
        const time = Date.now() - touchState.current.startTime;

        // Ensure the gesture was fast enough to be a swipe
        if (time < 250) {
          if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
            handlersRef.current.onSwipe!(deltaX > 0 ? 'right' : 'left');
          } else if (Math.abs(deltaY) > MIN_SWIPE_DISTANCE) {
            handlersRef.current.onSwipe!(deltaY > 0 ? 'down' : 'up');
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart as EventListener);
    element.addEventListener('touchmove', handleTouchMove as EventListener);
    element.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('touchend', handleTouchEnd as EventListener);
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
  }, [element]);
};

// Haptic feedback utility
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30]);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50]);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  },
};