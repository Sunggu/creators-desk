import { useMemo } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';

interface OutlineItem {
  level: number;
  text: string;
  lineNumber: number;
}

interface OutlinePanelProps {
  activeFile: FileNodeDto | null;
}

export default function OutlinePanel({ activeFile }: OutlinePanelProps) {
  const headings = useMemo<OutlineItem[]>(() => {
    if (!activeFile || !activeFile.content) return [];
    const lines = activeFile.content.split('\n');
    const list: OutlineItem[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        list.push({
          level: match[1].length,
          text: match[2].trim(),
          lineNumber: index + 1,
        });
      }
    });

    return list;
  }, [activeFile]);

  if (!activeFile) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-zinc-500">
        선택된 문서가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-3 text-xs text-zinc-300">
      <div className="mb-2 text-[11px] font-semibold text-zinc-400 truncate">
        {activeFile.name.replace(/\.md$/i, '')} 의 목차
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {headings.length === 0 ? (
          <div className="py-8 text-center text-zinc-500">
            문서에 작성된 헤딩(#, ##, ###)이 없습니다.
          </div>
        ) : (
          headings.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center rounded px-2 py-1 text-zinc-300 hover:bg-[#222228] hover:text-white transition cursor-pointer"
              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
            >
              <span className="mr-1.5 text-[10px] font-mono text-violet-400">
                {'H' + item.level}
              </span>
              <span className="truncate">{item.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
