import { useCallback, useRef, useState } from 'react';

interface UseResizableOptions {
  initial: number;
  min: number;
  max: number;
  direction?: 'horizontal' | 'vertical';
  isRatio?: boolean;
}

export function useResizable({
  initial,
  min,
  max,
  direction = 'horizontal',
  isRatio = false,
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
        const delta = currentPos - startPosRef.current;

        if (isRatio && containerSize && containerSize > 0) {
          const deltaRatio = delta / containerSize;
          const next = Math.max(min, Math.min(max, startSizeRef.current + deltaRatio));
          setSize(next);
        } else {
          const next = Math.max(min, Math.min(max, startSizeRef.current + delta));
          setSize(next);
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [direction, isRatio, max, min, size]
  );

  return { size, setSize, isResizing, startResize };
}
