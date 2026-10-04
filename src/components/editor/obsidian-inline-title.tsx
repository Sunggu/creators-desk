import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { sanitizeFileName } from '../../utils/name-generator';

interface ObsidianInlineTitleProps {
  title: string;
  onRename?: (newTitle: string) => Promise<unknown> | void;
  onEnter?: () => void;
  autoFocus?: boolean;
}

export default function ObsidianInlineTitle({
  title,
  onRename,
  onEnter,
  autoFocus = false,
}: ObsidianInlineTitleProps) {
  const [val, setVal] = useState(title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setVal(title);
  }, [title]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const commit = () => {
    const sanitized = sanitizeFileName(val);
    if (!sanitized || sanitized === title) {
      setVal(title);
      return;
    }
    setVal(sanitized);
    onRename?.(sanitized);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
      onEnter?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setVal(title);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="max-w-[840px] mx-auto pt-6 px-4 md:px-12 pb-1 select-text">
      <input
        ref={inputRef}
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder="제목 없는 노트"
        aria-label="Note title"
        className="w-full bg-transparent text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight outline-none border-b border-transparent hover:border-[#2e2e38] focus:border-violet-500/70 transition-colors pb-1 placeholder:text-zinc-600 rounded-none"
      />
      <div className="mt-2 border-b border-[#282830]" />
    </div>
  );
}
