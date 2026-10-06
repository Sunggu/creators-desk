import { useCallback, useRef, useState } from 'react';

interface UseResizableOptions {
  initial: number;
  min: number;
  max: number;
  direction?: 'horizontal' | 'vertical';
  isRatio?: boolean;
  reverse?: boolean;
}

export function calculateNextSizeHelper(
  currentPos: number,
  startPos: number,
  startSize: number,
  options: {
    min: number;
    max: number;
    isRatio?: boolean;
    containerSize?: number;
    reverse?: boolean;
  }
): number {
  const rawDelta = currentPos - startPos;
  const delta = options.reverse ? -rawDelta : rawDelta;

  if (options.isRatio && options.containerSize && options.containerSize > 0) {
    const deltaRatio = delta / options.containerSize;
    return Math.max(options.min, Math.min(options.max, startSize + deltaRatio));
  }
  return Math.max(options.min, Math.min(options.max, startSize + delta));
}

export function useResizable({
  initial,
  min,
  max,
  direction = 'horizontal',
  isRatio = false,
  reverse = false,
}: UseResizableOptions) {
  const [size, setSize] = useState(initial);
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(initial);

  const startResize = useCallback(
    (e: React.MouseEvent, containerSize?: number) => {
      e.preventDefault();
      setIsResizing(true);
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
      startSizeRef.current = size;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
        const next = calculateNextSizeHelper(currentPos, startPosRef.current, startSizeRef.current, {
          min,
          max,
          isRatio,
          containerSize,
          reverse,
        });
        setSize(next);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [direction, isRatio, max, min, reverse, size]
  );

  return { size, setSize, isResizing, startResize };
}
