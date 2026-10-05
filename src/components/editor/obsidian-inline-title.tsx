import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { INVALID_FILE_NAME_CHARS_REGEX, sanitizeFileName } from '../../utils/name-generator';
import { useTranslate } from '../../i18n/use-i18n';

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
  const t = useTranslate();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 파일명으로 사용할 수 없는 문자(Regex: \ / : * ? " < > | 및 제어문자)를 필터링
    const clean = e.target.value.replace(INVALID_FILE_NAME_CHARS_REGEX, '');
    setVal(clean);
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
    <div className="w-full select-text">
      <input
        ref={inputRef}
        type="text"
        value={val}
        onChange={handleChange}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder={t('editor.titlePlaceholder')}
        aria-label={t('editor.titleAriaLabel')}
        title={t('editor.invalidCharsTitle')}
        className="w-full bg-transparent text-3xl md:text-4xl font-extrabold text-white tracking-tight outline-none border-none placeholder:text-zinc-600 transition-opacity pb-1"
      />
    </div>
  );
}
