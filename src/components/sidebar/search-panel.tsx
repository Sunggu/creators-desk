import { useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';

interface SearchPanelProps {
  nodes: FileNodeDto[];
  onSelectFile: (fileId: string) => void;
}

export default function SearchPanel({ nodes, onSelectFile }: SearchPanelProps) {
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
          placeholder="파일 및 본문 검색..."
          className="w-full rounded border border-zinc-700 bg-[#1e1e24] px-3 py-1.5 pl-8 text-zinc-100 placeholder-zinc-500 outline-hidden focus:border-violet-500"
          autoFocus
        />
        <svg
          className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        <div className="text-[11px] font-medium text-zinc-500 mb-1 px-1">
          {filtered.length}개 파일 결과
        </div>
        {filtered.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
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
          <div className="py-8 text-center text-zinc-500">일치하는 검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
