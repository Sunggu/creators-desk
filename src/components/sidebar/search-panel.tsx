import { useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface SearchPanelProps {
  nodes: FileNodeDto[];
  onSelectFile: (fileId: string) => void;
  /** Dismisses the mobile drawer once a result is picked. */
  onCloseMobile?: () => void;
}

export default function SearchPanel({ nodes, onSelectFile, onCloseMobile }: SearchPanelProps) {
  const t = useTranslate();
  const [query, setQuery] = useState('');

  const files = nodes.filter((n) => n.type === 'file');
  const filtered = query.trim()
    ? files.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          (f.content && f.content.toLowerCase().includes(query.toLowerCase()))
      )
    : files;

  return (
    <div className="flex h-full flex-col p-3 text-xs text-zinc-300">
      <div className="relative mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('sidebar.searchPlaceholder')}
          className="w-full rounded border border-zinc-700 bg-[#1e1e24] px-3 py-1.5 pl-8 text-zinc-100 placeholder-zinc-500 outline-hidden focus:border-violet-500"
          autoFocus
        />
        <MonochromeIcon name="search" className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        <div className="text-[11px] font-medium text-zinc-500 mb-1 px-1">
          {t('sidebar.searchResults', { count: filtered.length })}
        </div>
        {filtered.map((file) => (
          <div
            key={file.id}
            onClick={() => {
              onSelectFile(file.id);
              onCloseMobile?.();
            }}
            className="flex flex-col rounded p-2 hover:bg-[#222228] transition cursor-pointer"
          >
            <div className="font-semibold text-zinc-200">{file.name.replace(/\.md$/i, '')}</div>
            {file.content && (
              <div className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500 leading-normal">
                {file.content}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-zinc-500">{t('sidebar.searchEmpty')}</div>
        )}
      </div>
    </div>
  );
}
